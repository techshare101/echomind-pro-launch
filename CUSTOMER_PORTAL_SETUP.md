# 🎫 Stripe Customer Portal Integration - Complete Guide

## ✅ What's Implemented

### 1. **Enhanced Firebase Functions**

#### `createCustomerPortalSession` (NEW)
- Creates Stripe Billing Portal sessions
- Allows users to manage subscriptions, update payment methods, view invoices
- Automatically redirects back to dashboard after changes

#### `checkSubscription` (ENHANCED)
- Now returns `customerId` for portal access
- Returns `period_end` timestamp for renewal dates
- Returns `plan_type` for dashboard display

#### `stripeWebhook` (ENHANCED)
- Auto-syncs subscription updates from Stripe
- Handles `customer.subscription.updated` events
- Handles `customer.subscription.deleted` events
- Updates Firestore in real-time when users cancel/modify subscriptions

### 2. **Beautiful Dashboard UI**
- Modern gradient design matching pricing page
- Real-time subscription status with animated badges
- "Manage Subscription" button (opens Stripe portal)
- "Upgrade to Pro" button (redirects to pricing)
- Renewal date display
- Loading states and error handling

---

## 🚀 How It Works

### User Flow

```
1. User clicks "Manage Subscription" on dashboard
   ↓
2. Dashboard calls createCustomerPortalSession
   ↓
3. Firebase function creates Stripe portal session
   ↓
4. User redirects to Stripe Billing Portal
   ↓
5. User can:
   - Update payment method
   - Cancel subscription
   - Switch plans (monthly ↔ annual)
   - View invoices
   - Download receipts
   ↓
6. User clicks "Return to Dashboard"
   ↓
7. Stripe webhook fires (subscription.updated/deleted)
   ↓
8. Firebase auto-updates Firestore
   ↓
9. Dashboard shows updated status
```

---

## 🔧 Firebase Functions

### createCustomerPortalSession

**Endpoint:** `https://us-central1-echomind-pro-launch.cloudfunctions.net/createCustomerPortalSession`

**Request:**
```json
{
  "customerId": "cus_xxxxx",  // Optional if email provided
  "email": "user@example.com"  // Optional if customerId provided
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/xxxxx"
}
```

**Features:**
- Accepts either `customerId` or `email`
- Looks up customer in Firestore if only email provided
- Falls back to Stripe customer search
- Returns portal URL for immediate redirect

### checkSubscription (Enhanced)

**Endpoint:** `https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription`

**Request:** `GET ?email=user@example.com`

**Response:**
```json
{
  "active": true,
  "plan": "monthly",
  "plan_type": "monthly",
  "status": "active",
  "unlimited": true,
  "renewal_date": "2025-11-20T00:00:00.000Z",
  "period_end": 1761456000,
  "customerId": "cus_xxxxx",
  "last_updated": null
}
```

### stripeWebhook (Enhanced)

**Handles Events:**
- ✅ `checkout.session.completed` - New subscription
- ✅ `payment_intent.succeeded` - Payment success
- ✅ `invoice.payment_succeeded` - Recurring payment
- ✅ `customer.subscription.updated` - Plan changes
- ✅ `customer.subscription.deleted` - Cancellations

**Auto-Updates:**
- `user_subscription_status` collection (by email)
- `subscriptions` collection (by subscription ID)

---

## 📱 Dashboard Features

### Status Badges
- **✅ Active** (green gradient) - Active subscription
- **⚠️ Free Plan** (red outline) - No subscription
- **🔄 Loading** (teal outline) - Checking status

### Buttons
- **💳 Manage Subscription** - Opens Stripe portal (Pro users only)
- **🚀 Upgrade to Pro** - Redirects to pricing (Free users only)
- **🔐 Memory Vault** - Access saved summaries
- **🚪 Logout** - Clear session and return home

### Information Display
- Plan type (Monthly/Annual)
- Renewal date (formatted)
- Status badge with animation
- Error messages if API fails

---

## 🧪 Testing Guide

### Test Customer Portal

1. **Create a test subscription:**
   ```bash
   # Open pricing page
   start pricing.html
   
   # Click "Choose Monthly"
   # Use test card: 4242 4242 4242 4242
   # Complete checkout
   ```

2. **Access dashboard:**
   ```bash
   # Open dashboard
   start dashboard.html
   
   # Should show "✅ Active" status
   # Should show "💳 Manage Subscription" button
   ```

3. **Test portal:**
   ```javascript
   // Click "Manage Subscription"
   // Should redirect to Stripe portal
   // Try:
   // - Update payment method
   // - Cancel subscription
   // - View invoices
   ```

4. **Verify webhook sync:**
   ```bash
   # After canceling in portal
   # Return to dashboard
   # Should show "⚠️ Free Plan"
   ```

### Test Endpoints Directly

```javascript
// Test checkSubscription
fetch('https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription?email=test@example.com')
  .then(r => r.json())
  .then(console.log);

// Test createCustomerPortalSession
fetch('https://us-central1-echomind-pro-launch.cloudfunctions.net/createCustomerPortalSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
  .then(r => r.json())
  .then(console.log);
```

---

## 🔐 Security Features

### Firebase Functions
- ✅ CORS enabled for web access
- ✅ Stripe signature verification on webhooks
- ✅ Customer ID validation
- ✅ Email lookup with fallback
- ✅ Error handling and logging

### Dashboard
- ✅ Email stored in localStorage
- ✅ No sensitive data in client code
- ✅ Stripe portal handles all payment data
- ✅ Session-based portal access

---

## 📊 Firestore Structure

### `user_subscription_status` Collection
```javascript
{
  "status": "active",           // active | canceled | free
  "plan": "monthly",            // monthly | annual
  "customerId": "cus_xxxxx",    // Stripe customer ID
  "unlimited": true,            // Feature flag
  "updatedAt": Timestamp,       // Last update
  "canceledAt": Timestamp       // If canceled
}
```

### `subscriptions` Collection
```javascript
{
  "customer": "cus_xxxxx",
  "customerId": "cus_xxxxx",
  "email": "user@example.com",
  "status": "active",
  "plan": "monthly",
  "unlimited": true,
  "createdAt": Timestamp,
  "lastPayment": Timestamp,
  "canceledAt": Timestamp
}
```

---

## 🎯 Stripe Dashboard Setup

### Enable Customer Portal

1. Go to [Stripe Dashboard → Settings → Billing](https://dashboard.stripe.com/settings/billing/portal)

2. **Configure Portal:**
   - ✅ Enable customer portal
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans
   - ✅ Show invoice history

3. **Set Return URL:**
   ```
   https://echomind-ai.vercel.app/dashboard.html
   ```

4. **Customize Branding:**
   - Upload logo
   - Set brand colors
   - Add support email

---

## 🚀 Deployment Checklist

### 1. Deploy Firebase Functions
```bash
firebase deploy --only functions
```

### 2. Verify Functions
```bash
# List deployed functions
firebase functions:list

# Check logs
firebase functions:log --only createCustomerPortalSession
```

### 3. Test Webhooks
```bash
# Use Stripe CLI to test locally
stripe listen --forward-to https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook

# Trigger test events
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### 4. Deploy Dashboard
```bash
npm run build
vercel deploy --prod
```

### 5. Test End-to-End
- [ ] Create subscription via pricing page
- [ ] Verify dashboard shows active status
- [ ] Click "Manage Subscription"
- [ ] Update payment method in portal
- [ ] Cancel subscription in portal
- [ ] Verify dashboard updates to "Free Plan"

---

## 📝 Environment Variables

### Firebase Functions
```bash
# Already set via Firebase Secrets
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRICE_ID_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_ANNUAL=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Optional (defaults provided)
PORTAL_RETURN_URL=https://echomind-ai.vercel.app/dashboard.html
```

---

## 🐛 Troubleshooting

### "Customer not found" Error
**Cause:** No customerId in Firestore and email not found in Stripe  
**Fix:** Ensure checkout.session.completed webhook properly stores customerId

### Portal doesn't open
**Cause:** CORS or invalid customer ID  
**Fix:** Check browser console, verify customerId exists in Stripe

### Dashboard shows "Free Plan" after payment
**Cause:** Webhook not firing or Firestore not updated  
**Fix:** 
```bash
# Check webhook logs
firebase functions:log --only stripeWebhook

# Manually trigger webhook in Stripe Dashboard
```

### Renewal date not showing
**Cause:** Missing period_end in response  
**Fix:** Ensure updatedAt is set in Firestore during checkout

---

## ✨ Future Enhancements

### Planned Features
- [ ] Email notifications for renewal/cancellation
- [ ] Usage analytics dashboard
- [ ] Team/family plans
- [ ] Referral program
- [ ] Annual discount promotions
- [ ] Grace period for failed payments

### Advanced Portal Features
- [ ] Custom portal UI (instead of Stripe-hosted)
- [ ] In-app subscription management
- [ ] Usage-based billing
- [ ] Add-on features

---

## 📚 Resources

- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Status:** ✅ **FULLY OPERATIONAL**  
**Last Updated:** 2025-10-20  
**Version:** 2.0 - Customer Portal Edition
