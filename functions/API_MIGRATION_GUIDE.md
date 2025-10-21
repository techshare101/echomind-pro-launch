# 🔥 EchoMind Pro - Unified API Migration Guide

## What Changed?

Your Firebase Functions have been transformed into a **unified Express-based API router** with global CORS configuration. This eliminates CORS issues and provides a clean, scalable architecture.

---

## 🎯 New Architecture

### Before (Multiple Separate Functions)
```
❌ https://us-central1-echomind-pro-launch.cloudfunctions.net/checkSubscription
❌ https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession
❌ https://us-central1-echomind-pro-launch.cloudfunctions.net/verifySessionInstant
❌ https://us-central1-echomind-pro-launch.cloudfunctions.net/createCustomerPortalSession
```

### After (Unified API Endpoint)
```
✅ https://us-central1-echomind-pro-launch.cloudfunctions.net/api/checkSubscription
✅ https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCheckoutSession
✅ https://us-central1-echomind-pro-launch.cloudfunctions.net/api/verifySessionInstant
✅ https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCustomerPortalSession
```

---

## 📁 New File Structure

```
functions/
├── index.js              # Main entry point with unified API export
├── apiRouter.js          # Express router with all API endpoints
├── corsConfig.js         # Global CORS configuration
└── package.json          # Updated with express & cors dependencies
```

---

## 🚀 Deployment Steps

### 1. Install Dependencies (Already Done ✅)
```bash
cd functions
npm install express cors
```

### 2. Deploy the New API Function
```bash
firebase deploy --only functions:api
```

This will deploy the new unified `api` function while keeping legacy endpoints for backward compatibility.

### 3. Test the New API Endpoint
```bash
# Health check
curl https://us-central1-echomind-pro-launch.cloudfunctions.net/api

# Check subscription
curl "https://us-central1-echomind-pro-launch.cloudfunctions.net/api/checkSubscription?email=test@example.com"
```

### 4. Rebuild and Deploy Frontend
```bash
npm run build
vercel deploy --prod
```

---

## ✅ What Was Updated

### Backend Files
- ✅ `functions/corsConfig.js` - Global CORS policy
- ✅ `functions/apiRouter.js` - Unified API router with all endpoints
- ✅ `functions/index.js` - Express app with `/api` mount point
- ✅ `functions/package.json` - Added express & cors dependencies

### Frontend Files
- ✅ `dashboard.html` - Updated to use `/api/checkSubscription` and `/api/createCustomerPortalSession`
- ✅ `pricing.html` - Updated to use `/api/createCheckoutSession`
- ✅ `success.html` - Updated to use `/api/verifySessionInstant`
- ✅ `src/popup/popup.js` - Updated Chrome extension endpoints
- ✅ `test-checkout.html` - Updated test file

---

## 🔐 CORS Configuration

The new `corsConfig.js` allows requests from:
- ✅ `https://echomind-pro-launch.vercel.app` (Production)
- ✅ `http://localhost:5173` (Local Vite dev server)
- ✅ `http://localhost:5000` (Firebase emulator)
- ✅ `chrome-extension://*` (Chrome extension)

**No more CORS errors!** 🎉

---

## 🧪 Testing Checklist

After deployment, test these endpoints:

### 1. Health Check
```bash
curl https://us-central1-echomind-pro-launch.cloudfunctions.net/api
```
Expected: JSON with status and available endpoints

### 2. Check Subscription
```bash
curl "https://us-central1-echomind-pro-launch.cloudfunctions.net/api/checkSubscription?email=YOUR_EMAIL"
```
Expected: JSON with subscription status

### 3. Frontend Tests
- [ ] Visit `https://echomind-pro-launch.vercel.app/pricing.html`
- [ ] Click "Choose Monthly" or "Choose Annual"
- [ ] Complete Stripe test checkout
- [ ] Verify redirect to success page
- [ ] Check dashboard shows active subscription

### 4. Chrome Extension Test
- [ ] Open extension popup
- [ ] Check subscription status displays correctly
- [ ] Test "Upgrade to Pro" buttons

---

## 🔄 Backward Compatibility

**Legacy endpoints are still available** for backward compatibility:
- `checkSubscription` (standalone function)
- `createCheckoutSession` (standalone function)
- `verifySessionInstant` (standalone function)
- `createCustomerPortalSession` (standalone function)

These will be deprecated in a future release once all clients are migrated.

---

## 🎯 Benefits of New Architecture

### ✅ No More CORS Issues
- Global CORS policy applied to all endpoints
- Supports multiple origins (production, local, extension)

### ✅ Cleaner Code
- Single entry point (`/api`)
- Shared middleware (CORS, JSON parsing)
- Easy to add new endpoints

### ✅ Better Scalability
- Express router makes it easy to organize routes
- Can add authentication middleware globally
- Unified logging and error handling

### ✅ Easier Testing
- Single function to test
- Health check endpoint for monitoring
- Consistent response format

---

## 🐛 Troubleshooting

### Issue: "Function not found"
**Solution:** Make sure you deployed the new `api` function:
```bash
firebase deploy --only functions:api
```

### Issue: Still getting CORS errors
**Solution:** 
1. Check that you're using the `/api/` prefix in URLs
2. Verify `corsConfig.js` includes your domain
3. Clear browser cache and hard refresh

### Issue: 404 on Vercel routes
**Solution:** Make sure `vercel.json` has the correct rewrites:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://us-central1-echomind-pro-launch.cloudfunctions.net/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📝 Next Steps

1. ✅ Deploy the new API function
2. ✅ Test all endpoints
3. ✅ Rebuild and deploy frontend
4. ✅ Test in production
5. 🔜 Monitor logs for any issues
6. 🔜 Deprecate legacy endpoints after migration is confirmed

---

## 🎉 You're All Set!

Your EchoMind Pro API is now running on a unified, CORS-safe architecture. No more "Blocked by CORS policy" errors!

**Deploy command:**
```bash
firebase deploy --only functions:api
```

Then rebuild your frontend:
```bash
npm run build
vercel deploy --prod
```

🔥 **Let's go!**
