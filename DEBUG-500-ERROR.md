# 🔥 DEBUG HTTP 500 ERROR

## ❌ PROBLEM

You're getting:
```
Failed to create checkout session: HTTP 500
```

This means the `createCheckoutSession` function is crashing on the server.

---

## 🔍 STEP 1: Check Firebase Logs

Run this command to see the actual error:

```bash
firebase functions:log --only createCheckoutSession
```

Look for error messages that show what's failing.

---

## 🧩 COMMON CAUSES

### **1. Missing Stripe Secret Key**
If you see:
```
Error: Stripe API key is required
```

**Fix:**
```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
# Paste your sk_test_... key
firebase deploy --only functions:createCheckoutSession
```

### **2. Invalid Price ID**
If you see:
```
Error: No such price: 'price_...'
```

**Fix:**
```bash
firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY
# Paste correct price ID from Stripe dashboard
firebase deploy --only functions:createCheckoutSession
```

### **3. Stripe API Version Mismatch**
If you see:
```
Error: Invalid API version
```

**Fix:** Update the API version in `functions/index.js`:
```javascript
const stripe = new Stripe(stripeSecretKey.value(), {
  apiVersion: "2024-12-18.acacia", // Latest version
});
```

### **4. CORS Error**
If you see:
```
Error: CORS policy
```

**Fix:** Add CORS headers in `functions/index.js`:
```javascript
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'GET, POST');
```

---

## 🚀 QUICK DEBUG STEPS

### **Step 1: Check Logs**
```bash
firebase functions:log --only createCheckoutSession --limit 50
```

### **Step 2: Test Locally**
```bash
cd functions
npm run serve
```

Then test from your extension.

### **Step 3: Verify Secrets**
```bash
firebase functions:secrets:access STRIPE_SECRET_KEY
firebase functions:secrets:access STRIPE_PRICE_ID_MONTHLY
```

Both should return valid values.

---

## 🔍 DETAILED DEBUGGING

### **Check Function Code**

Look at `functions/index.js` around line 204:

```javascript
const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  payment_method_types: ["card"],
  line_items: [{price: priceId, quantity: 1}],
  success_url: "https://echomind-ai.vercel.app/success.html?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://echomind-ai.vercel.app/cancel.html",
  metadata: {plan: plan},
});
```

**Common issues:**
- ❌ `priceId` is undefined
- ❌ `success_url` is invalid
- ❌ Stripe key is wrong

---

## 🧪 TEST WITH CURL

Test the function directly:

```bash
curl -X POST "https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession?plan=monthly"
```

This should return a checkout URL or an error message.

---

## 💡 MOST LIKELY CAUSE

Based on your earlier logs showing:
```
🔍 Stripe key loaded: ✅ present
🔍 Monthly price ID loaded: ✅ present
```

The issue is probably:
1. **Invalid price ID** - The price doesn't exist in Stripe
2. **Wrong Stripe account** - Using test key but prod price ID (or vice versa)
3. **API version mismatch**

---

## 🔥 IMMEDIATE FIX

### **Step 1: Get Full Error**
```bash
firebase functions:log --only createCheckoutSession
```

Copy the full error message and share it.

### **Step 2: Verify Price IDs**

Go to https://dashboard.stripe.com/test/products

Make sure your price IDs match exactly:
- Monthly: `price_1...`
- Annual: `price_1...`

### **Step 3: Update Secrets if Needed**
```bash
firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY
# Paste correct price ID
firebase deploy --only functions:createCheckoutSession
```

---

## 📊 CHECKLIST

- [ ] Run `firebase functions:log` to see error
- [ ] Verify Stripe secret key is correct
- [ ] Verify price IDs exist in Stripe dashboard
- [ ] Check price IDs are for TEST mode (not live)
- [ ] Verify success_url is accessible
- [ ] Test function locally with `npm run serve`

---

## 🚀 NEXT STEPS

1. **Run this command:**
   ```bash
   firebase functions:log --only createCheckoutSession --limit 50
   ```

2. **Find the error message** (look for "Error:", "Failed:", etc.)

3. **Share the error** so I can help fix it!

**LET'S GET THOSE LOGS!** 🔍⚡
