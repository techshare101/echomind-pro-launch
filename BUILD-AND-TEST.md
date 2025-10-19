# 🔨 Build & Test - EchoMind Pro Edition

## ⚡ Quick Start (5 minutes)

### Step 1: Build the Extension
```bash
cd C:\Users\valen\Development\echomind
npm run build
```

**Expected output:**
```
✓ Built in XXXms
dist/
  ├── manifest.json
  ├── popup.html
  ├── popup.js
  ├── popup.css
  └── ... (other files)
```

---

### Step 2: Load in Chrome

1. **Open Chrome Extensions page:**
   ```
   chrome://extensions
   ```

2. **Enable Developer Mode:**
   - Toggle switch in top-right corner

3. **Load Unpacked:**
   - Click "Load unpacked" button
   - Navigate to: `C:\Users\valen\Development\echomind\dist`
   - Click "Select Folder"

4. **Verify Extension Loaded:**
   - Should see "EchoMind" in extensions list
   - Extension icon should appear in toolbar

---

### Step 3: Test the Pro Upgrade Flow

#### **3.1 Open Extension Popup**
- Click EchoMind icon in Chrome toolbar
- Should see:
  - ✨ PRO badge in top-right
  - "Upgrade to EchoMind Pro" heading
  - Features list
  - Two upgrade buttons (Monthly & Annual)

#### **3.2 Test Monthly Upgrade**
1. Click **"$4.99/month"** button
2. Button should show "⏳ Loading..."
3. New tab opens with Stripe Checkout
4. Should show:
   - Product: "EchoMind Pro" (or similar)
   - Price: $4.99/month
   - Payment form

#### **3.3 Complete Test Payment**
Use these test card details:
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
Email: test@example.com
```

Click "Subscribe" → Should redirect to success page

#### **3.4 Verify Webhook**
```bash
# Check webhook logs
firebase functions:log --only stripeWebhook

# Should see:
# ✅ Received event: checkout.session.completed
# ✅ Subscription activated for: test@example.com
```

#### **3.5 Check Firestore**
1. Go to Firebase Console → Firestore
2. Navigate to `user_subscription_status` collection
3. Should see document with:
   - ID: `test@example.com`
   - `status`: `"active"`
   - `lastUpdated`: (timestamp)

#### **3.6 Verify Extension Updates**
1. Close and reopen extension popup
2. Pro box should be **hidden** (if email is stored)
3. Full features should be available

---

## 🧪 Complete Test Checklist

### **Visual Tests**
- [ ] Pro box displays with glassmorphic styling
- [ ] Animated gradient background rotates
- [ ] "Save 17%" badge shows on annual button
- [ ] Buttons have hover effects
- [ ] Loading state shows when clicked

### **Functional Tests**
- [ ] Monthly button creates checkout session
- [ ] Annual button creates checkout session
- [ ] Stripe Checkout opens in new tab
- [ ] Correct price displays ($4.99 or $49.99)
- [ ] Test payment completes successfully
- [ ] Webhook receives event
- [ ] Firestore updates subscription status
- [ ] Extension checks subscription on reopen
- [ ] Pro box hides for active subscribers

### **Error Handling Tests**
- [ ] Network error shows alert
- [ ] Invalid response shows error message
- [ ] Button resets after error
- [ ] Console logs errors properly

---

## 🔍 Debugging

### **Check Browser Console**
1. Right-click extension popup
2. Select "Inspect"
3. Go to Console tab
4. Should see:
   ```
   🧠 EchoMind popup v0.4.0 Pro Edition loaded
   Creating monthly checkout session...
   ✅ Checkout session created: cs_test_...
   ```

### **Check Network Tab**
1. In DevTools, go to Network tab
2. Click upgrade button
3. Should see request to:
   ```
   https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession?plan=monthly
   ```
4. Response should be:
   ```json
   {
     "url": "https://checkout.stripe.com/c/pay/cs_test_...",
     "plan": "monthly",
     "sessionId": "cs_test_..."
   }
   ```

### **Check Firebase Logs**
```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only createCheckoutSession
firebase functions:log --only stripeWebhook
firebase functions:log --only checkSubscription
```

---

## 🐛 Common Issues

### **Issue: Pro box doesn't show**
**Fix:** Check if `proBox` element exists:
```javascript
console.log(document.getElementById("proBox"));
```

### **Issue: Button click does nothing**
**Fix:** Check console for errors:
```javascript
// Should see:
Creating monthly checkout session...
```

### **Issue: "Failed to create checkout session"**
**Fix:** Verify Firebase secrets are set:
```bash
firebase functions:secrets:list
```

### **Issue: Stripe Checkout shows wrong price**
**Fix:** Verify price IDs match:
```bash
firebase functions:secrets:access STRIPE_PRICE_ID_MONTHLY
firebase functions:secrets:access STRIPE_PRICE_ID_ANNUAL
```

### **Issue: Webhook not receiving events**
**Fix:** Check Stripe Dashboard:
1. Go to Developers → Webhooks
2. Verify endpoint URL
3. Check event logs

---

## 📦 Build for Production

### **1. Update Version**
Edit `manifest.json`:
```json
{
  "version": "0.4.0",
  "version_name": "Pro Edition"
}
```

### **2. Build Production Bundle**
```bash
npm run build
```

### **3. Create ZIP for Chrome Web Store**
```bash
# Windows PowerShell
Compress-Archive -Path dist\* -DestinationPath echomind-pro-v0.4.0.zip
```

### **4. Test ZIP**
1. Go to `chrome://extensions`
2. Remove old version
3. Drag and drop ZIP file
4. Test all functionality

### **5. Submit to Chrome Web Store**
1. Go to Chrome Web Store Developer Dashboard
2. Click "New Item"
3. Upload `echomind-pro-v0.4.0.zip`
4. Fill out store listing
5. Submit for review

---

## 🎯 Pre-Launch Checklist

- [ ] Extension builds without errors
- [ ] All buttons work in popup
- [ ] Pro upgrade flow completes end-to-end
- [ ] Webhook receives and processes events
- [ ] Subscription status updates in Firestore
- [ ] Extension checks subscription correctly
- [ ] Test cards work (4242...)
- [ ] Error handling works
- [ ] Console has no errors
- [ ] All Firebase functions deployed
- [ ] All secrets configured
- [ ] Stripe webhook endpoint configured
- [ ] Success/cancel pages exist
- [ ] Extension icons look good
- [ ] Store listing ready

---

## 🚀 Launch!

Once all tests pass:
1. ✅ Switch Stripe from test to live mode
2. ✅ Update secrets with live keys
3. ✅ Redeploy Firebase functions
4. ✅ Submit extension to Chrome Web Store
5. ✅ Start generating revenue! 💰

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase function logs
3. Check Stripe Dashboard logs
4. Verify all secrets are set
5. Test with different browsers
6. Clear extension cache and reload

**You're ready to launch!** 🎉
