# 🔨 EchoMind Pro v2.0.0 — Complete Rebuild Plan

## 📋 Chrome Rejection Summary

**Submission:** v1.0.1  
**Status:** ❌ Rejected  
**Date:** Oct 25, 2025  

### **Violations to Fix:**

| Ref ID | Category | Issue | Fix |
|--------|----------|-------|-----|
| **Blue Argon** | Remote Code | Firebase + Confetti loaded from CDN | ✅ Downloaded to `/lib/` |
| **Yellow Magnesium** | Broken Path | `src/popup/dashboard.html` doesn't exist | Fix manifest path |
| **Purple Potassium** | Unused Permission | `notifications` declared but not used | Remove from manifest |

---

## 🎯 v2.0.0 Feature Additions

### **1. BYOK (Bring Your Own Key)**
- Users can paste their own OpenAI API key
- Stored in `chrome.storage.local` (device-only)
- Toggle between Chrome AI (offline) and OpenAI GPT-4o (cloud)
- **Files:** `popup/settings.html`, `popup/settings.js`

### **2. Service Worker Heartbeat**
- Keeps background script alive
- Auto-reinitializes after each operation
- **Fixes:** "Works once then stops" bug
- **File:** `background.js`

### **3. Popup Selection Handler**
- Clicking toolbar icon reads highlighted text
- Adds `GET_SELECTION` message between popup ↔ content script
- **Fixes:** Popup can't read selection bug
- **Files:** `popup/popup.js`, `content/content.js`

### **4. Settings Navigation**
- After saving settings, redirect to dashboard
- **Fixes:** Blank page after save
- **File:** `popup/settings.js`

### **5. Contact Form Email**
- Switch to Gmail App Password or SendGrid
- **Fixes:** Contact form doesn't deliver
- **File:** `functions/index.js` (backend)

---

## 📁 New Folder Structure

```
echomind/
├── manifest.json          ← Fixed paths, removed notifications
├── background.js          ← Added heartbeat
├── popup/
│   ├── popup.html
│   ├── popup.js           ← Added GET_SELECTION handler
│   ├── dashboard.html     ← Path fixed in manifest
│   ├── dashboard.js
│   ├── settings.html      ← NEW: BYOK interface
│   ├── settings.js        ← NEW: BYOK logic
│   ├── vault.html
│   └── popup.css
├── content/
│   └── content.js         ← Added GET_SELECTION response
├── lib/                   ← NEW: Local libraries
│   ├── firebase/
│   │   ├── firebase-app-compat.js      ✅ Downloaded
│   │   └── firebase-auth-compat.js     ✅ Downloaded
│   └── confetti/
│       └── confetti.browser.min.js     ✅ Downloaded
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── functions/             ← Backend (separate deployment)
    └── index.js
```

---

## 🔧 Files to Modify

### **1. manifest.json**

**Changes:**
- ✅ Remove `"notifications"` from permissions
- ✅ Fix options_ui path: `"page": "popup/dashboard.html"`
- ✅ Add `/lib/**/*` to web_accessible_resources
- ✅ Update version to `"2.0.0"`

### **2. dashboard.html**

**Changes:**
- ❌ Remove: `<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>`
- ✅ Add: `<script src="../lib/firebase/firebase-app-compat.js"></script>`
- ❌ Remove: `<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>`
- ✅ Add: `<script src="../lib/firebase/firebase-auth-compat.js"></script>`

### **3. login.html**

**Changes:**
- ❌ Remove: `<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>`
- ✅ Add: `<script src="../lib/firebase/firebase-app-compat.js"></script>`
- ❌ Remove: `<script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>`
- ✅ Add: `<script src="../lib/firebase/firebase-auth-compat.js"></script>`

### **4. success.html**

**Changes:**
- ❌ Remove: `<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>`
- ✅ Add: `<script src="../lib/confetti/confetti.browser.min.js"></script>`

### **5. popup/settings.html** (NEW FILE)

**Purpose:** BYOK interface  
**Content:** See implementation below

### **6. popup/settings.js** (NEW FILE)

**Purpose:** BYOK storage logic  
**Content:** See implementation below

### **7. background.js**

**Changes:**
- ✅ Add heartbeat keepalive every 20 seconds
- ✅ Re-initialize after each summarize/explain operation

### **8. popup/popup.js**

**Changes:**
- ✅ Add `GET_SELECTION` message to content script
- ✅ Use BYOK key if `enableCloud` is true
- ✅ Fallback to Chrome AI if offline mode

### **9. content/content.js**

**Changes:**
- ✅ Add listener for `GET_SELECTION` message
- ✅ Return `window.getSelection().toString()`

---

## ✅ Implementation Checklist

### **Phase 1: Compliance Fixes (Required)**
- [x] Download Firebase libraries to `/lib/firebase/`
- [x] Download Confetti library to `/lib/confetti/`
- [ ] Update `manifest.json` (remove notifications, fix path)
- [ ] Update `dashboard.html` (local Firebase scripts)
- [ ] Update `login.html` (local Firebase scripts)
- [ ] Update `success.html` (local Confetti script)
- [ ] Test: Load unpacked, verify no remote script errors

### **Phase 2: BYOK Feature (New)**
- [ ] Create `popup/settings.html`
- [ ] Create `popup/settings.js`
- [ ] Update `popup/popup.js` (use BYOK key)
- [ ] Update `background.js` (use BYOK key)
- [ ] Test: Save key, toggle cloud mode, verify API calls

### **Phase 3: Bug Fixes (Stability)**
- [ ] Add heartbeat to `background.js`
- [ ] Add `GET_SELECTION` handler to `popup/popup.js`
- [ ] Add `GET_SELECTION` response to `content/content.js`
- [ ] Add settings redirect to `popup/settings.js`
- [ ] Test: Click icon after highlight, verify text appears

### **Phase 4: Backend (Optional)**
- [ ] Update Firebase function email credentials
- [ ] Test contact form delivery
- [ ] Deploy: `firebase deploy --only functions:sendContactEmail`

### **Phase 5: Final Testing**
- [ ] Load unpacked extension
- [ ] Test all features:
  - [ ] Summarize (right-click)
  - [ ] Explain (right-click)
  - [ ] Popup (click icon)
  - [ ] Settings (save BYOK key)
  - [ ] Dashboard (view saved items)
  - [ ] Vault (view history)
  - [ ] Contact form
- [ ] Check for console errors
- [ ] Verify no remote script loads (Network tab)
- [ ] Build production ZIP
- [ ] Submit to Chrome Web Store

---

## 🚀 Deployment Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Download libraries | 5 min | ✅ Done |
| Fix compliance issues | 30 min | 🔄 Next |
| Add BYOK feature | 45 min | ⏳ Pending |
| Fix bugs | 30 min | ⏳ Pending |
| Test locally | 20 min | ⏳ Pending |
| Submit v2.0.0 | 5 min | ⏳ Pending |
| **Total** | **~2.5 hours** | |

---

## 📊 Expected Outcome

### **Before (v1.0.1):**
```
❌ Remote scripts (Blue Argon)
❌ Broken dashboard path (Yellow Magnesium)
❌ Unused notifications permission (Purple Potassium)
❌ Service worker dies after first use
❌ Popup can't read selection
❌ Settings page blank after save
```

### **After (v2.0.0):**
```
✅ All scripts bundled locally
✅ Dashboard path fixed
✅ Only necessary permissions
✅ Service worker stays alive
✅ Popup reads selection
✅ Settings redirects to dashboard
✅ BYOK feature added
✅ Chrome Web Store compliant
```

---

## 🎯 Success Criteria

1. ✅ **No remote script violations**
2. ✅ **All manifest paths valid**
3. ✅ **Only used permissions declared**
4. ✅ **BYOK fully functional**
5. ✅ **All 7 bugs fixed**
6. ✅ **Passes Chrome Web Store review**

---

## 📝 Notes

- **No breaking changes** to existing features
- **Same permissions** as v1.0.1 (minus notifications)
- **Instant approval expected** (compliance + feature adds)
- **v1.0.1 stays frozen** (don't modify during v2 dev)

---

**Ready to hammer this tomorrow, bro! 🔨🔥**
