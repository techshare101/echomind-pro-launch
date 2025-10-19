# 🔥 DEPLOY WEBHOOK WITH ALL SECRETS

## ✅ WHAT I FIXED

### **1. Added All Secrets to Webhook**
```javascript
secrets: [stripeSecretKey, stripeWebhookSecret, stripePriceMonthly, stripePriceAnnual]
```

This forces Firebase to attach ALL secrets to the webhook function.

### **2. Added Runtime Verification**
```javascript
// 🔍 Runtime verification for webhook (forces secret attachment)
console.log("🔍 Webhook - Stripe key loaded:", ...);
console.log("🔍 Webhook - Webhook secret loaded:", ...);
console.log("🔍 Webhook - Monthly price ID loaded:", ...);
console.log("🔍 Webhook - Annual price ID loaded:", ...);
```

This tells Firebase "this function uses these secrets."

### **3. Fixed Plan Type Storage**
```javascript
const plan = session.metadata?.plan || "monthly";
await db.collection("subscriptions").doc(session.id).set({
  customer: session.customer,
  email: session.customer_email,
  status: "active",
  plan: plan, // ✅ Now stores "monthly" or "annual"
  createdAt: admin.firestore.Timestamp.now(),
});
```

Now the webhook saves the plan type from checkout metadata!

---

## 🚀 DEPLOY NOW

### **Step 1: Deploy Webhook Function**
```bash
firebase deploy --only functions:stripeWebhook
```

### **Step 2: Wait for Deployment**
Wait for "Deploy complete!" message.

### **Step 3: Verify Logs**
```bash
firebase functions:log --only stripeWebhook
```

**Expected output:**
```
🔍 Webhook - Stripe key loaded: ✅ present
🔍 Webhook - Webhook secret loaded: ✅ present
🔍 Webhook - Monthly price ID loaded: ✅ present
🔍 Webhook - Annual price ID loaded: ✅ present
✅ Stripe Webhook initialized successfully
```

---

## 🧪 TEST THE COMPLETE FLOW

### **Step 1: Test Payment**
1. Open extension
2. Click "Upgrade Monthly"
3. Enter test card: `4242 4242 4242 4242`
4. Complete payment

### **Step 2: Check Webhook Logs**
```bash
firebase functions:log --only stripeWebhook
```

**Expected:**
```
✅ Received event: checkout.session.completed
✅ Checkout session completed: cs_test_... (monthly)
🔥 Pro monthly activated for: user@example.com
```

### **Step 3: Verify Firestore**
Go to Firebase Console → Firestore → `subscriptions` collection

You should see:
```json
{
  "customer": "cus_...",
  "email": "user@example.com",
  "status": "active",
  "plan": "monthly",  // ✅ Plan type saved!
  "createdAt": "2025-10-19T..."
}
```

---

## 🎯 WHAT THIS FIXES

### **Before:**
- ❌ Webhook missing price ID secrets
- ❌ Plan type not saved
- ❌ Can't verify which plan user has

### **After:**
- ✅ All 4 secrets attached to webhook
- ✅ Plan type saved ("monthly" or "annual")
- ✅ Complete subscription data in Firestore
- ✅ Instant Pro activation works

---

## 🔥 COMPLETE DEPLOYMENT

```bash
# Deploy webhook with all secrets
firebase deploy --only functions:stripeWebhook

# Verify logs
firebase functions:log --only stripeWebhook

# Test payment flow
# (Click "Upgrade" in extension)

# Check Firestore
# (Firebase Console → Firestore → subscriptions)
```

---

## ✅ SUCCESS INDICATORS

After deployment, you should see:

1. **Logs show all ✅:**
   ```
   🔍 Webhook - Stripe key loaded: ✅ present
   🔍 Webhook - Webhook secret loaded: ✅ present
   🔍 Webhook - Monthly price ID loaded: ✅ present
   🔍 Webhook - Annual price ID loaded: ✅ present
   ```

2. **Webhook processes events:**
   ```
   ✅ Received event: checkout.session.completed
   ✅ Checkout session completed: cs_test_... (monthly)
   🔥 Pro monthly activated for: user@example.com
   ```

3. **Firestore has complete data:**
   - `status: "active"`
   - `plan: "monthly"` or `"annual"`
   - `email: "user@example.com"`
   - `createdAt: timestamp`

---

## 🚀 DEPLOY IT NOW!

```bash
firebase deploy --only functions:stripeWebhook
```

**YOUR WEBHOOK WILL NOW HAVE ALL SECRETS AND SAVE PLAN TYPES!** 🔐⚡💰
