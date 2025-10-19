# 🚀 EchoMind Pro - Stripe Webhook Deployment Guide

## Quick Deploy

### Windows (PowerShell)
```powershell
cd functions
.\deploy-webhook.ps1
```

### Mac/Linux (Bash)
```bash
cd functions
chmod +x deploy-webhook.sh
./deploy-webhook.sh
```

### Manual Deployment
```bash
cd functions
npm run lint
firebase deploy --only functions:stripeWebhook
firebase functions:list
```

---

## What the Script Does

1. ✅ **Lints your code** - Catches syntax errors before deployment
2. ✅ **Deploys to Firebase** - Pushes your webhook function to production
3. ✅ **Verifies deployment** - Confirms the function is live
4. ✅ **Displays webhook URL** - Ready to copy into Stripe
5. ✅ **Shows next steps** - Guides you through Stripe configuration

---

## Deployed Function URL

```
https://us-central1-echomind-pro-launch.cloudfunctions.net/stripeWebhook
```

---

## Stripe Configuration

### 1. Add Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Paste the function URL above
4. Click **"Select events"**

### 2. Select These Events

- ✅ `payment_intent.succeeded`
- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `customer.subscription.deleted`

### 3. Copy Webhook Secret

After creating the endpoint:
1. Click on the endpoint
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)
4. Add it to `functions/.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

---

## Testing the Webhook

### Using Stripe CLI

```bash
# Install Stripe CLI (if not already installed)
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Test the webhook
stripe trigger payment_intent.succeeded
```

### Expected Response

```
✅ Payment succeeded for: customer@example.com
🔥 Updated Firestore subscription status for customer@example.com
```

---

## View Function Logs

### Real-time logs
```bash
firebase functions:log --only stripeWebhook
```

### Last 100 lines
```bash
firebase functions:log --only stripeWebhook --limit 100
```

### Filter by error
```bash
firebase functions:log --only stripeWebhook | grep "ERROR"
```

---

## Troubleshooting

### Deployment fails with lint errors
```bash
# Run lint to see specific errors
npm run lint

# Fix the errors, then redeploy
.\deploy-webhook.ps1
```

### Function not appearing in list
```bash
# Check Firebase project
firebase use

# Should show: echomind-pro-launch

# If wrong project, switch:
firebase use echomind-pro-launch
```

### Webhook signature verification fails
1. Check that `STRIPE_WEBHOOK_SECRET` is set in `functions/.env`
2. Verify the secret matches Stripe Dashboard
3. Redeploy after updating:
   ```bash
   firebase deploy --only functions:stripeWebhook
   ```

### Environment variables not working
For production, set Firebase config:
```bash
firebase functions:config:set stripe.secret_key="sk_live_xxx"
firebase functions:config:set stripe.webhook_secret="whsec_xxx"
```

---

## Firestore Collections

The webhook creates/updates these collections:

### `user_subscription_status`
```javascript
{
  "user@example.com": {
    status: "active",
    lastUpdated: Timestamp
  }
}
```

### `subscriptions`
```javascript
{
  "session_id": {
    customer: "cus_xxx",
    email: "user@example.com",
    status: "active",
    createdAt: Timestamp,
    lastPayment: Timestamp,
    canceledAt: Timestamp  // only if canceled
  }
}
```

---

## Security Checklist

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Keep `STRIPE_SECRET_KEY` private
- ✅ Keep `STRIPE_WEBHOOK_SECRET` private
- ✅ Use test keys for development
- ✅ Use live keys only in production
- ✅ Verify webhook signatures (already implemented)

---

## Production Deployment

When ready for production:

1. **Update Stripe keys** in `functions/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_live_your_live_key
   STRIPE_WEBHOOK_SECRET=whsec_your_live_secret
   ```

2. **Deploy**:
   ```bash
   .\deploy-webhook.ps1
   ```

3. **Update Stripe webhook** with production URL

4. **Test with real payment** (use small amount first)

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `.\deploy-webhook.ps1` | Deploy webhook (Windows) |
| `./deploy-webhook.sh` | Deploy webhook (Mac/Linux) |
| `npm run lint` | Check for code errors |
| `firebase functions:list` | List deployed functions |
| `firebase functions:log` | View function logs |
| `stripe trigger payment_intent.succeeded` | Test webhook |

---

## Support

- 📚 [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- 📚 [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- 📚 [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)

---

**Ready to deploy?** Run `.\deploy-webhook.ps1` and follow the prompts! 🚀
