# 🔧 Manage Subscription Portal - Troubleshooting Guide

## ✅ What Was Fixed

### Enhanced Error Handling
- Added detailed console logging for debugging
- Better error messages for users
- Email validation before API call
- Graceful fallback for missing customer data

### Email Storage Improvements
- Email now saved when subscription is verified
- Email saved after successful checkout
- Multiple fallback keys checked (`echomind_pro_email`, `userEmail`, `user_email`)

---

## 🧪 How to Test

### 1. Test After Fresh Purchase

**Steps:**
1. Go to pricing page: `https://echomind-pro-launch.vercel.app/pricing.html`
2. Click "Choose Monthly" or "Choose Annual"
3. Complete Stripe test checkout:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
4. After redirect to success page, click "🚀 Enter Forge Cockpit"
5. Open Chrome extension popup
6. Click ⚙️ Settings
7. Click "💳 Manage Subscription"

**Expected Result:**
- Stripe Customer Portal opens in new tab
- Shows your subscription details
- Can cancel/update subscription

---

### 2. Test With Existing Subscription

**Steps:**
1. Open Chrome extension popup
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this command to check stored email:
   ```javascript
   console.log('Stored emails:', {
     echomind_pro_email: localStorage.getItem('echomind_pro_email'),
     userEmail: localStorage.getItem('userEmail'),
     user_email: localStorage.getItem('user_email')
   });
   ```
5. If email exists, click ⚙️ Settings → "💳 Manage Subscription"

**Expected Result:**
- Portal opens successfully
- Console shows: `🔍 Looking up portal for email: YOUR_EMAIL`
- Console shows: `✅ Portal data received: { url: "..." }`

---

### 3. Debug Mode - Manual Email Entry

If the portal button doesn't work, manually set your email:

**In Browser Console:**
```javascript
// Replace with your actual email used for purchase
localStorage.setItem('echomind_pro_email', 'your-email@example.com');
console.log('✅ Email manually set');
```

Then try clicking "Manage Subscription" again.

---

## 🔍 Common Issues & Fixes

### Issue 1: "Please complete a purchase first"

**Cause:** No email found in localStorage

**Fix:**
1. Check if you completed a purchase
2. Manually set email (see Debug Mode above)
3. Or complete a new test purchase

**Verify:**
```javascript
localStorage.getItem('echomind_pro_email')
// Should return your email, not null
```

---

### Issue 2: "Customer not found" (404 error)

**Cause:** Email exists but no Stripe customer record

**Possible Reasons:**
- Webhook didn't fire properly
- Customer ID not saved to Firestore
- Using different email than purchase

**Fix:**
1. Check Firestore `user_subscription_status` collection
2. Verify your email has a document with `customerId` field
3. If missing, complete a new test purchase

**Backend Check:**
```bash
# Check Firebase logs
firebase functions:log --only api

# Look for:
# "✅ Customer portal session created for: cus_..."
```

---

### Issue 3: Portal opens but shows wrong subscription

**Cause:** Multiple Stripe customers with same email

**Fix:**
1. In Stripe Dashboard, search for your email
2. Verify which customer ID is active
3. Update Firestore with correct `customerId`

---

### Issue 4: Button does nothing (no error)

**Cause:** JavaScript error or CORS issue

**Debug Steps:**
1. Open DevTools Console (F12)
2. Click "Manage Subscription"
3. Look for errors in console

**Common Errors:**
- `CORS policy` → Backend not deployed or wrong URL
- `fetch is not defined` → Extension context issue
- `manageSubBtn is null` → HTML element missing

**Fix:**
```bash
# Redeploy backend
cd functions
firebase deploy --only functions:api

# Rebuild extension
cd ..
npm run build

# Reload extension in chrome://extensions/
```

---

## 📋 Verification Checklist

### Backend Verification
- [ ] Firebase function deployed: `firebase deploy --only functions:api`
- [ ] Endpoint accessible: Test with curl
  ```bash
  curl -X POST https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCustomerPortalSession \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  ```
- [ ] Returns `{"url":"https://billing.stripe.com/..."}` or error

### Frontend Verification
- [ ] Extension rebuilt: `npm run build`
- [ ] Extension reloaded in `chrome://extensions/`
- [ ] Settings panel opens smoothly
- [ ] "Manage Subscription" button visible
- [ ] Button has hover effect (gradient reverses)

### Data Verification
- [ ] Email saved in localStorage
  ```javascript
  localStorage.getItem('echomind_pro_email')
  ```
- [ ] Firestore has user document
  - Collection: `user_subscription_status`
  - Document ID: `your-email@example.com`
  - Field: `customerId` (starts with `cus_`)
- [ ] Stripe has customer record
  - Dashboard → Customers → Search email
  - Has active subscription

---

## 🔥 Quick Test Script

Run this in browser console to test the full flow:

```javascript
// 1. Check email storage
const email = localStorage.getItem('echomind_pro_email');
console.log('📧 Stored email:', email);

// 2. Test portal endpoint
fetch('https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCustomerPortalSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: email })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Portal response:', data);
  if (data.url) {
    console.log('🎉 Portal URL received! Opening...');
    window.open(data.url, '_blank');
  } else {
    console.error('❌ No URL in response:', data);
  }
})
.catch(err => console.error('❌ Error:', err));
```

---

## 🎯 Expected Console Output

### Successful Flow:
```
🔍 Looking up portal for email: user@example.com
📡 Portal response status: 200
✅ Portal data received: { url: "https://billing.stripe.com/p/session/..." }
```

### Error Flow (No Customer):
```
🔍 Looking up portal for email: user@example.com
📡 Portal response status: 404
❌ Portal error: { error: "Customer not found" }
```

### Error Flow (No Email):
```
⚠️ No valid user email found in localStorage
```

---

## 🚀 Production Deployment

### 1. Deploy Backend
```bash
cd functions
firebase deploy --only functions:api
```

### 2. Rebuild Extension
```bash
npm run build
```

### 3. Test in Production
1. Load `dist/` folder in `chrome://extensions/`
2. Complete real purchase with real card (or test mode)
3. Verify portal opens correctly
4. Test cancel/update subscription

### 4. Monitor Logs
```bash
# Watch Firebase logs
firebase functions:log --only api

# Look for:
# "✅ Customer portal session created for: cus_..."
# "❌ Error creating customer portal: ..."
```

---

## 💡 Pro Tips

### Tip 1: Always Check Console
The enhanced logging will show exactly what's happening:
- Email being used
- API response status
- Error details

### Tip 2: Test With Multiple Emails
Create test subscriptions with different emails to verify lookup works correctly.

### Tip 3: Use Stripe Test Mode
Always test in Stripe test mode first before going live.

### Tip 4: Clear Cache Between Tests
```javascript
// Clear all EchoMind data
localStorage.clear();
chrome.storage.local.clear();
```

---

## ✅ Success Criteria

Your portal integration is working if:
1. ✅ Button opens Stripe portal in new tab
2. ✅ Portal shows correct subscription
3. ✅ Can cancel subscription from portal
4. ✅ Can update payment method
5. ✅ Can view invoices
6. ✅ Return URL brings back to dashboard

**You're ready to ship!** 🚀⚡
