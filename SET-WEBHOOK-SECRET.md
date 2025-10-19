# 🔐 SET WEBHOOK SECRET

## ❌ PROBLEM

Your logs show:
```
🔍 Webhook secret loaded: ❌ missing
```

This means the `STRIPE_WEBHOOK_SECRET` Firebase Secret isn't set yet.

---

## 🚀 SOLUTION

### **Step 1: Get Your Webhook Secret**

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint (or create one if needed)
3. Click "Reveal" next to "Signing secret"
4. Copy the value (starts with `whsec_...`)

**OR** if you don't have a webhook endpoint yet:

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "+ Add endpoint"
3. Enter URL: `https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_...`)

---

### **Step 2: Set the Firebase Secret**

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

When prompted, paste your webhook secret (starts with `whsec_...`)

---

### **Step 3: Redeploy Functions**

```bash
firebase deploy --only functions:stripeWebhook
```

---

## ✅ VERIFY

After redeploying, check logs again:

```bash
firebase functions:log --only createCheckoutSession
```

Trigger the function (click "Upgrade" in extension) and you should see:

```
🔍 Stripe key loaded: ✅ present
🔍 Webhook secret loaded: ✅ present  ← FIXED!
🔍 Monthly price ID loaded: ✅ present
🔍 Annual price ID loaded: ✅ present
```

---

## 🔥 QUICK FIX

```bash
# 1. Set the secret (paste whsec_... when prompted)
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# 2. Redeploy webhook function
firebase deploy --only functions:stripeWebhook

# 3. Verify
firebase functions:log
```

---

## 💡 NOTE

The webhook secret is only used by the `stripeWebhook` function, not `createCheckoutSession`. So your checkout flow will work even without it, but you won't get webhook updates for subscription changes.

**SET IT NOW FOR COMPLETE FUNCTIONALITY!** 🔐⚡
