# 🔐 Firebase Authentication Setup Guide

## Step 1: Enable Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **echomind-pro-launch**
3. Navigate to: **Build → Authentication → Sign-in method**
4. Enable the following providers:
   - ✅ **Email/Password**
   - ✅ **Google**
5. Click **Save**

## Step 2: Configure Authorized Domains

In Firebase Console → Authentication → Settings → Authorized domains:

Add these domains:
- ✅ `localhost` (for local testing)
- ✅ `echomind-pro-launch.vercel.app` (your production domain)
- ✅ Any custom domains you use

## Step 3: Files to Update

### 1. Update `functions/index.js` - checkSubscription function

The function needs to accept and verify Firebase ID tokens for secure authentication.

### 2. Update `dashboard.html`

Add Firebase Auth SDK and implement Google Sign-In flow.

## What This Enables

### Security
- ✅ Only authenticated users can check subscriptions
- ✅ Firebase verifies user identity via ID tokens
- ✅ No more relying on localStorage email (insecure)
- ✅ Automatic session management

### User Experience  
- ✅ One-click Google Sign-In
- ✅ Persistent login across sessions
- ✅ Automatic subscription status on login
- ✅ Secure logout

### SaaS Features
- ✅ User management
- ✅ Email verification
- ✅ Password reset
- ✅ Multi-provider auth (Google, Email, etc.)

## Testing Checklist

After deployment:

- [ ] Enable Email/Password in Firebase Console
- [ ] Enable Google Sign-In in Firebase Console
- [ ] Add authorized domains
- [ ] Deploy updated `checkSubscription` function
- [ ] Deploy updated `dashboard.html`
- [ ] Test Google Sign-In flow
- [ ] Test subscription check with authenticated user
- [ ] Test logout flow

## Next Steps

1. Enable auth providers in Firebase Console (5 minutes)
2. Deploy updated Firebase function
3. Deploy updated dashboard
4. Test the complete flow

---

**Status:** Ready to implement  
**Time to complete:** ~15 minutes  
**Complexity:** Medium
