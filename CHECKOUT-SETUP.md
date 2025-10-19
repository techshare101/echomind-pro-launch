# 🚀 EchoMind Public Checkout Setup

## ✅ Quick Start Checklist

### 1. Verify Firebase Secrets

Run these commands to confirm all secrets are set:

```bash
# List all secrets
firebase functions:secrets:list

# Should show:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - STRIPE_PRICE_ID_MONTHLY
# - STRIPE_PRICE_ID_ANNUAL
```

Verify the values:

```bash
# Check Stripe Secret Key (should start with sk_test_)
firebase functions:secrets:access STRIPE_SECRET_KEY

# Check Monthly Price ID
firebase functions:secrets:access STRIPE_PRICE_ID_MONTHLY
# Expected: price_1SJLwXGU4RA8uiorT3MyNelK

# Check Annual Price ID
firebase functions:secrets:access STRIPE_PRICE_ID_ANNUAL
# Expected: price_1SJM1TGU4RA8uioraKHqaG83
```

---

### 2. Deploy Cloud Functions

Ensure your functions are deployed:

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy just the checkout function
firebase deploy --only functions:createCheckoutSession
```

**Expected output:**
```
✅ functions[createCheckoutSession(us-central1)] Successful update operation.
Function URL: https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession
```

---

### 3. Test Locally

Start a local web server:

```bash
cd C:\Users\valen\Development\echomind
python -m http.server 8000
```

Open in browser:
- **Test Suite**: http://localhost:8000/test-checkout.html
- **Pricing Page**: http://localhost:8000/pricing.html

---

### 4. Test Checkout Flow

#### Option A: Use Test Suite
1. Open `http://localhost:8000/test-checkout.html`
2. Click "Test Monthly Plan" or "Test Annual Plan"
3. Should see: ✅ SUCCESS with checkout URL
4. Click "Open Checkout Page" to test the full flow

#### Option B: Use Pricing Page
1. Open `http://localhost:8000/pricing.html`
2. Click "Choose Monthly" or "Choose Annual"
3. Should redirect to Stripe Checkout page
4. Use test card: `4242 4242 4242 4242`

---

### 5. Verify Webhook Integration

After a successful test payment:

```bash
# Check webhook logs
firebase functions:log --only stripeWebhook

# Should see:
# ✅ Received event: checkout.session.completed
# ✅ Payment succeeded for: [email]
```

Check Firestore:
1. Go to Firebase Console → Firestore
2. Look for `user_subscription_status` collection
3. Should see new document with `status: "active"`

---

## 🧪 Test Cards

| Card Number | Type | Result |
|------------|------|--------|
| `4242 4242 4242 4242` | Visa | ✅ Success |
| `4000 0000 0000 0002` | Visa | ❌ Decline |
| `4000 0025 0000 3155` | Visa | 🔐 3D Secure |

**Additional Info:**
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

---

## 📊 Current Configuration

### Stripe Products
- **Monthly**: $4.99/month → `price_1SJLwXGU4RA8uiorT3MyNelK`
- **Annual**: $49.99/year → `price_1SJM1TGU4RA8uioraKHqaG83`

### Firebase Functions
- **createCheckoutSession**: Creates Stripe Checkout sessions
- **stripeWebhook**: Handles payment events
- **checkSubscription**: Verifies user subscription status

### Endpoints
- **Checkout**: `https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession`
- **Webhook**: `https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook`
- **Check Sub**: `https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription`

---

## 🔧 Troubleshooting

### Issue: "Failed to create checkout session"

**Check 1: Verify secrets are set**
```bash
firebase functions:secrets:list
```

**Check 2: View function logs**
```bash
firebase functions:log --only createCheckoutSession
```

**Check 3: Test endpoint directly**
```bash
curl -X POST "https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession?plan=monthly"
```

### Issue: Checkout page shows wrong price

**Solution**: Verify Stripe Price IDs match:
```bash
firebase functions:secrets:access STRIPE_PRICE_ID_MONTHLY
firebase functions:secrets:access STRIPE_PRICE_ID_ANNUAL
```

Should match your Stripe Dashboard prices.

### Issue: Webhook not receiving events

**Solution**: Check Stripe Dashboard webhook configuration:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Verify endpoint: `https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook`
3. Verify events: `checkout.session.completed`, `payment_intent.succeeded`

---

## 🚀 Go Live Checklist

- [ ] All Firebase secrets configured
- [ ] Functions deployed successfully
- [ ] Test checkout works (monthly)
- [ ] Test checkout works (annual)
- [ ] Webhook receives events
- [ ] Firestore updates subscription status
- [ ] Pricing page shows correct prices ($4.99 & $49.99)
- [ ] Success/cancel pages created
- [ ] Switch from test mode to live mode in Stripe
- [ ] Update secrets with live Stripe keys
- [ ] Deploy pricing page to production domain

---

## 📞 Support

If you encounter issues:
1. Check function logs: `firebase functions:log`
2. Check Stripe Dashboard → Developers → Logs
3. Use test-checkout.html for debugging
4. Verify all secrets are set correctly

---

## 🎯 Next Steps

1. **Create Success Page**: Show confirmation after payment
2. **Create Cancel Page**: Handle checkout cancellation
3. **Add to Extension**: Integrate upgrade button in Chrome extension
4. **Email Notifications**: Send confirmation emails
5. **Analytics**: Track conversion rates
6. **A/B Testing**: Test different pricing strategies
