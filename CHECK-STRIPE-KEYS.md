# 🔍 STRIPE KEYS RUNTIME VERIFICATION

## ✅ ADDED TO functions/index.js

I've added runtime verification logging that will check if your Stripe keys are loaded correctly:

```javascript
// 🔍 Runtime verification (logs on function cold start)
console.log("🔍 Stripe key loaded:", process.env.STRIPE_SECRET_KEY ? "✅ present" : "❌ missing");
console.log("🔍 Webhook secret loaded:", process.env.STRIPE_WEBHOOK_SECRET ? "✅ present" : "❌ missing");
console.log("🔍 Monthly price ID loaded:", process.env.STRIPE_PRICE_ID_MONTHLY ? "✅ present" : "❌ missing");
console.log("🔍 Annual price ID loaded:", process.env.STRIPE_PRICE_ID_ANNUAL ? "✅ present" : "❌ missing");
```

---

## 🚀 HOW TO CHECK

### **Step 1: Deploy the Function**
```bash
firebase deploy --only functions
```

### **Step 2: Trigger a Function**
Trigger any function (e.g., create a checkout session) to see the logs.

### **Step 3: Check Firebase Logs**

**Option A: Firebase Console**
1. Go to https://console.firebase.google.com
2. Select your project: `echomind-pro-launch`
3. Click **Functions** in left sidebar
4. Click on any function (e.g., `createCheckoutSession`)
5. Click **Logs** tab
6. Look for the 🔍 verification logs

**Option B: Command Line**
```bash
firebase functions:log
```

---

## ✅ EXPECTED OUTPUT

If everything is configured correctly, you should see:

```
🔍 Stripe key loaded: ✅ present
🔍 Webhook secret loaded: ✅ present
🔍 Monthly price ID loaded: ✅ present
🔍 Annual price ID loaded: ✅ present
```

---

## ❌ IF YOU SEE MISSING KEYS

If you see `❌ missing` for any key:

### **For Local Development (.env file):**
```bash
# Check your functions/.env file has:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
```

### **For Production (Firebase Secrets):**
```bash
# Set the secrets:
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY
firebase functions:secrets:set STRIPE_PRICE_ID_ANNUAL

# Then redeploy:
firebase deploy --only functions
```

---

## 🧪 QUICK TEST

### **Test Locally:**
```bash
cd functions
npm run serve
```

Then check the console output for the 🔍 verification logs.

### **Test in Production:**
```bash
# Deploy
firebase deploy --only functions

# Trigger a function (e.g., via extension)
# Then check logs:
firebase functions:log --only createCheckoutSession
```

---

## 📊 WHAT EACH KEY DOES

| Key | Purpose | Example |
|-----|---------|---------|
| `STRIPE_SECRET_KEY` | Authenticate with Stripe API | `sk_test_51...` |
| `STRIPE_WEBHOOK_SECRET` | Verify webhook signatures | `whsec_...` |
| `STRIPE_PRICE_ID_MONTHLY` | Monthly subscription price | `price_1...` |
| `STRIPE_PRICE_ID_ANNUAL` | Annual subscription price | `price_1...` |

---

## 🔥 DEPLOY NOW!

```bash
firebase deploy --only functions
```

Then check the logs to verify all keys are loaded! ✅

---

## 💡 PRO TIP

These logs only appear on **function cold start** (when the function first loads). To see them again:
1. Wait a few minutes for the function to go cold
2. Or trigger the function from a different region
3. Or redeploy the function

---

## ✅ VERIFICATION COMPLETE!

Once you see all ✅ in the logs, your Stripe integration is ready to go! 🚀💰
