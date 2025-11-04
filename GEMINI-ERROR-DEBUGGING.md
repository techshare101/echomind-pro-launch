# 🔍 Gemini Error Debugging — See Exact Upstream Errors

**Feature:** Detailed error logging from Google's Gemini API  
**Purpose:** See exactly what Google returns when requests fail  
**Status:** ✅ DEPLOYED

---

## 🎯 What This Does

Instead of seeing generic errors like:
```
⚠️ Gemini (via Forge Proxy) error: 502
```

You'll now see **exact upstream errors** from Google:
```
⚠️ Gemini error 403: Gemini upstream responded 403

Details: {"error":{"code":403,"message":"API key not valid. Please pass a valid API key.","status":"PERMISSION_DENIED"}}
```

---

## 🔧 What Was Changed

### **1. Firebase Proxy (functions/index.js)**
```javascript
const raw = await r.text(); // Capture entire response body

if (!r.ok) {
  console.error(`Gemini ${model} upstream error ${r.status}:`, raw);
  // Return detailed error to extension
  return res.status(r.status).json({
    ok: false,
    status: r.status,
    reason: `Gemini upstream responded ${r.status}`,
    details: raw.slice(0, 400) // Trim to avoid huge payloads
  });
}
```

### **2. Extension (popup.js)**
```javascript
if (!data.ok) {
  const errorDetails = data.details ? `\n\nDetails: ${data.details}` : "";
  return `⚠️ ${provider} error ${data.status || ""}: ${data.reason}${errorDetails}`;
}
```

---

## 📊 Common Errors You'll See

### **403 - API Key Invalid**
```
⚠️ Gemini error 403: Gemini upstream responded 403

Details: {"error":{"code":403,"message":"API key not valid. Please pass a valid API key.","status":"PERMISSION_DENIED"}}
```

**Fix:**
1. Go to https://aistudio.google.com/app/apikey
2. Generate a new API key
3. Make sure it starts with `AIza`
4. Paste into EchoMind settings

### **403 - API Not Enabled**
```
⚠️ Gemini error 403: Gemini upstream responded 403

Details: {"error":{"code":403,"message":"The caller does not have permission","status":"PERMISSION_DENIED"}}
```

**Fix:**
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Generative Language API"
3. Click "Enable"
4. Wait a few minutes

### **404 - Model Not Found**
```
⚠️ Gemini error 404: Gemini upstream responded 404

Details: {"error":{"code":404,"message":"models/gemini-1.5-flash-latest is not found"}}
```

**Fix:**
- Model name changed
- Proxy will try next model automatically
- If all 3 fail, Google may have changed their API

### **429 - Quota Exceeded**
```
⚠️ Gemini error 429: Gemini upstream responded 429

Details: {"error":{"code":429,"message":"Quota exceeded for quota metric 'Generate Content API requests per minute'"}}
```

**Fix:**
1. Wait a few minutes
2. Check quota at https://console.cloud.google.com/
3. Consider upgrading plan

### **500/502 - Google Server Error**
```
⚠️ Gemini error 500: Gemini upstream responded 500

Details: {"error":{"code":500,"message":"Internal server error"}}
```

**Fix:**
- Temporary Google outage
- Try again in a few minutes
- Check https://status.cloud.google.com/

---

## 🧪 Testing Instructions

### **1. Reload Extension**
```
chrome://extensions → Reload EchoMind Pro
```

### **2. Test Gemini**
```
1. Highlight text on any webpage
2. Right-click → "EchoMind: Summarize"
3. If error occurs, you'll see detailed message
```

### **3. Check Console**
```
1. Right-click popup → Inspect
2. Go to Console tab
3. Look for detailed error logs
```

---

## 🔍 Manual Testing

You can test your API key directly with curl:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello Gemini"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY"
```

**If this works:**
- Your key is valid
- API is enabled
- Proxy should work

**If this fails:**
- Check the error message
- Fix the issue (enable API, new key, etc.)
- Try again

---

## 📦 Deployment Status

✅ **geminiProxy function updated**  
✅ **Extension rebuilt: 30.11 kB**  
✅ **Detailed error logging enabled**

---

## 🎯 Error Resolution Flow

```
See error message
       ↓
Check error code
       ↓
403 → Fix API key/enable API
404 → Model name issue (auto-fallback)
429 → Wait/check quota
500 → Google issue, retry later
       ↓
Test again
       ↓
Should work!
```

---

## 💡 What You'll See

### **Before:**
```
⚠️ Gemini (via Forge Proxy) error: 502
```
(No idea what's wrong)

### **After:**
```
⚠️ Gemini error 403: Gemini upstream responded 403

Details: {"error":{"code":403,"message":"API key not valid. Please pass a valid API key.","status":"PERMISSION_DENIED"}}
```
(Exact problem identified!)

---

## ✅ Next Steps

1. **Reload extension**
2. **Test Gemini summarization**
3. **If error occurs, read the details**
4. **Fix the specific issue**
5. **Test again**

---

## 🔍 Troubleshooting Checklist

- [ ] API key starts with `AIza`
- [ ] API key is valid (not expired)
- [ ] Generative Language API is enabled
- [ ] Billing is active (if required)
- [ ] No quota exceeded
- [ ] Extension reloaded after changes

---

**Status:** ✅ **DETAILED ERROR LOGGING DEPLOYED**

**Please reload your extension and test Gemini. You'll now see exactly what Google's API returns! 🔍**

**This will help us identify and fix the exact issue! 🎯**
