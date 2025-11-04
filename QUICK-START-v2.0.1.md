# ⚡ EchoMind Pro v2.0.1 — Quick Start Guide

**Time to test:** 5 minutes  
**Status:** Ready to load and test immediately

---

## 🚀 Load Extension (30 seconds)

```bash
1. Open Chrome
2. Go to: chrome://extensions
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Navigate to: C:\Users\valen\Development\echomind\dist
6. Click "Select Folder"
7. ✅ Extension loaded!
```

---

## 🔧 First-Time Setup (2 minutes)

### **Step 1: Open Dashboard**
```bash
Click extension icon in toolbar
→ Dashboard opens
```

### **Step 2: Add API Key**
```bash
Click "Add Key" button in BYOK banner
→ Redirects to Settings page
```

### **Step 3: Enter Your Key**
```bash
Paste your API key:
- OpenRouter: sk-or-v1-...
- OpenAI: sk-proj-... or sk-...
- Claude: sk-ant-...
- Mistral: mistral-...
- Gemini: AIza...

✅ Watch for auto-detection: "✅ Detected: OpenRouter"
```

### **Step 4: Enable Cloud Mode**
```bash
Toggle "Use Cloud AI" → ON
```

### **Step 5: Save**
```bash
Click "💾 Save Settings"
→ Redirects to Dashboard after 1 second
```

### **Step 6: Verify**
```bash
Dashboard should show:
"🌩️ Cloud Mode: Connected to OpenRouter"
```

---

## 🧪 Quick Test (2 minutes)

### **Test 1: Summarize**
```bash
1. Go to any news article
2. Highlight a paragraph
3. Right-click → "EchoMind: Summarize"
4. Popup opens → Summary appears in 2-5 seconds
✅ Success!
```

### **Test 2: Check Console**
```bash
1. Right-click extension icon → "Inspect"
2. Go to Console tab
3. Should see:
   🤖 Using openrouter for summarization
   📊 Response status: 200 OK
   ✅ Extracted summary (...)
✅ Success!
```

### **Test 3: Check Vault**
```bash
1. Click extension icon → Dashboard
2. Scroll to Memory Vault
3. Should see your summary saved
✅ Success!
```

---

## 🔍 Quick Debug (if issues)

### **Issue: "Provider not detected"**
```bash
Check key format:
- OpenRouter: Must start with "sk-or-v1-"
- OpenAI: Must start with "sk-proj-" or "sk-"
- Claude: Must start with "sk-ant-"
- Mistral: Must start with "mistral-"
- Gemini: Must start with "AIza"
```

### **Issue: "Summarization not working"**
```bash
1. Open DevTools (Inspect service worker)
2. Check console for errors
3. Verify:
   - Cloud Mode is enabled
   - API key is saved
   - Network is online
```

### **Issue: "Dashboard shows Local Mode"**
```bash
1. Go to Settings
2. Verify "Use Cloud AI" toggle is ON
3. Click "💾 Save Settings"
4. Return to Dashboard
```

---

## 📊 Verify Storage (optional)

```javascript
// Run in DevTools Console:
chrome.storage.local.get(['openaiKey', 'enableCloud', 'providerDisplay'], (result) => {
  console.log('Storage:', result);
});

// Expected output:
// Storage: {
//   openaiKey: "sk-or-v1-...",
//   enableCloud: true,
//   providerDisplay: "OpenRouter"
// }
```

---

## ✅ Success Checklist

- [ ] Extension loads without errors
- [ ] Settings page opens
- [ ] Provider auto-detected correctly
- [ ] Settings save successfully
- [ ] Dashboard shows correct provider
- [ ] Summarization works
- [ ] Console shows API logs
- [ ] Summary saved to vault

**All checked? You're ready to go! 🎉**

---

## 🔥 Advanced Testing (optional)

### **Test Provider Switching**
```bash
1. Go to Settings
2. Replace OpenRouter key with Claude key
3. Save Settings
4. Return to Dashboard
5. Verify: "Connected to Anthropic (Claude)"
6. Test summarization
7. Check console: Should use Claude API
```

### **Test Local Mode**
```bash
1. Go to Settings
2. Disable "Use Cloud AI" toggle
3. Save Settings
4. Test summarization
5. Should use local Chrome AI (faster, less accurate)
```

### **Test Real-Time Sync**
```bash
1. Open Dashboard in one window
2. Open Settings in another window
3. Change key in Settings
4. Watch Dashboard update automatically (no refresh!)
```

---

## 📞 Need Help?

### **Quick Fixes**
- **No logs in console?** → Open DevTools BEFORE testing
- **401 Unauthorized?** → Invalid API key
- **403 Forbidden?** → Missing headers (shouldn't happen in v2.0.1)
- **Empty summary?** → Check response structure in console logs

### **Full Documentation**
- `TESTING-GUIDE-v2.0.1.md` — 30-test comprehensive suite
- `DEBUG-GUIDE.md` — Troubleshooting reference
- `UNIFIED-BYOK-ARCHITECTURE.md` — Technical details

---

## 🎯 Ready for Production?

If all tests pass:
1. ✅ Extension works locally
2. ✅ All providers detected
3. ✅ Real-time sync verified
4. ✅ No console errors

**→ Ready for Chrome Web Store submission! 🚀**

---

**Quick Start completed!**  
**Time elapsed:** ~5 minutes  
**Status:** ✅ Ready to use  
**Version:** 2.0.1
