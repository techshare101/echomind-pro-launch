// functions/apiRouter.js
const express = require('express');
const admin = require('firebase-admin');
const Stripe = require('stripe');
const {defineSecret} = require('firebase-functions/params');

const router = express.Router();
// Firebase Admin is already initialized in index.js
const db = admin.firestore();

// Define secrets
const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripePriceMonthly = defineSecret('STRIPE_PRICE_ID_MONTHLY');
const stripePriceAnnual = defineSecret('STRIPE_PRICE_ID_ANNUAL');

// ✅ Check Subscription Status
router.get('/checkSubscription', async (req, res) => {
  try {
    let uid = null;
    let email = null;

    // 🔐 Check for Firebase ID token (secure method)
    if (req.body && req.body.idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(req.body.idToken);
        uid = decodedToken.uid;
        email = decodedToken.email;
        console.log('✅ Authenticated user:', email);
      } catch (authError) {
        console.error('❌ Token verification failed:', authError);
        return res.status(401).json({error: 'Invalid or expired ID token'});
      }
    } else {
      // 🔓 FALLBACK: Support old method for backward compatibility
      uid = req.query.uid || req.body.uid;
      email = req.query.email || req.body.email;
    }

    if (!uid && !email) {
      return res.status(400).json({error: 'Missing uid, email, or idToken'});
    }

    // Look up subscription in Firestore
    let userDoc;
    if (uid) {
      userDoc = await db.collection('user_subscription_status').doc(uid).get();
    }
    
    if (!userDoc || !userDoc.exists) {
      if (email) {
        userDoc = await db.collection('user_subscription_status').doc(email).get();
      }
    }

    if (!userDoc || !userDoc.exists) {
      console.log('❌ No subscription found for', uid || email);
      return res.status(200).json({
        active: false,
        plan: 'free',
        status: 'free',
        unlimited: false,
        message: 'No active subscription found.',
        email: email,
        uid: uid,
      });
    }

    const data = userDoc.data();
    const status = data.status || 'free';
    const plan = data.plan || 'monthly';
    const isActive = status === 'active';
    
    // Calculate renewal date for Pro users
    let renewalDate = null;
    if (isActive && data.updatedAt) {
      const subscriptionStart = data.updatedAt.toDate();
      const daysToAdd = plan === 'annual' ? 365 : 30;
      renewalDate = new Date(subscriptionStart.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    }

    console.log('✅ Subscription check for', uid || email, ':', status, plan);
    return res.status(200).json({
      active: isActive,
      plan: plan,
      plan_type: plan,
      status: status,
      unlimited: isActive,
      renewal_date: renewalDate,
      period_end: renewalDate ? Math.floor(renewalDate.getTime() / 1000) : null,
      customerId: data.customerId || null,
      last_updated: data.last_updated || null,
      email: email,
      uid: uid,
    });
  } catch (error) {
    console.error('❌ Error checking subscription:', error);
    return res.status(500).json({error: error.message});
  }
});

// 💳 Create Stripe Checkout Session
router.post('/createCheckoutSession', async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || stripeSecretKey.value(), {
      apiVersion: '2024-12-18.acacia',
    });

    const plan = req.query.plan || req.body.plan || 'monthly';
    const priceId = plan === 'annual'
      ? (process.env.STRIPE_PRICE_ID_ANNUAL || stripePriceAnnual.value())
      : (process.env.STRIPE_PRICE_ID_MONTHLY || stripePriceMonthly.value());

    const successUrl = process.env.SUCCESS_URL || 'https://echomind-pro-launch.vercel.app/success.html';
    const cancelUrl = process.env.CANCEL_URL || 'https://echomind-pro-launch.vercel.app/pricing.html';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{price: priceId, quantity: 1}],
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      metadata: {plan: plan},
    });

    console.log(`✅ Checkout session created for ${plan}:`, session.id);
    return res.status(200).json({url: session.url, plan: plan, sessionId: session.id});
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    return res.status(500).json({error: error.message});
  }
});

// ⚡ Instant Session Verification
router.get('/verifySessionInstant', async (req, res) => {
  try {
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({error: 'Missing session_id'});
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || stripeSecretKey.value(), {
      apiVersion: '2024-12-18.acacia',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('🔍 Verifying session:', sessionId, 'Payment status:', session.payment_status);

    if (session.payment_status === 'paid') {
      const email = session.customer_details?.email || session.customer_email || 'publicuser@echomind.ai';
      const plan = session.metadata?.plan || 'monthly';

      const subscriptionStart = admin.firestore.Timestamp.now();
      await db.collection('user_subscription_status').doc(email).set({
        status: 'active',
        plan: plan,
        updatedAt: subscriptionStart,
        instantUnlock: true,
        sessionId: sessionId,
        unlimited: true,
      }, {merge: true});

      console.log('⚡ Instant unlock activated for:', email);

      return res.status(200).json({
        status: 'active',
        email: email,
        plan: plan,
      });
    }

    console.log('⏳ Payment not yet completed');
    return res.status(200).json({status: 'pending'});
  } catch (error) {
    console.error('❌ Instant verify error:', error);
    return res.status(500).json({error: error.message});
  }
});

// 🎫 Create Customer Portal Session
router.post('/createCustomerPortalSession', async (req, res) => {
  try {
    const {customerId, email} = req.body;

    if (!customerId && !email) {
      return res.status(400).json({error: 'Missing customerId or email'});
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || stripeSecretKey.value(), {
      apiVersion: '2024-12-18.acacia',
    });

    let stripeCustomerId = customerId;
    if (!stripeCustomerId && email) {
      const userDoc = await db.collection('user_subscription_status').doc(email).get();

      if (userDoc.exists && userDoc.data().customerId) {
        stripeCustomerId = userDoc.data().customerId;
      } else {
        const customers = await stripe.customers.list({email: email, limit: 1});
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
        }
      }
    }

    if (!stripeCustomerId) {
      return res.status(404).json({error: 'Customer not found'});
    }

    const returnUrl = process.env.PORTAL_RETURN_URL || 'https://echomind-pro-launch.vercel.app/dashboard.html';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    console.log('✅ Customer portal session created for:', stripeCustomerId);
    return res.status(200).json({url: portalSession.url});
  } catch (error) {
    console.error('❌ Error creating customer portal:', error);
    return res.status(500).json({error: error.message});
  }
});

module.exports = router;
