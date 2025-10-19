# 🔐 SET FIREBASE SECRETS NOW!

## ❌ PROBLEM DETECTED

Your deployment shows:
```
🔍 Stripe key loaded: ❌ missing
🔍 Webhook secret loaded: ❌ missing
🔍 Monthly price ID loaded: ❌ missing
🔍 Annual price ID loaded: ❌ missing
```

This means Firebase Secrets aren't set yet!

---

## 🚀 SOLUTION: Set Firebase Secrets

You need to set these 4 secrets in Firebase:

### **Step 1: Get Your Stripe Keys**

Go to https://dashboard.stripe.com/test/apikeys and copy:
- **Secret key** (starts with `sk_test_...`)
- **Webhook signing secret** (starts with `whsec_...`)

Go to https://dashboard.stripe.com/test/products and copy:
- **Monthly price ID** (starts with `price_...`)
- **Annual price ID** (starts with `price_...`)

---

### **Step 2: Set Each Secret**

Run these commands **one at a time**:

```bash
# 1. Set Stripe Secret Key
firebase functions:secrets:set STRIPE_SECRET_KEY
# When prompted, paste: sk_test_51...

# 2. Set Webhook Secret
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# When prompted, paste: whsec_...

# 3. Set Monthly Price ID
firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY
# When prompted, paste: price_1...

# 4. Set Annual Price ID
firebase functions:secrets:set STRIPE_PRICE_ID_ANNUAL
# When prompted, paste: price_1...
```

---

### **Step 3: Redeploy Functions**

After setting all secrets:

```bash
firebase deploy --only functions
```

---

## 📋 QUICK REFERENCE

### **Where to Find Each Value:**

| Secret | Where to Find | Starts With |
|--------|--------------|-------------|
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/test/apikeys | `sk_test_` |
| `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/test/webhooks | `whsec_` |
| `STRIPE_PRICE_ID_MONTHLY` | https://dashboard.stripe.com/test/products | `price_` |
| `STRIPE_PRICE_ID_ANNUAL` | https://dashboard.stripe.com/test/products | `price_` |

---

## 🔍 VERIFY SECRETS ARE SET

After setting secrets, check they exist:

```bash
firebase functions:secrets:access STRIPE_SECRET_KEY
firebase functions:secrets:access STRIPE_WEBHOOK_SECRET
firebase functions:secrets:access STRIPE_PRICE_ID_MONTHLY
firebase functions:secrets:access STRIPE_PRICE_ID_ANNUAL
```

Each should return the value you set.

---

## ✅ EXPECTED OUTPUT AFTER REDEPLOY

After setting secrets and redeploying, you should see:

```
🔍 Stripe key loaded: ✅ present
🔍 Webhook secret loaded: ✅ present
🔍 Monthly price ID loaded: ✅ present
🔍 Annual price ID loaded: ✅ present
```

---

## 🔥 COMPLETE SETUP COMMANDS

```bash
# Set all secrets (run one at a time, paste values when prompted)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY
firebase functions:secrets:set STRIPE_PRICE_ID_ANNUAL

# Redeploy functions
firebase deploy --only functions

# Check logs to verify
firebase functions:log
```

---

## 💡 WHY THIS HAPPENS

- **Local development**: Uses `functions/.env` file
- **Production**: Uses Firebase Secrets (more secure)
- Your `.env` file is NOT deployed (it's in `.gitignore`)
- So you must set secrets manually in Firebase

---

## 🎯 NEXT STEPS

1. ✅ Set all 4 Firebase Secrets (commands above)
2. ✅ Redeploy functions
3. ✅ Check logs to verify ✅ present
4. ✅ Test payment flow

**LET'S SET THOSE SECRETS NOW!** 🔐🚀
