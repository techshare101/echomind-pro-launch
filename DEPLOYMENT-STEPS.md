# 🚀 EchoMind Pro — Deployment Steps

**Status:** Ready to deploy Firebase Cloud Function  
**Date:** January 26, 2025

---

## 📋 Quick Deployment Checklist

### **1. Deploy Firebase Cloud Function**
```bash
cd c:\Users\valen\Development\echomind\functions
firebase deploy --only functions:validateKey
```

**Expected Output:**
```
✔ functions[validateKey(us-central1)] Successful create operation.
Function URL (validateKey): https://us-central1-echomind-pro-launch.cloudfunctions.net/validateKey
```

### **2. Test Cloud Function**
```bash
# Test with curl (Windows PowerShell)
curl -X POST `
  https://us-central1-echomind-pro-launch.cloudfunctions.net/validateKey `
  -H "Content-Type: application/json" `
  -d '{"apiKey":"sk-or-v1-..."}'
```

**Expected Response:**
```json
{
  "ok": true,
  "status": 200,
  "provider": "OpenRouter",
  "endpoint": "https://openrouter.ai/api/v1/models",
  "latency": 302,
  "modelCount": 127,
  "reason": "Key validated successfully"
}
```

### **3. Reload Extension**
```
1. Open chrome://extensions
2. Find "EchoMind Pro"
3. Click "Reload" button
```

### **4. Test in Extension**
```
1. Open Settings
2. Paste your OpenRouter key: sk-or-v1-...
3. Click "Validate API Connection"
4. Should see: "✅ OpenRouter key validated successfully (302ms) — 127 models available"
```

---

## 🧪 Full Testing Sequence

### **Test 1: OpenRouter Key**
```
Key: sk-or-v1-e19773f606b299d91b7f02b4f5b14df8348456ebeb2b4975cf01
Expected: ✅ OpenRouter key validated successfully (250-500ms) — ~127 models
```

### **Test 2: Mistral Key (New Format)**
```
Key: 1LxO6eV0UDD2t... (your actual key)
Expected: ✅ Mistral key validated successfully (200-450ms) — ~8 models
```

### **Test 3: OpenAI Key**
```
Key: sk-proj-...
Expected: ✅ OpenAI key validated successfully (200-400ms) — ~50 models
```

### **Test 4: Invalid Key**
```
Key: sk-invalid123
Expected: ❌ OpenAI: Error 401 - Unauthorized
```

---

## 🔍 Troubleshooting

### **If Deploy Fails**
```bash
# Check Firebase login
firebase login

# Check project
firebase use echomind-pro-launch

# Try deploy again
firebase deploy --only functions:validateKey
```

### **If Function Returns 500**
```bash
# Check logs
firebase functions:log --only validateKey

# Common issues:
# 1. node-fetch not installed
cd functions
npm install node-fetch

# 2. Redeploy
firebase deploy --only functions:validateKey
```

### **If Extension Still Shows "Network Error"**
1. Check function URL is correct in settings.js:
   ```javascript
   const endpoint = 'https://us-central1-echomind-pro-launch.cloudfunctions.net/validateKey';
   ```
2. Rebuild extension:
   ```bash
   npm run build
   ```
3. Reload extension in Chrome

---

## ✅ Success Criteria

- [ ] Cloud Function deployed successfully
- [ ] Function URL accessible
- [ ] Test curl returns valid response
- [ ] Extension validation works for all providers
- [ ] No more "Network error" messages
- [ ] Latency and model count displayed

---

## 📞 Need Help?

If you encounter any issues:
1. Check Firebase logs: `firebase functions:log --only validateKey`
2. Test function directly with curl
3. Verify extension is using correct endpoint
4. Rebuild and reload extension

---

**Status:** ✅ Ready to deploy!  
**Next Step:** Run `firebase deploy --only functions:validateKey`
