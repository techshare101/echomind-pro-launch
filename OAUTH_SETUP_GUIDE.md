# 🔑 Google OAuth Client ID Setup Guide

## Why You Need This
Chrome's automated scanner flagged your extension because Firebase Auth contains code that dynamically loads remote scripts. We've replaced Firebase Auth with Chrome's Identity API, which requires a Google OAuth Client ID.

---

## 📋 Step-by-Step Setup

### 1. Go to Google Cloud Console
Open: https://console.cloud.google.com/apis/credentials

### 2. Select Your Project
- Project: `echomind-pro-launch` (or your Firebase project)
- If you don't see it, click the project dropdown at the top

### 3. Create OAuth Client ID
1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: **EchoMind Pro**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile`
   - Save and continue

### 4. Configure OAuth Client
- Application type: **Chrome Extension**
- Name: **EchoMind Pro Extension**
- Item ID: `knlgamkplijkhhalhehnhelnjpbjlbpn`
  - ⚠️ This is your Chrome Web Store extension ID
  - Find it in your Chrome Web Store Developer Dashboard
  - Or in the rejection email (Item ID: knlgamkplijkhhalhehnhelnjpbjlbpn)

### 5. Get Your Client ID
After creating, you'll see:
```
Client ID: 643933689359-abc123xyz456.apps.googleusercontent.com
```

Copy this entire string (including `.apps.googleusercontent.com`)

---

## 🔧 Update Your Code

### File 1: `manifest.json`
Find line 78 and replace:
```json
"oauth2": {
  "client_id": "643933689359-YOUR_EXTENSION_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["openid", "email", "profile"]
}
```

With your actual Client ID:
```json
"oauth2": {
  "client_id": "643933689359-abc123xyz456.apps.googleusercontent.com",
  "scopes": ["openid", "email", "profile"]
}
```

### File 2: `src/lib/chrome-identity-auth.js`
Find line 26 and replace:
```javascript
const GOOGLE_CLIENT_ID = "643933689359-YOUR_EXTENSION_CLIENT_ID.apps.googleusercontent.com";
```

With your actual Client ID:
```javascript
const GOOGLE_CLIENT_ID = "643933689359-abc123xyz456.apps.googleusercontent.com";
```

---

## ✅ Verify Setup

### Test Locally
1. Build extension: `npm run build`
2. Load `dist` folder in Chrome as unpacked extension
3. Click extension icon → "Sign in with Google"
4. Should open Google OAuth consent screen
5. After authorizing, should see your email/name

### Common Issues

**Error: "redirect_uri_mismatch"**
- Solution: Make sure Item ID in Google Cloud matches your extension ID exactly

**Error: "invalid_client"**
- Solution: Double-check Client ID is copied correctly (no extra spaces)

**Error: "access_denied"**
- Solution: User cancelled OAuth flow (this is normal, try again)

---

## 🔒 Security Notes

### Is This Safe?
✅ Yes! Chrome Identity API is the official, recommended way to authenticate in Chrome extensions.

### Why Not Hardcode Client ID in Public Repo?
- OAuth Client IDs are **not secrets** (they're meant to be public)
- The Client Secret (which you don't need) is the sensitive part
- Chrome extensions don't use Client Secrets
- Your Client ID will be visible in the published extension anyway

### Can Someone Steal My Client ID?
- No security risk - Client IDs are designed to be public
- They're tied to your specific extension ID
- Can only be used with your extension's redirect URL
- Google validates the extension ID on every auth request

---

## 📞 Need Help?

### Google Cloud Console Issues
- Documentation: https://developers.google.com/identity/protocols/oauth2
- Support: https://cloud.google.com/support

### Chrome Identity API Issues
- Documentation: https://developer.chrome.com/docs/extensions/reference/identity/
- Stack Overflow: Tag `google-chrome-extension` + `chrome.identity`

### Extension-Specific Issues
- Email: contact@metalmindtech.com
- Include: Extension ID, error message, screenshot

---

## 🎯 Quick Reference

| What | Where to Find |
|------|---------------|
| Extension ID | Chrome Web Store Developer Dashboard |
| Project ID | Firebase Console → Project Settings |
| Client ID | Google Cloud Console → Credentials |
| OAuth Consent | Google Cloud Console → OAuth consent screen |

---

**Next Steps After Setup:**
1. Update both files with your Client ID
2. Run `npm run build`
3. Test sign-in locally
4. Run `npm run package`
5. Upload `echomind-pro-2.0.4.zip` to Chrome Web Store
6. Add reviewer notes from `CHROME_STORE_V2.0.4_SUBMISSION.md`
7. Submit for review

---

**Built by MetalMindTech**  
*Making Chrome Store compliance easy*
