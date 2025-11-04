# 🔥 QUICK DEBUG REFERENCE

## 🎯 Open Console
1. Right-click extension icon → **Inspect**
2. Or: `chrome://extensions` → **EchoMind Pro** → **service worker**

## 🔍 What to Look For

### ✅ **GOOD (Working):**
```
🤖 Using openrouter for summarization
📊 Response status: 200 OK
✅ Extracted summary (245 chars): This article...
```

### ❌ **BAD (Not Working):**
```
❌ openrouter Error: 401 - Unauthorized
❌ openrouter Error: 403 - Forbidden
No summary available.
```

## 🛠️ Quick Fixes

| Problem | Fix |
|---------|-----|
| No logs appear | Open DevTools BEFORE summarizing |
| 401 Unauthorized | Invalid API key → Check settings |
| 403 Forbidden | Missing headers → Reload extension |
| Empty summary | Wrong response path → Check logs |
| Cloud mode off | Enable in Settings → Save |

## 📋 Test Checklist

1. [ ] Settings → Cloud Mode **ON**
2. [ ] Settings → API Key **saved**
3. [ ] Settings → Test Connection **✅ successful**
4. [ ] DevTools → Console **open**
5. [ ] Highlight text → Right-click → **Summarize**
6. [ ] Check console for **🤖 emoji logs**

## 🔑 Key Formats

| Provider | Key Format | Example |
|----------|-----------|---------|
| OpenRouter | `sk-or-v1-...` | `sk-or-v1-abc123...` |
| OpenAI | `sk-proj-...` or `sk-...` | `sk-proj-xyz789...` |
| Claude | `sk-ant-...` | `sk-ant-api03-...` |
| Mistral | `mistral-...` | `mistral-abc123...` |
| Gemini | `AIza...` | `AIzaSyAbc123...` |

## 🚨 Emergency Debug

Run in console:
```javascript
chrome.storage.local.get(['enableCloud', 'openaiKey'], (r) => {
  console.log('Cloud:', r.enableCloud, '| Key:', r.openaiKey?.substring(0,10));
});
```

Expected output:
```
Cloud: true | Key: sk-or-v1-a
```

---

**If you see 🤖 logs but no summary → Check response structure in logs!**
**If you see ❌ errors → Check error code and message!**
**If you see nothing → Open DevTools BEFORE testing!**
