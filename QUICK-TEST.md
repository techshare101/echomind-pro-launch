# ⚡ Quick Test - Public Checkout

## 🎯 Test RIGHT NOW

Your local server is running at: **http://localhost:8000**

### Option 1: Test Suite (Recommended)
```
👉 http://localhost:8000/test-checkout.html
```

**What to do:**
1. Click "Test Monthly Plan" button
2. Should see: ✅ SUCCESS with checkout URL
3. Click "Open Checkout Page"
4. Use test card: `4242 4242 4242 4242`
5. Complete payment

### Option 2: Pricing Page
```
👉 http://localhost:8000/pricing.html
```

**What to do:**
1. Click "Choose Monthly" ($4.99/month)
2. Should redirect to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
4. Complete payment

---

## 🧪 Test Card

```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

---

## ✅ What Should Happen

1. **Click button** → Loading state
2. **API call** → Firebase function creates checkout session
3. **Redirect** → Stripe Checkout page opens
4. **Enter card** → Test card info
5. **Submit** → Payment processes
6. **Webhook** → stripeWebhook receives event
7. **Firestore** → Subscription status = "active"
8. **Redirect** → Success page (if configured)

---

## 🔍 Debug Commands

If something doesn't work:

```bash
# Check function logs
firebase functions:log --only createCheckoutSession

# Check webhook logs
firebase functions:log --only stripeWebhook

# Verify secrets
firebase functions:secrets:list
```

---

## 📊 Expected Results

### Test Suite Response:
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "plan": "monthly",
  "sessionId": "cs_test_..."
}
```

### Stripe Checkout Page:
- Shows: "EchoMind Pro" or your product name
- Price: $4.99/month or $49.99/year
- Payment form with card input

### After Payment:
- Webhook receives: `checkout.session.completed`
- Firestore updates: `user_subscription_status/[email]`
- Status: `active`

---

## 🚨 Common Issues

### Issue: Button does nothing
**Fix**: Check browser console (F12) for errors

### Issue: "Failed to create checkout session"
**Fix**: Run `firebase functions:log --only createCheckoutSession`

### Issue: Wrong price shown
**Fix**: Verify secrets match Stripe Dashboard

---

## 🎉 Success Indicators

- ✅ Button shows "Loading..." then redirects
- ✅ Stripe Checkout page opens
- ✅ Correct price displayed ($4.99 or $49.99)
- ✅ Test payment completes
- ✅ Webhook logs show event received
- ✅ Firestore shows new subscription

---

**Ready to test? Open the test suite now:**
```
http://localhost:8000/test-checkout.html
```
