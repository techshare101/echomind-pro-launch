# ✅ EchoMind Pro Deployment Checklist

## 🎯 Pre-Deployment

- [x] **vercel.json** configured with SPA rewrites and API passthrough
- [x] **All HTML files** updated to use `/api/` proxy
- [x] **All JavaScript files** updated to use `/api/` proxy
- [x] **No hardcoded Firebase URLs** in client-side code
- [x] **Build configuration** verified in vite.config.ts

---

## 📦 Build & Deploy

### Local Testing
```bash
# 1. Build the project
npm run build

# 2. Preview locally (optional)
npm run preview

# 3. Check dist/ folder contains all HTML files
ls dist/
```

### Deploy to Vercel
```bash
# Deploy to production
vercel deploy --prod

# Or use Vercel CLI if not logged in
npm i -g vercel
vercel login
vercel deploy --prod
```

---

## 🧪 Post-Deployment Testing

### Route Testing
Test these URLs on your deployed site:

| Route | Expected Result | Status |
|-------|-----------------|--------|
| `/` | Landing page loads | ⬜ |
| `/pricing` | Pricing page with upgrade buttons | ⬜ |
| `/pricing.html` | Same as `/pricing` (clean URL) | ⬜ |
| `/success?session_id=test` | Success page with verification | ⬜ |
| `/dashboard` | Dashboard with subscription check | ⬜ |
| `/dashboard.html` | Same as `/dashboard` | ⬜ |
| `/test-checkout` | Test checkout page | ⬜ |

### API Testing
Check browser DevTools → Network tab:

| Endpoint | Method | Expected Status |
|----------|--------|-----------------|
| `/api/createCheckoutSession` | POST | 200 ✅ |
| `/api/checkSubscription` | GET | 200 ✅ |
| `/api/verifySessionInstant` | GET | 200 ✅ |

### Browser Console
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] No undefined variable errors
- [ ] All API responses logged correctly

---

## 🔗 Key Endpoints

### Frontend Routes
```
https://echomind-pro-launch.vercel.app/
https://echomind-pro-launch.vercel.app/pricing
https://echomind-pro-launch.vercel.app/success
https://echomind-pro-launch.vercel.app/dashboard
```

### API Endpoints (Proxied)
```
POST /api/createCheckoutSession?plan=monthly
GET /api/checkSubscription?email=user@example.com
GET /api/verifySessionInstant?session_id=cs_test_...
```

---

## 🚨 Common Issues & Fixes

### Issue: Routes return 404
**Fix**: 
- Verify `vercel.json` is in project root
- Check that rewrite rule is: `"destination": "/index.html"`
- Clear browser cache and hard refresh

### Issue: API calls fail with CORS error
**Fix**:
- Verify endpoints use `/api/` prefix (not full Firebase URL)
- Check `vercel.json` has correct Firebase function URL in destination
- Ensure Firebase functions are deployed and accessible

### Issue: Static files (CSS, JS) not loading
**Fix**:
- Verify files are in `dist/` after build
- Check `vite.config.ts` output configuration
- Ensure `publicDir: 'public'` is set

---

## 📊 Monitoring

### Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Check:
   - [ ] Build status: ✅ Success
   - [ ] Deployments: Latest is production
   - [ ] Analytics: No spike in errors

### Browser DevTools
1. Open DevTools (`F12`)
2. Go to Network tab
3. Reload page and verify:
   - [ ] All HTML files load (200 status)
   - [ ] All API calls succeed (200 status)
   - [ ] No 404 or CORS errors

---

## 🎊 Success Indicators

✅ **You're good to go when:**
- All routes load without 404 errors
- API calls return data successfully
- Payment flow works (can reach Stripe checkout)
- Success page verifies session correctly
- Dashboard shows subscription status
- No console errors

---

## 📝 Rollback Plan

If something breaks:

```bash
# View deployment history
vercel deployments

# Rollback to previous version
vercel rollback

# Or redeploy current code
vercel deploy --prod --force
```

---

## 🔄 Future Updates

When updating your code:

1. Make changes locally
2. Test with `npm run build && npm run preview`
3. Commit to git
4. Deploy: `vercel deploy --prod`
5. Test all routes again

---

## 📞 Support

If you encounter issues:

1. Check [VERCEL_SETUP_GUIDE.md](./VERCEL_SETUP_GUIDE.md) for detailed info
2. Review Vercel logs: `vercel logs`
3. Check Firebase Cloud Functions logs
4. Verify all files are in project root

---

**Last Updated**: 2025-10-20  
**Status**: ✅ Ready for Production
