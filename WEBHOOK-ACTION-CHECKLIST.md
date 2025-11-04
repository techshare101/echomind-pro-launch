# ✅ Webhook Fix — Action Checklist

## 🎯 What Was Done (Completed)

- ✅ **Diagnosed the issue:** Webhook blocked by authentication
- ✅ **Added fix:** `invoker: "public"` to webhook config
- ✅ **Deployed:** `firebase deploy --only functions:stripeWebhook`
- ✅ **Deployment completed:** Oct 25, 2025 at 20:22 UTC

---

## 🧪 What You Need to Do Now

### **Step 1: Test the Webhook (5 minutes)**

1. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/test/webhooks

2. **Click on your webhook endpoint:**
   - Look for: `https://stripewebhook-evcnapia4q-uc.a.run.app`

3. **Send a test event:**
   - Click **"Send test webhook"** button
   - Select event: `checkout.session.completed`
   - Click **"Send test webhook"**

4. **Check the result:**
   - ✅ **Success:** Green checkmark + "200 OK"
   - ❌ **Failed:** Red X + error message

5. **If successful, check Firebase logs:**
   ```bash
   firebase functions:log --only stripeWebhook
   ```
   
   **Expected:**
   ```
   ✅ Received event: checkout.session.completed
   ✅ Checkout session completed: cs_test_...
   ```

---

### **Step 2: Check for Real Customers (10 minutes)**

1. **Go to Stripe Events:**
   - https://dashboard.stripe.com/test/events

2. **Filter by date:** Oct 21-25, 2025

3. **Look for these event types:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `invoice.payment_succeeded`

4. **Check email addresses:**
   - **Test data:** Ignore (e.g., `test@example.com`)
   - **Real emails:** Note them down

---

### **Step 3: Replay Failed Events (If Needed)**

**Only do this if you found real customer emails in Step 2.**

1. **Go to Webhook Deliveries:**
   - https://dashboard.stripe.com/test/webhooks
   - Click your webhook endpoint
   - Click **"Recent deliveries"** tab

2. **Find failed events:**
   - Look for red X's from Oct 21-25
   - Match the email addresses from Step 2

3. **Resend each failed event:**
   - Click the failed event
   - Click **"Resend"** button
   - Verify it succeeds (green checkmark)

4. **Verify in Firestore:**
   - Firebase Console → Firestore
   - Collection: `user_subscription_status`
   - Check if customer email now shows `status: "active"`

---

### **Step 4: Monitor for 24 Hours**

1. **Check webhook deliveries daily:**
   - https://dashboard.stripe.com/test/webhooks
   - Look for green checkmarks (success)

2. **Check Firebase logs periodically:**
   ```bash
   firebase functions:log --only stripeWebhook
   ```

3. **Look for:**
   - ✅ `Received event: checkout.session.completed`
   - ✅ `Pro [plan] activated for: [email]`
   - ❌ No authentication errors

---

## 🚨 If Webhook Still Fails

### **Scenario 1: Still Getting 401/403 Errors**

The `invoker: "public"` setting might not have propagated yet.

**Fix:**
1. Wait 5 more minutes
2. Redeploy:
   ```bash
   firebase deploy --only functions:stripeWebhook
   ```
3. Test again

### **Scenario 2: Getting 400 Errors**

This is **expected** if you're testing without a valid Stripe signature.

**Fix:**
- Use Stripe Dashboard to send test events (they include valid signatures)
- Don't test with curl/Postman (they can't sign requests)

### **Scenario 3: No Logs Appearing**

**Fix:**
1. Check function is deployed:
   ```bash
   firebase functions:list
   ```
2. Verify webhook URL in Stripe matches:
   ```
   https://stripewebhook-evcnapia4q-uc.a.run.app
   ```

---

## 📊 Success Indicators

You'll know everything is working when:

1. ✅ **Stripe Dashboard:** Green checkmarks on webhook deliveries
2. ✅ **Firebase Logs:** `✅ Received event: checkout.session.completed`
3. ✅ **Firestore:** Subscriptions with `status: "active"`
4. ✅ **No auth errors:** No more "not authenticated" messages

---

## 🎯 Quick Reference

| Task | Time | Priority |
|------|------|----------|
| Test webhook | 5 min | 🔥 Do now |
| Check for real customers | 10 min | 🔥 Do now |
| Replay failed events | 5-10 min | ⚡ If needed |
| Monitor for 24h | Ongoing | 📊 Track |

---

## 📝 Commands Reference

```bash
# Check Firebase logs
firebase functions:log --only stripeWebhook

# List deployed functions
firebase functions:list

# Redeploy webhook (if needed)
firebase deploy --only functions:stripeWebhook

# Check Firebase secrets
firebase functions:secrets:access STRIPE_WEBHOOK_SECRET
```

---

## 🔗 Quick Links

- **Stripe Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Stripe Events:** https://dashboard.stripe.com/test/events
- **Firebase Console:** https://console.firebase.google.com/project/echomind-pro-launch
- **Webhook URL:** https://stripewebhook-evcnapia4q-uc.a.run.app

---

## ✅ Completion Checklist

Mark these off as you complete them:

- [ ] Sent test event from Stripe dashboard
- [ ] Verified webhook returns 200 OK
- [ ] Checked Firebase logs for success messages
- [ ] Checked Stripe events for real customers (Oct 21-25)
- [ ] Replayed any failed events for real customers
- [ ] Verified subscriptions activated in Firestore
- [ ] Set reminder to check logs in 24 hours

---

## 🧠 Bottom Line

**The fix is deployed and ready.**  
**Now you just need to test it and replay any missed customer events.**  

**Total time:** 15-20 minutes  
**Priority:** 🔥 Do this today  

**Your webhook is live and ready to process payments!** 💰
