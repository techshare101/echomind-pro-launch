# 🔍 Gemini Troubleshooting Guide

**Issue:** "All model routes failed" error  
**Status:** Debugging enabled  
**Next Steps:** Check console for detailed error messages

---

## 🧪 Testing Steps

### **1. Reload Extension**
```
chrome://extensions → Reload EchoMind Pro
```

### **2. Open DevTools Console**
```
1. Right-click on extension popup
2. Click "Inspect"
3. Go to "Console" tab
```

### **3. Test Gemini Summarization**
```
1. Highlight text on any webpage
2. Right-click → "EchoMind: Summarize"
3. Watch console for detailed error messages
```

---

## 📊 What to Look For in Console

### **Success:**
```
🤖 Using Gemini (standalone with fallback) for summarization
📡 Trying: gemini-1.5-flash-latest
✅ Success with gemini-1.5-flash-latest (64ms)
```

### **API Key Issue:**
```
⚠️ Gemini gemini-1.5-flash-latest returned 403: {
  "error": {
    "code": 403,
    "message": "API key not valid"
  }
}
```

### **Model Not Found:**
```
⚠️ Gemini gemini-1.5-flash-latest returned 404: {
  "error": {
    "code": 404,
    "message": "Model not found"
  }
}
```

### **Quota Exceeded:**
```
⚠️ Gemini gemini-1.5-flash-latest returned 429: {
  "error": {
    "code": 429,
    "message": "Quota exceeded"
  }
}
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: API Key Not Enabled**
**Error:** `403 - API key not valid`

**Solution:**
1. Go to https://aistudio.google.com/app/apikey
2. Make sure your API key is enabled
3. Check that "Generative Language API" is enabled
4. Generate a new key if needed

### **Issue 2: API Not Enabled**
**Error:** `403 - The caller does not have permission`

**Solution:**
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Generative Language API"
3. Click "Enable"
4. Wait a few minutes for propagation

### **Issue 3: Quota Exceeded**
**Error:** `429 - Quota exceeded`

**Solution:**
1. Wait a few minutes
2. Check your quota at https://console.cloud.google.com/
3. Consider upgrading your plan

### **Issue 4: Model Deprecated**
**Error:** `404 - Model not found`

**Solution:**
- The fallback chain should handle this automatically
- If all 3 models return 404, Google may have changed their API
- Check console for which models were tried

---

## 🧪 Manual API Test

You can test your Gemini API key directly with curl:

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, how are you?"
      }]
    }]
  }'
```

**Expected Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "I'm doing well, thank you for asking! ..."
      }]
    }
  }]
}
```

---

## 📋 Checklist

Before reporting an issue, verify:

- [ ] API key starts with `AIza`
- [ ] API key is valid (validation shows green checkmark)
- [ ] Generative Language API is enabled in Google Cloud Console
- [ ] DevTools console is open to see error messages
- [ ] Extension was reloaded after changes
- [ ] Tried with a fresh API key

---

## 🔍 Debug Information to Collect

If the issue persists, collect this information:

1. **Console Logs:**
   - Copy all messages starting with `🤖 Using Gemini`
   - Include any `⚠️` or `❌` messages

2. **API Key Format:**
   - First 10 characters: `AIza______`
   - Length: Should be ~39 characters

3. **Error Response:**
   - HTTP status code (403, 404, 429, etc.)
   - Error message from API

4. **Validation Status:**
   - Does validation show green checkmark?
   - How many models does it show?

---

## 🎯 What Changed

### **v2.0.2 (Current):**
- ✅ Added detailed error logging
- ✅ Simplified request format
- ✅ Better error messages in console

### **Changes Made:**
1. Removed complex prompt formatting (just send text)
2. Added error text logging to see API responses
3. Simplified request structure

---

## 🧪 Next Steps

### **1. Test with New Build**
```
1. Reload extension
2. Open DevTools Console
3. Try summarization
4. Check console for detailed error messages
```

### **2. Share Console Output**
If it still fails, share:
- The exact error messages from console
- The HTTP status codes
- Any JSON error responses

### **3. Verify API Key**
```
1. Go to https://aistudio.google.com/app/apikey
2. Generate a fresh API key
3. Copy it exactly (no spaces)
4. Paste into EchoMind settings
5. Test again
```

---

## 💡 Common Mistakes

### **Mistake 1: Old API Key**
- Google may have deprecated your old key
- Solution: Generate a new one

### **Mistake 2: API Not Enabled**
- Generative Language API must be enabled
- Solution: Enable it in Google Cloud Console

### **Mistake 3: Spaces in Key**
- Accidentally copied with spaces
- Solution: Copy again carefully

### **Mistake 4: Wrong API**
- Using Vertex AI key instead of AI Studio key
- Solution: Use key from https://aistudio.google.com/app/apikey

---

## ✅ Expected Behavior

When working correctly, you should see:

```
Console:
🤖 Using Gemini (standalone with fallback) for summarization
📡 Trying: gemini-1.5-flash-latest
✅ Success with gemini-1.5-flash-latest (64ms)

Popup:
☁️ Cloud Summary: Gemini
🤖 Gemini (gemini-1.5-flash-latest)  ⏱️ 64ms
Summary: [AI-generated text...]
```

---

**Status:** ✅ **DEBUGGING ENABLED**

**Please:**
1. Reload extension
2. Open DevTools Console
3. Try summarization
4. Share the console output

**This will help us identify the exact issue! 🔍**
