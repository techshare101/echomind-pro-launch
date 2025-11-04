# 🔍 EchoMind Pro v2.0.0 — Debug Guide

## 🐛 Issue: OpenRouter Returns Empty Summary

### **Symptoms:**
- Button pulses (processing)
- Quickly returns to complete
- No summary text appears
- Console shows no errors

### **Root Causes:**

#### **1. Missing Required Headers (OpenRouter)**
OpenRouter **requires** these headers or it returns empty:
```javascript
headers = {
  'Authorization': `Bearer ${apiKey}`,
  'HTTP-Referer': 'https://echomind-pro-launch.vercel.app',  // REQUIRED
  'X-Title': 'EchoMind Pro',                                  // REQUIRED
  'Content-Type': 'application/json'
};
```

#### **2. Wrong Response Path**
Each provider has different response structure:
```javascript
// OpenRouter, OpenAI, Mistral:
data.choices[0].message.content

// Claude (Anthropic):
data.content[0].text

// Gemini:
data.candidates[0].content.parts[0].text
```

#### **3. Cloud Mode Not Enabled**
If `enableCloud` is false, it falls back to local mode (truncated text).

---

## 🔧 Debug Logging Added

### **What's Now Logged:**

```javascript
🤖 Using openrouter for summarization
📡 Endpoint: https://openrouter.ai/api/v1/chat/completions
📋 Headers: { Authorization: "Bearer sk-or-...", ... }
📦 Body: { model: "openai/gpt-4o-mini", messages: [...] }
📊 Response status: 200 OK
📥 Response data: { choices: [...], ... }
✅ Extracted summary (150 chars): This is a summary of...
```

### **How to View Logs:**

1. **Open Chrome DevTools:**
   - Right-click extension icon → Inspect
   - Or: `chrome://extensions` → EchoMind Pro → "service worker" link

2. **Trigger Summarization:**
   - Highlight text on any page
   - Right-click → "EchoMind: Summarize"

3. **Check Console:**
   - Look for 🤖 emoji logs
   - Check for ❌ error messages
   - Verify response data structure

---

## 🎯 Testing Each Provider

### **OpenRouter:**
```bash
Expected logs:
🤖 Using openrouter for summarization
📡 Endpoint: https://openrouter.ai/api/v1/chat/completions
📋 Headers: { HTTP-Referer: "...", X-Title: "..." }
📊 Response status: 200 OK
✅ Extracted summary (...)

Common issues:
❌ 401 Unauthorized → Invalid key
❌ 403 Forbidden → Missing headers
❌ Empty response → Check response data structure
```

### **OpenAI:**
```bash
Expected logs:
🤖 Using openai for summarization
📡 Endpoint: https://api.openai.com/v1/chat/completions
📊 Response status: 200 OK
✅ Extracted summary (...)

Common issues:
❌ 401 Unauthorized → Invalid key
❌ 429 Too Many Requests → Rate limit
```

### **Claude (Anthropic):**
```bash
Expected logs:
🤖 Using anthropic for summarization
📡 Endpoint: https://api.anthropic.com/v1/messages
📋 Headers: { x-api-key: "...", anthropic-version: "..." }
📊 Response status: 200 OK
✅ Extracted summary (...)

Common issues:
❌ 401 Unauthorized → Invalid key
❌ Wrong endpoint → Must use /messages not /chat/completions
```

### **Mistral:**
```bash
Expected logs:
🤖 Using mistral for summarization
📡 Endpoint: https://api.mistral.ai/v1/chat/completions
📊 Response status: 200 OK
✅ Extracted summary (...)

Common issues:
❌ 401 Unauthorized → Invalid key
❌ Wrong model name → Use "mistral-small-latest"
```

### **Gemini:**
```bash
Expected logs:
🤖 Using gemini for summarization
📡 Endpoint: https://generativelanguage.googleapis.com/v1beta/models/...
📊 Response status: 200 OK
✅ Extracted summary (...)

Common issues:
❌ 400 Bad Request → Wrong endpoint format
❌ 403 Forbidden → API not enabled or invalid key
```

---

## 🔍 Troubleshooting Steps

### **Step 1: Verify Cloud Mode is ON**
```javascript
// In console:
chrome.storage.local.get(['enableCloud', 'openaiKey'], (result) => {
  console.log('Cloud Mode:', result.enableCloud);
  console.log('Has Key:', !!result.openaiKey);
});
```

### **Step 2: Check Key Format**
```javascript
// In console:
chrome.storage.local.get(['openaiKey'], (result) => {
  const key = result.openaiKey;
  console.log('Key starts with:', key.substring(0, 7));
  
  if (key.startsWith('sk-or-')) console.log('✅ OpenRouter key detected');
  else if (key.startsWith('sk-ant-')) console.log('✅ Anthropic key detected');
  else if (key.startsWith('mistral-')) console.log('✅ Mistral key detected');
  else if (key.startsWith('AIza')) console.log('✅ Gemini key detected');
  else if (key.startsWith('sk-')) console.log('✅ OpenAI key detected');
  else console.log('❌ Unknown key format');
});
```

### **Step 3: Test API Key Manually**
```bash
# OpenRouter
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "HTTP-Referer: https://echomind-pro-launch.vercel.app" \
  -H "X-Title: EchoMind Pro" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-4o-mini","messages":[{"role":"user","content":"Test"}]}'

# OpenAI
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Test"}]}'
```

### **Step 4: Check Response Structure**
Look at the `📥 Response data:` log and verify:
```javascript
// OpenRouter/OpenAI/Mistral should have:
{
  choices: [
    {
      message: {
        content: "The summary text here..."
      }
    }
  ]
}

// Claude should have:
{
  content: [
    {
      text: "The summary text here..."
    }
  ]
}

// Gemini should have:
{
  candidates: [
    {
      content: {
        parts: [
          {
            text: "The summary text here..."
          }
        ]
      }
    }
  ]
}
```

---

## 🎯 Quick Fixes

### **Fix 1: OpenRouter Empty Response**
**Cause:** Missing HTTP-Referer or X-Title headers
**Solution:** Already fixed in v2.0.0 — rebuild and reload extension

### **Fix 2: Wrong Provider Detected**
**Cause:** Key format not recognized
**Solution:** Use Test Connection button in settings to verify

### **Fix 3: Cloud Mode Not Working**
**Cause:** Toggle is off
**Solution:** 
1. Go to Settings
2. Enable "Use Cloud Mode"
3. Save Settings

### **Fix 4: Rate Limit Errors**
**Cause:** Too many requests
**Solution:** Wait a few minutes or use different provider

---

## 📊 Expected Console Output

### **Successful Summarization:**
```
🤖 Using openrouter for summarization
📡 Endpoint: https://openrouter.ai/api/v1/chat/completions
📋 Headers: {Authorization: "Bearer sk-or-***", HTTP-Referer: "...", ...}
📦 Body: {model: "openai/gpt-4o-mini", messages: Array(1)}
📊 Response status: 200 OK
📥 Response data: {id: "gen-...", choices: Array(1), ...}
✅ Extracted summary (245 chars): This article discusses the importance of...
```

### **Failed Summarization:**
```
🤖 Using openrouter for summarization
📡 Endpoint: https://openrouter.ai/api/v1/chat/completions
📋 Headers: {Authorization: "Bearer sk-or-***", ...}
📦 Body: {model: "openai/gpt-4o-mini", messages: Array(1)}
📊 Response status: 401 Unauthorized
❌ API Error (401): {"error":{"message":"Invalid API key"}}
```

---

## 🔥 Debug Checklist

Before reporting an issue, verify:

- [ ] Cloud Mode is enabled in Settings
- [ ] API key is saved and correct format
- [ ] Test Connection shows "✅ Connection successful"
- [ ] Chrome DevTools console is open
- [ ] Logs show correct provider detected
- [ ] Response status is 200 OK
- [ ] Response data has expected structure
- [ ] No ❌ error messages in console

---

## 💡 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `❌ openrouter Error: 401` | Invalid API key | Check key in settings |
| `❌ openrouter Error: 403` | Missing headers | Rebuild extension (fixed in v2.0.0) |
| `❌ openrouter Error: 429` | Rate limit | Wait or use different provider |
| `No summary available.` | Empty response | Check response structure in logs |
| `Unsupported provider` | Unknown key format | Verify key starts with correct prefix |
| `Network error` | CORS or connection | Check internet connection |

---

## 🚀 Next Steps

1. **Load unpacked extension** with debug build
2. **Open DevTools** (Inspect service worker)
3. **Test summarization** with your OpenRouter key
4. **Check console logs** for detailed output
5. **Report findings** with console output

---

**With these debug logs, we can see exactly what's happening with OpenRouter! 🔍⚡**
