# 🚀 Vercel Deployment & Routing Setup Guide

## Overview
Your EchoMind Pro application is now configured for **proper SPA routing** on Vercel with **API passthrough** to Firebase Cloud Functions. This eliminates the 404 errors you were experiencing and enables seamless page navigation.

---

## ✅ What Was Fixed

### Problem
- Vercel was only serving the dashboard (static file)
- Routes like `/success`, `/dashboard`, `/pricing` returned 404 errors
- Direct Firebase function calls had CORS issues

### Solution
1. **Updated `vercel.json`** with SPA rewrites and API passthrough
2. **Updated all HTML/JS files** to use `/api/` proxy instead of direct Firebase URLs
3. **Configured Vercel** to route all requests through your index.html for SPA handling

---

## 📋 Files Modified

### 1. **vercel.json** (Root)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://us-central1-echomind-pro.cloudfunctions.net/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

**What it does:**
- **API Rewrite**: Routes `/api/*` requests to your Firebase Cloud Functions
- **SPA Rewrite**: Routes all other requests to `/index.html` for client-side routing
- **Clean URLs**: Removes `.html` extensions
- **No Trailing Slashes**: Normalizes URLs

---

### 2. **Updated HTML Files**

#### `success.html`
- Changed: `https://us-central1-echomind-pro-launch.cloudfunctions.net/verifySessionInstant` → `/api/verifySessionInstant`

#### `dashboard.html`
- Changed: `https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription` → `/api/checkSubscription`

#### `pricing.html`
- Changed: `https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession` → `/api/createCheckoutSession`

#### `test-checkout.html`
- Changed: Direct Firebase URL → `/api/createCheckoutSession`

---

### 3. **Updated JavaScript Files**

#### `src/popup/popup.js`
```javascript
// Before
const CHECKOUT_ENDPOINT = "https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession";
const CHECK_SUBSCRIPTION_ENDPOINT = "https://checksubscription-evcnapia4q-uc.a.run.app";

// After
const CHECKOUT_ENDPOINT = "/api/createCheckoutSession";
const CHECK_SUBSCRIPTION_ENDPOINT = "/api/checkSubscription";
```

---

## 🚀 Deployment Steps

### Step 1: Build Your Project
```bash
npm run build
```

### Step 2: Deploy to Vercel
```bash
vercel deploy --prod
```

### Step 3: Test All Routes
After deployment, verify these routes work:

- **Landing Page**: `https://echomind-pro-launch.vercel.app/`
- **Pricing**: `https://echomind-pro-launch.vercel.app/pricing.html` or `/pricing`
- **Success Page**: `https://echomind-pro-launch.vercel.app/success?session_id=test_session`
- **Dashboard**: `https://echomind-pro-launch.vercel.app/dashboard.html` or `/dashboard`
- **Test Checkout**: `https://echomind-pro-launch.vercel.app/test-checkout.html`

---

## 🔗 How API Passthrough Works

### Request Flow
```
Browser Request
    ↓
Vercel (vercel.json rewrites)
    ↓
If path starts with /api/ → Forward to Firebase Cloud Functions
If path is anything else → Serve /index.html (SPA routing)
    ↓
Response back to browser
```

### Example
1. User clicks "Upgrade" button on pricing page
2. Browser sends: `POST /api/createCheckoutSession?plan=monthly`
3. Vercel intercepts and forwards to: `https://us-central1-echomind-pro.cloudfunctions.net/createCheckoutSession?plan=monthly`
4. Firebase function processes and returns Stripe checkout URL
5. Browser receives response and redirects to Stripe

**No CORS issues** ✅ — Everything goes through the same domain!

---

## 🔐 Security Notes

### API Rewrite Best Practices
- ✅ All API calls go through Vercel (same origin)
- ✅ No CORS headers needed
- ✅ Firebase function URLs are hidden from client
- ✅ Can add rate limiting/auth middleware on Vercel if needed

### Environment Variables
If you need to change the Firebase function URL in the future:
1. Update the `destination` in `vercel.json`
2. Redeploy: `vercel deploy --prod`

---

## 🧪 Testing Checklist

- [ ] Landing page loads at `/`
- [ ] Pricing page loads at `/pricing`
- [ ] Can click "Choose Monthly" and reach Stripe checkout
- [ ] Success page loads with session verification
- [ ] Dashboard loads and checks subscription status
- [ ] All API calls return data (check browser DevTools Network tab)
- [ ] No 404 errors in console

---

## 🐛 Troubleshooting

### Issue: Still seeing 404 errors
**Solution**: 
- Clear browser cache: `Ctrl+Shift+Delete`
- Hard refresh: `Ctrl+Shift+R`
- Check that `vercel.json` is in your project root

### Issue: API calls failing
**Solution**:
- Check browser DevTools → Network tab
- Verify `/api/` requests are being forwarded correctly
- Ensure Firebase functions are deployed and accessible

### Issue: Pages not loading
**Solution**:
- Run `npm run build` locally to check for build errors
- Verify all HTML files are in the project root
- Check Vercel deployment logs: `vercel logs`

---

## 📚 Additional Resources

- [Vercel Rewrites Documentation](https://vercel.com/docs/edge-network/rewrites-and-redirects)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Stripe Checkout Integration](https://stripe.com/docs/payments/checkout)

---

## 🎯 Next Steps

1. **Deploy**: Run `npm run build && vercel deploy --prod`
2. **Test**: Visit all routes and verify they work
3. **Monitor**: Check Vercel Analytics for any errors
4. **Optimize**: Consider adding caching headers to static assets

---

**Status**: ✅ Ready to deploy!  
**Last Updated**: 2025-10-20  
**Maintained By**: EchoMind Team
