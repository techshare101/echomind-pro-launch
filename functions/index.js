const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {defineSecret} = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");
const express = require("express");
const cors = require("./corsConfig");
const nodemailer = require("nodemailer");

// Load environment variables from .env file (for local development)
require("dotenv").config();

// ✅ Initialize Firebase Admin BEFORE importing apiRouter
if (!admin.apps.length) {
  admin.initializeApp();
}

const apiRouter = require("./apiRouter");
const db = admin.firestore();

// Define secrets for 2nd-gen functions
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const stripePriceMonthly = defineSecret("STRIPE_PRICE_ID_MONTHLY");
const stripePriceAnnual = defineSecret("STRIPE_PRICE_ID_ANNUAL");
const contactEmail = defineSecret("CONTACT_EMAIL");
const contactEmailPassword = defineSecret("CONTACT_EMAIL_PASSWORD");

// Stripe webhook handler
exports.stripeWebhook = onRequest(
    {
      timeoutSeconds: 60,
      memory: "256MiB",
      region: "us-central1",
      secrets: [stripeSecretKey, stripeWebhookSecret, stripePriceMonthly, stripePriceAnnual],
    },
    async (req, res) => {
  // 🔍 Runtime verification for webhook (forces secret attachment)
  console.log("🔍 Webhook - Stripe key loaded:", process.env.STRIPE_SECRET_KEY ? "✅ present" : "❌ missing");
  console.log("🔍 Webhook - Webhook secret loaded:", process.env.STRIPE_WEBHOOK_SECRET ? "✅ present" : "❌ missing");
  console.log("🔍 Webhook - Monthly price ID loaded:", process.env.STRIPE_PRICE_ID_MONTHLY ? "✅ present" : "❌ missing");
  console.log("🔍 Webhook - Annual price ID loaded:", process.env.STRIPE_PRICE_ID_ANNUAL ? "✅ present" : "❌ missing");
  
  // Initialize Stripe with the secret value and API version
  const stripe = new Stripe(stripeSecretKey.value(), {
    apiVersion: "2024-12-18.acacia",
  });
  
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("❌ Missing Stripe signature");
    return res.status(400).send("Missing Stripe signature");
  }
  
  const endpointSecret = stripeWebhookSecret.value();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Received event:", event.type);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const customerEmail = paymentIntent.receipt_email;
      console.log("✅ Payment succeeded for:", customerEmail);

      if (customerEmail) {
        const userRef = db
            .collection("user_subscription_status")
            .doc(customerEmail);
        await userRef.set(
            {
              status: "active",
              unlimited: true, // Pro users get unlimited audits
              lastUpdated: admin.firestore.Timestamp.now(),
            },
            {merge: true},
        );
        console.log(
            "🔥 Updated Firestore subscription status for",
            customerEmail,
        );
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object;
      const plan = session.metadata?.plan || "monthly"; // Get plan from metadata
      const email = session.customer_details?.email || session.customer_email;
      
      // Store in subscriptions collection
      await db.collection("subscriptions").doc(session.id).set({
        customer: session.customer,
        customerId: session.customer,
        email: email,
        status: "active",
        plan: plan,
        unlimited: true,
        createdAt: admin.firestore.Timestamp.now(),
      });
      
      // Also update user_subscription_status for quick lookups
      if (email) {
        await db.collection("user_subscription_status").doc(email).set({
          status: "active",
          plan: plan,
          customerId: session.customer,
          unlimited: true,
          updatedAt: admin.firestore.Timestamp.now(),
        }, {merge: true});
      }
      
      console.log(`✅ Checkout session completed: ${session.id} (${plan})`);
      console.log(`🔥 Pro ${plan} activated for: ${email}`);
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      await db.collection("subscriptions").doc(invoice.subscription).update({
        lastPayment: admin.firestore.Timestamp.now(),
      });
      console.log("💸 Payment succeeded for:", invoice.subscription);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const email = subscription.metadata?.email || null;
      
      // Update subscription status
      const updateData = {
        status: subscription.status,
        plan: subscription.items.data[0]?.price?.recurring?.interval || "monthly",
        updatedAt: admin.firestore.Timestamp.now(),
      };
      
      // Update user_subscription_status if we have email
      if (email) {
        await db.collection("user_subscription_status").doc(email).update(updateData);
        console.log(`🔄 Subscription updated for ${email}:`, subscription.status);
      }
      
      // Also update subscriptions collection
      await db.collection("subscriptions").doc(subscription.id).update(updateData);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const email = subscription.metadata?.email || null;
      
      const cancelData = {
        status: "canceled",
        unlimited: false,
        canceledAt: admin.firestore.Timestamp.now(),
      };
      
      // Update user_subscription_status
      if (email) {
        await db.collection("user_subscription_status").doc(email).update(cancelData);
        console.log(`🛑 Subscription canceled for ${email}`);
      }
      
      // Update subscriptions collection
      await db.collection("subscriptions").doc(subscription.id).update(cancelData);
      console.log("🛑 Subscription canceled:", subscription.id);
      break;
    }

    default:
      console.log("ℹ️  Unhandled event type:", event.type);
  }

  res.status(200).send("Success");
    },
);

// 🔥 UNIFIED API ENDPOINT - All routes under /api
const app = express();
app.use(cors);
app.use(express.json());

// Mount the unified router (flattened routes)
app.use('/', apiRouter);

// Health check / default route
app.get('/', (req, res) => {
  res.json({
    status: '🔥 EchoMind Pro API running',
    version: '2.0',
    endpoints: [
      '/checkSubscription',
      '/createCheckoutSession',
      '/verifySessionInstant',
      '/createCustomerPortalSession',
    ],
  });
});

// Deploy as a single unified function
exports.api = onRequest(
    {
      region: "us-central1",
      cors: true,
      secrets: [stripeSecretKey, stripePriceMonthly, stripePriceAnnual],
      timeoutSeconds: 60,
      memory: "256MiB",
    },
    app,
);

// ✅ LEGACY ENDPOINTS (kept for backward compatibility - will be deprecated)
// ✅ Verify user subscription status
exports.checkSubscription = onRequest(
    {
      region: "us-central1",
      cors: true,
      secrets: [stripeSecretKey],
    },
    async (req, res) => {
  try {
    // Allow CORS for Chrome Extension calls
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    let uid = null;
    let email = null;

    // 🔐 NEW: Check for Firebase ID token (secure method)
    if (req.body && req.body.idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(req.body.idToken);
        uid = decodedToken.uid;
        email = decodedToken.email;
        console.log("✅ Authenticated user:", email);
      } catch (authError) {
        console.error("❌ Token verification failed:", authError);
        return res.status(401).json({error: "Invalid or expired ID token"});
      }
    } else {
      // 🔓 FALLBACK: Support old method for backward compatibility
      uid = req.query.uid || req.body.uid;
      email = req.query.email || req.body.email;
    }

    if (!uid && !email) {
      return res.status(400).json({error: "Missing uid, email, or idToken"});
    }

    // Look up subscription in Firestore
    let userDoc;
    if (uid) {
      userDoc = await db
          .collection("user_subscription_status")
          .doc(uid)
          .get();
    }
    
    if (!userDoc || !userDoc.exists) {
      if (email) {
        userDoc = await db
            .collection("user_subscription_status")
            .doc(email)
            .get();
      }
    }

    if (!userDoc || !userDoc.exists) {
      console.log("❌ No subscription found for", uid || email);
      return res.status(200).json({
        active: false,
        plan: "free",
        status: "free",
        unlimited: false,
        message: "No active subscription found.",
        email: email,
        uid: uid,
      });
    }

    const data = userDoc.data();
    const status = data.status || "free";
    const plan = data.plan || "monthly";
    const isActive = status === "active";
    
    // Calculate renewal date for Pro users
    let renewalDate = null;
    if (isActive && data.updatedAt) {
      const subscriptionStart = data.updatedAt.toDate();
      const daysToAdd = plan === "annual" ? 365 : 30;
      renewalDate = new Date(subscriptionStart.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    }

    console.log("✅ Subscription check for", uid || email, ":", status, plan);
    return res.status(200).json({
      active: isActive,
      plan: plan,
      plan_type: plan, // For dashboard compatibility
      status: status,
      unlimited: isActive, // Pro users get unlimited audits
      renewal_date: renewalDate,
      period_end: renewalDate ? Math.floor(renewalDate.getTime() / 1000) : null,
      customerId: data.customerId || null, // Stripe customer ID for portal
      last_updated: data.last_updated || null,
      email: email,
      uid: uid,
    });
  } catch (error) {
    console.error("❌ Error checking subscription:", error);
    return res.status(500).json({error: error.message});
  }
    },
);

// 💳 Create Stripe Checkout Session for "Upgrade to Pro" (Multi-tier)
exports.createCheckoutSession = onRequest(
    {
      secrets: [stripeSecretKey, stripePriceMonthly, stripePriceAnnual],
      cors: true,
      region: "us-central1",
    },
    async (req, res) => {
      try {
        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey.value(), {
          apiVersion: "2024-12-18.acacia",
        });

        // Get plan type from query parameter (default to monthly)
        const plan = req.query.plan || "monthly";

        // Select price based on plan
        const priceId = plan === "annual"
          ? stripePriceAnnual.value()
          : stripePriceMonthly.value();

        // Environment-agnostic URLs (works locally, Firebase, Vercel)
        const successUrl = process.env.SUCCESS_URL || "https://echomind-pro-launch.vercel.app/success.html";
        const cancelUrl = process.env.CANCEL_URL || "https://echomind-pro-launch.vercel.app/pricing.html";

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [{price: priceId, quantity: 1}],
          success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: cancelUrl,
          metadata: {plan: plan},
        });

        console.log(`✅ Checkout session created for ${plan}:`, session.id);
        return res.status(200).json({url: session.url, plan: plan, sessionId: session.id});
      } catch (error) {
        console.error("❌ Error creating checkout session:", error);
        return res.status(500).json({error: error.message});
      }
    },
);

// ⚡ Instant Session Verification (for immediate Pro unlock)
exports.verifySessionInstant = onRequest(
    {
      secrets: [stripeSecretKey],
      cors: true,
      region: "us-central1",
    },
    async (req, res) => {
      try {
        const sessionId = req.query.session_id;

        if (!sessionId) {
          return res.status(400).json({error: "Missing session_id"});
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey.value(), {
          apiVersion: "2024-12-18.acacia",
        });

        // Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log("🔍 Verifying session:", sessionId, "Payment status:", session.payment_status);

        if (session.payment_status === "paid") {
          const email = session.customer_details?.email || session.customer_email || "publicuser@echomind.ai";
          const plan = session.metadata?.plan || "monthly";

          // Instantly mark as active in Firestore
          const subscriptionStart = admin.firestore.Timestamp.now();
          await db.collection("user_subscription_status").doc(email).set({
            status: "active",
            plan: plan,
            updatedAt: subscriptionStart,
            instantUnlock: true,
            sessionId: sessionId,
            unlimited: true, // Pro users get unlimited audits
          }, {merge: true});

          console.log("⚡ Instant unlock activated for:", email);

          return res.status(200).json({
            status: "active",
            email: email,
            plan: plan,
          });
        }

        console.log("⏳ Payment not yet completed");
        return res.status(200).json({status: "pending"});
      } catch (error) {
        console.error("❌ Instant verify error:", error);
        return res.status(500).json({error: error.message});
      }
    },
);

// 🎫 Create Stripe Customer Portal Session (for subscription management)
exports.createCustomerPortalSession = onRequest(
    {
      secrets: [stripeSecretKey],
      cors: true,
      region: "us-central1",
      timeoutSeconds: 60,
    },
    async (req, res) => {
      try {
        // Allow CORS
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");

        if (req.method === "OPTIONS") {
          return res.status(204).send("");
        }

        const {customerId, email} = req.body;

        if (!customerId && !email) {
          return res.status(400).json({error: "Missing customerId or email"});
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey.value(), {
          apiVersion: "2024-12-18.acacia",
        });

        // If email provided, find customer ID
        let stripeCustomerId = customerId;
        if (!stripeCustomerId && email) {
          // Look up customer by email in Firestore
          const userDoc = await db
              .collection("user_subscription_status")
              .doc(email)
              .get();

          if (userDoc.exists && userDoc.data().customerId) {
            stripeCustomerId = userDoc.data().customerId;
          } else {
            // Try to find customer in Stripe by email
            const customers = await stripe.customers.list({email: email, limit: 1});
            if (customers.data.length > 0) {
              stripeCustomerId = customers.data[0].id;
            }
          }
        }

        if (!stripeCustomerId) {
          return res.status(404).json({error: "Customer not found"});
        }

        // Create portal session
        const returnUrl = process.env.PORTAL_RETURN_URL ||
          "https://echomind-ai.vercel.app/dashboard.html";

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: returnUrl,
        });

        console.log("✅ Customer portal session created for:", stripeCustomerId);
        return res.status(200).json({url: portalSession.url});
      } catch (error) {
        console.error("❌ Error creating customer portal:", error);
        return res.status(500).json({error: error.message});
      }
    },
);

// 📧 Contact Form Email Notification
// Triggers when a new document is created in contact_messages collection
exports.sendContactEmail = onDocumentCreated(
    {
      document: "contact_messages/{messageId}",
      region: "us-central1",
      secrets: [contactEmail, contactEmailPassword],
    },
    async (event) => {
      try {
        const messageData = event.data.data();
        const messageId = event.params.messageId;

        // Safely extract data with defaults
        const name = messageData.name || "Unknown User";
        const email = messageData.email || "no-email@provided.com";
        const message = messageData.message || "(no message)";
        const source = messageData.source || "dashboard";

        console.log("📧 New contact message received:", messageId);
        console.log("📧 From:", name, email);

        // Get secret values
        const senderEmail = contactEmail.value();
        const senderPassword = contactEmailPassword.value();

        if (!senderEmail || !senderPassword) {
          throw new Error("Missing email credentials");
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: senderEmail,
            pass: senderPassword,
          },
        });

        // Format timestamp
        const timestamp = messageData.timestamp ?
          messageData.timestamp.toDate().toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "long",
          }) :
          new Date().toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "long",
          });

        // Email options
        const mailOptions = {
          from: `"EchoMind Pro" <${senderEmail}>`,
          to: "contact@metalmindtech.com",
          subject: `📬 New EchoMind Contact: ${name}`,
          text: `
New message from EchoMind Pro Contact Form

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
Email: ${email}
Source: ${source}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Timestamp: ${timestamp}
Message ID: ${messageId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reply to: ${email}
          `,
          html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; }
    .field { margin-bottom: 20px; }
    .label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { margin-top: 5px; font-size: 16px; color: #1e293b; }
    .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin: 20px 0; white-space: pre-wrap; }
    .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
    .reply-button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Contact Message</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">EchoMind Pro Dashboard</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From</div>
        <div class="value">${name}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}" style="color: #8b5cf6;">${email}</a></div>
      </div>
      <div class="field">
        <div class="label">Source</div>
        <div class="value">${source}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">${message}</div>
      </div>
      <div class="field">
        <div class="label">Timestamp</div>
        <div class="value">${timestamp}</div>
      </div>
      <div style="text-align: center;">
        <a href="mailto:${email}" class="reply-button">Reply to ${name}</a>
      </div>
      <div class="footer">
        <p>Message ID: ${messageId}</p>
        <p>© 2025 EchoMind Pro — Powered by MetalMindTech</p>
      </div>
    </div>
  </div>
</body>
</html>
          `,
        };

        // Send notification email to MetalMindTech
        await transporter.sendMail(mailOptions);
        console.log("✅ Contact email sent successfully to contact@metalmindtech.com");

        // Send auto-reply confirmation to user
        const autoReplyOptions = {
          from: `"EchoMind Pro" <${senderEmail}>`,
          to: email,
          subject: "✅ We received your message - EchoMind Pro",
          text: `
Hi ${name},

Thank you for contacting EchoMind Pro!

We've received your message and our team will review it shortly. We typically respond within 24 hours.

Your message:
"${message}"

If you have any urgent questions, you can also reach us directly at contact@metalmindtech.com.

Best regards,
The EchoMind Pro Team
Powered by MetalMindTech

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated confirmation. Please do not reply to this email.
          `,
          html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
    .header p { margin: 10px 0 0 0; opacity: 0.95; font-size: 16px; }
    .content { background: #ffffff; padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; }
    .message-box { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #8b5cf6; margin: 25px 0; }
    .message-label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
    .message-text { color: #475569; font-style: italic; line-height: 1.8; }
    .info-box { background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .info-box p { margin: 0; color: #065f46; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; }
    .contact-link { color: #8b5cf6; text-decoration: none; font-weight: 600; }
    .contact-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Message Received</h1>
      <p>We'll get back to you soon!</p>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name},</div>
      <p>Thank you for contacting <strong>EchoMind Pro</strong>!</p>
      <p>We've received your message and our team will review it shortly. We typically respond within <strong>24 hours</strong>.</p>
      
      <div class="message-box">
        <div class="message-label">Your Message</div>
        <div class="message-text">"${message}"</div>
      </div>

      <div class="info-box">
        <p><strong>💡 Need immediate help?</strong></p>
        <p>You can reach us directly at <a href="mailto:contact@metalmindtech.com" class="contact-link">contact@metalmindtech.com</a></p>
      </div>

      <p style="margin-top: 30px; color: #64748b;">
        Best regards,<br>
        <strong style="color: #1e293b;">The EchoMind Pro Team</strong><br>
        <span style="font-size: 13px;">Powered by MetalMindTech</span>
      </p>
    </div>
    <div class="footer">
      <p><strong>EchoMind Pro</strong> — AI-Powered Content Intelligence</p>
      <p style="font-size: 12px; margin-top: 15px;">This is an automated confirmation. Please do not reply to this email.</p>
      <p style="font-size: 12px;">© 2025 MetalMindTech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
          `,
        };

        try {
          await transporter.sendMail(autoReplyOptions);
          console.log("✅ Auto-reply sent to user:", messageData.email);
        } catch (replyError) {
          console.error("⚠️ Auto-reply failed (non-critical):", replyError.message);
          // Don't fail the whole function if auto-reply fails
        }

        // Update message status in Firestore
        await event.data.ref.update({
          emailSent: true,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          autoReplySent: true,
        });

        return {success: true};
      } catch (error) {
        console.error("❌ Error sending contact email:", error);
        
        // Update message with error status
        try {
          await event.data.ref.update({
            emailSent: false,
            emailError: error.message,
            emailErrorAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (updateError) {
          console.error("❌ Error updating message status:", updateError);
        }

        // Don't throw - we don't want to retry email sends
        return {success: false, error: error.message};
      }
    },
);
