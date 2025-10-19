# 🔍 Stripe Configuration Verification

## ✅ Current Configuration

### **Stripe Dashboard Prices**
- **Monthly**: `price_1SJLwXGU4RA8uiorT3MyNelK` → $4.99 USD/month
- **Annual**: `price_1SJM1TGU4RA8uioraKHqaG83` → $49.99 USD/year

### **Pricing Page (pricing.html)**
- ✅ Monthly: $4.99/month
- ✅ Annual: $49.99/year (save 17%)

---

## 🔧 Verify Firebase Secrets

Run these commands to confirm your secrets are set correctly:

```bash
# Check Monthly Price ID
firebase functions:secrets:access STRIPE_PRICE_ID_MONTHLY

# Expected output:
# price_1SJLwXGU4RA8uiorT3MyNelK

# Check Annual Price ID
firebase functions:secrets:access STRIPE_PRICE_ID_ANNUAL

# Expected output:
# price_1SJM1TGU4RA8uioraKHqaG83
```

---

## 🚀 If Secrets Need to be Set

If the secrets don't exist or are wrong, set them:

```bash
# Set Monthly Price ID
firebase functions:secrets:set STRIPE_PRICE_ID_MONTHLY
# When prompted, paste: price_1SJLwXGU4RA8uiorT3MyNelK

# Set Annual Price ID
firebase functions:secrets:set STRIPE_PRICE_ID_ANNUAL
# When prompted, paste: price_1SJM1TGU4RA8uioraKHqaG83
```

Then redeploy:
```bash
firebase deploy --only functions:createCheckoutSession
```

---

## 🧪 Test the Flow

### **1. Start Local Server**
```bash
cd C:\Users\valen\Development\echomind
python -m http.server 8000
```

### **2. Open Pricing Page**
Navigate to: http://localhost:8000/pricing.html

### **3. Test Checkout**
- Click "Choose Monthly" → Should redirect to Stripe Checkout for $4.99/month
- Click "Choose Annual" → Should redirect to Stripe Checkout for $49.99/year

### **4. Use Stripe Test Cards**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`
- Any future expiry, any CVC

---

## 📊 Pricing Math

**Monthly Plan**: $4.99/month × 12 = **$59.88/year**  
**Annual Plan**: $49.99/year  
**Savings**: $59.88 - $49.99 = **$9.89** (17% off)

---

## ✅ Checklist

- [ ] Firebase secrets set correctly
- [ ] pricing.html shows $4.99 and $49.99
- [ ] Local server running
- [ ] Monthly checkout works
- [ ] Annual checkout works
- [ ] Webhook receives events
- [ ] Subscription status updates in Firestore

---

## 🔗 Important URLs

- **Stripe Dashboard**: https://dashboard.stripe.com/test/products
- **Firebase Console**: https://console.firebase.google.com/project/echomind-pro-launch
- **Checkout Function**: https://us-central1-echomind-pro-launch.cloudfunctions.net/createCheckoutSession
- **Local Pricing Page**: http://localhost:8000/pricing.html
