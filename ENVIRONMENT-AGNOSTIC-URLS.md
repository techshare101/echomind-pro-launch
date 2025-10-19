# 🌍 ENVIRONMENT-AGNOSTIC URLS

## ✅ WHAT I UPDATED

### **functions/index.js:**
```javascript
// Environment-agnostic URLs (works locally, Firebase, Vercel)
const successUrl = process.env.SUCCESS_URL || process.env.LOCAL_SUCCESS_URL || "https://echomind-ai.vercel.app/success.html";
const cancelUrl = process.env.CANCEL_URL || process.env.LOCAL_CANCEL_URL || "https://echomind-ai.vercel.app/cancel.html";

const session = await stripe.checkout.sessions.create({
  success_url: successUrl + "?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: cancelUrl,
  metadata: {plan: plan},
});
```

### **Fallback Chain:**
1. **Production:** Uses `SUCCESS_URL` / `CANCEL_URL` (Firebase Secrets)
2. **Local Dev:** Uses `LOCAL_SUCCESS_URL` / `LOCAL_CANCEL_URL` (from `.env`)
3. **Default:** Falls back to hardcoded Vercel URLs

---

## 🔐 SET FIREBASE SECRETS (OPTIONAL)

If you want to use different URLs in production:

```bash
# Set production URLs
firebase functions:secrets:set SUCCESS_URL
# Enter: https://echomind-ai.vercel.app/success.html

firebase functions:secrets:set CANCEL_URL
# Enter: https://echomind-ai.vercel.app/cancel.html
```

**Note:** This is optional! The code already has good defaults.

---

## 💻 LOCAL DEVELOPMENT SETUP

### **Step 1: Create `.env` file**
```bash
cd functions
cp .env.example .env
```

### **Step 2: Edit `.env`**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...

# Local Development URLs
LOCAL_SUCCESS_URL=http://localhost:5173/success.html
LOCAL_CANCEL_URL=http://localhost:5173/cancel.html
```

### **Step 3: Run Locally**
```bash
npm run serve
```

Now local development will use `localhost` URLs!

---

## 🚀 PRODUCTION DEPLOYMENT

### **Option 1: Use Defaults (Recommended)**
Just deploy - the hardcoded Vercel URLs will work:

```bash
firebase deploy --only functions
```

### **Option 2: Use Custom URLs**
Set Firebase Secrets first, then deploy:

```bash
firebase functions:secrets:set SUCCESS_URL
firebase functions:secrets:set CANCEL_URL
firebase deploy --only functions
```

---

## 🧪 HOW IT WORKS

### **Production (Firebase):**
```javascript
process.env.SUCCESS_URL → "https://echomind-ai.vercel.app/success.html"
// OR falls back to hardcoded default
```

### **Local Development:**
```javascript
process.env.LOCAL_SUCCESS_URL → "http://localhost:5173/success.html"
// From functions/.env file
```

### **Fallback:**
```javascript
// If no env vars set, uses:
"https://echomind-ai.vercel.app/success.html"
```

---

## ✅ BENEFITS

1. **No Hardcoding** - URLs come from environment
2. **Local Dev Works** - Uses localhost URLs
3. **Production Ready** - Uses Vercel URLs
4. **Flexible** - Easy to change without code edits
5. **Safe Defaults** - Falls back to working URLs

---

## 📊 URL PRIORITY

```
1. SUCCESS_URL (Firebase Secret)
   ↓
2. LOCAL_SUCCESS_URL (.env file)
   ↓
3. Hardcoded default (Vercel)
```

---

## 🔥 DEPLOY NOW!

```bash
firebase deploy --only functions
```

**Your checkout URLs are now environment-agnostic!** 🌍⚡

---

## 💡 WHEN TO USE EACH

### **Use Defaults (Most Cases):**
- ✅ Simple setup
- ✅ Works immediately
- ✅ No extra configuration

### **Use Firebase Secrets:**
- ✅ Multiple environments (staging, prod)
- ✅ Different domains per environment
- ✅ Need to change URLs without redeploying code

### **Use Local .env:**
- ✅ Local development
- ✅ Testing checkout flow locally
- ✅ Running functions emulator

---

## 🎯 RECOMMENDED SETUP

**For most users:**
1. Keep the hardcoded defaults
2. Use `.env` for local development only
3. Deploy with `firebase deploy --only functions`

**For advanced users:**
1. Set Firebase Secrets for production URLs
2. Use `.env` for local development
3. Deploy with secrets attached

---

## 🚀 QUICK START

```bash
# Deploy with defaults (easiest)
firebase deploy --only functions

# OR set custom URLs first
firebase functions:secrets:set SUCCESS_URL
firebase functions:secrets:set CANCEL_URL
firebase deploy --only functions
```

**YOUR URLS ARE NOW ENVIRONMENT-AGNOSTIC!** 🌍🔥💎
