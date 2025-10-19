# 🔥 Firebase + Stripe Integration Setup Guide

## ✅ What We've Set Up

### 1. Firebase Client Configuration
- **Location**: `src/lib/firebase.js`
- **Services**: Firestore, Auth, Storage
- **Environment**: Uses `VITE_FIREBASE_API_KEY` from `.env` with fallback to hardcoded value

### 2. Firebase Functions (Stripe Webhook)
- **Location**: `functions/index.js`
- **Handles**: Checkout completion, payment success, subscription cancellation
- **Environment**: Uses `.env` file for local development, Firebase config for production

### 3. Environment Variables
- **Root `.env`**: Firebase web app config (VITE_* variables)
- **Functions `.env`**: Stripe secrets (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

#### Root Project (Web App)
```bash
npm install
```

This installs:
- `firebase` (v11.2.0) - Firebase SDK for web

#### Firebase Functions
```bash
cd functions
npm install
```

This installs:
- `dotenv` (v16.4.5) - Environment variable loader
- `stripe` (v17.5.0) - Stripe SDK
- `firebase-admin` & `firebase-functions` - Already installed

---

### Step 2: Configure Environment Variables

#### Root `.env` (Web App)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

The Firebase config is already set with your project values:
```env
VITE_FIREBASE_API_KEY=AIzaSyBjvU60DVPzad8YeejTLovwSuruKL7FG34
VITE_FIREBASE_AUTH_DOMAIN=echomind-pro-launch.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=echomind-pro-launch
VITE_FIREBASE_STORAGE_BUCKET=echomind-pro-launch.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=643933689359
VITE_FIREBASE_APP_ID=1:643933689359:web:ff44d8beb1947a1404357a
```

#### Functions `.env` (Stripe Webhook)
Create `functions/.env`:
```bash
cd functions
cp .env.example .env
```

Then edit `functions/.env` and add your Stripe keys:
```env
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_signing_secret
```

**Where to find these:**
- **STRIPE_SECRET_KEY**: Stripe Dashboard → Developers → API Keys → Secret key
- **STRIPE_WEBHOOK_SECRET**: Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret

---

### Step 3: Test Firebase Connection

Run the test file to verify Firebase is connected:
```bash
npm run dev
```

Then in your browser console or Node:
```javascript
import { testFirebaseConnection } from './src/lib/firebase-test.js';
testFirebaseConnection();
```

Expected output:
```
🔥 Testing Firebase connection...
✅ Firestore connection success!
📊 Found 0 documents in 'test' collection
```

---

### Step 4: Deploy Firebase Functions

#### Option A: Deploy to Production
```bash
cd functions
npm run deploy
```

This will:
1. Deploy the `stripeWebhook` function
2. Give you a URL like: `https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook`

#### Option B: Test Locally with Emulator
```bash
cd functions
npm run serve
```

This runs the function locally at: `http://localhost:5001/echomind-pro-launch/us-central1/stripeWebhook`

---

### Step 5: Configure Stripe Webhook

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your function URL:
   - **Production**: `https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook`
   - **Local Testing**: Use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** and add it to `functions/.env` as `STRIPE_WEBHOOK_SECRET`

---

## 📊 What the Webhook Does

### Event: `checkout.session.completed`
**Triggered**: When a customer completes checkout
**Action**: Creates a new subscription record in Firestore
```javascript
{
  customer: "cus_xxx",
  email: "user@example.com",
  status: "active",
  createdAt: Timestamp
}
```

### Event: `invoice.payment_succeeded`
**Triggered**: When a subscription payment succeeds
**Action**: Updates subscription with last payment timestamp
```javascript
{
  lastPayment: Timestamp
}
```

### Event: `customer.subscription.deleted`
**Triggered**: When a subscription is canceled
**Action**: Marks subscription as canceled
```javascript
{
  status: "canceled",
  canceledAt: Timestamp
}
```

---

## 🧪 Testing the Integration

### Test Stripe Webhook Locally

1. Install Stripe CLI:
   ```bash
   stripe login
   ```

2. Forward webhook events to local function:
   ```bash
   stripe listen --forward-to http://localhost:5001/echomind-pro-launch/us-central1/stripeWebhook
   ```

3. Trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

4. Check Firebase Functions logs:
   ```bash
   cd functions
   npm run logs
   ```

---

## 📁 File Structure

```
echomind/
├── src/
│   └── lib/
│       ├── firebase.js          # Firebase client config
│       └── firebase-test.js     # Connection test utility
├── functions/
│   ├── index.js                 # Stripe webhook handler
│   ├── .env                     # Stripe secrets (gitignored)
│   ├── .env.example             # Template for .env
│   └── package.json             # Dependencies
├── .env                         # Firebase web config (gitignored)
├── .env.example                 # Template for .env
└── FIREBASE_SETUP.md            # This file
```

---

## 🔒 Security Notes

1. **Never commit `.env` files** - They're gitignored by default
2. **API keys in code** - The Firebase API key in `firebase.js` is safe to expose (it's client-side)
3. **Stripe secrets** - Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` private
4. **Production deployment** - Use Firebase config for production:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_xxx"
   firebase functions:config:set stripe.webhook_secret="whsec_xxx"
   ```

---

## 🐛 Troubleshooting

### Firebase connection fails
- Check if `.env` has correct `VITE_FIREBASE_API_KEY`
- Verify Firebase project is active in console
- Check browser console for CORS errors

### Webhook signature verification fails
- Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check that webhook endpoint URL is correct
- Verify Stripe CLI is forwarding to correct URL

### Function deployment fails
- Run `npm install` in `functions/` directory
- Check Node version matches `package.json` (Node 22)
- Verify Firebase project is initialized: `firebase use echomind-pro-launch`

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install` in root and functions)
2. ✅ Configure `.env` files (root and functions)
3. ✅ Test Firebase connection
4. ✅ Deploy Firebase Functions
5. ✅ Configure Stripe webhook endpoint
6. 🚀 Build your subscription flow in the extension!

---

## 📚 Resources

- [Firebase Web SDK Docs](https://firebase.google.com/docs/web/setup)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
