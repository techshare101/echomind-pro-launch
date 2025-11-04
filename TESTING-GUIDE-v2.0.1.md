# 🧪 EchoMind Pro v2.0.1 — Complete Testing Guide

## 🎯 Testing Objectives

Verify that the unified BYOK architecture works correctly:
1. Settings page is the only input point
2. All pages read from storage dynamically
3. Provider detection works for all 5 providers
4. Real-time sync across all pages
5. No duplicate UI or confusing flows

---

## 📋 Pre-Test Setup

### **1. Load Extension**
```bash
1. Open Chrome: chrome://extensions
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Navigate to: C:\Users\valen\Development\echomind\dist
5. Click "Select Folder"
6. Verify extension loads without errors
```

### **2. Open DevTools**
```bash
1. Right-click extension icon
2. Click "Inspect"
3. Go to Console tab
4. Keep open during all tests
```

### **3. Clear Previous Data**
```javascript
// Run in DevTools Console:
chrome.storage.local.clear(() => {
  console.log('✅ Storage cleared');
});

// Reload extension:
chrome.runtime.reload();
```

---

## 🧪 Test Suite 1: Settings Page (Single Source of Truth)

### **Test 1.1: Provider Detection — OpenRouter**
**Steps:**
1. Click extension icon → Dashboard
2. Click "Add Key" button
3. Paste OpenRouter key: `sk-or-v1-...`

**Expected Results:**
- ✅ "✅ Detected: OpenRouter" appears below input
- ✅ Text color changes to cyan (#38bdf8)
- ✅ Provider detection updates in real-time as you type

**Console Output:**
```
(none expected)
```

---

### **Test 1.2: Provider Detection — Claude (Anthropic)**
**Steps:**
1. Clear input field
2. Paste Claude key: `sk-ant-...`

**Expected Results:**
- ✅ "✅ Detected: Claude (Anthropic)" appears
- ✅ Text color changes to amber (#fbbf24)

---

### **Test 1.3: Provider Detection — Mistral**
**Steps:**
1. Clear input field
2. Paste Mistral key: `mistral-...`

**Expected Results:**
- ✅ "✅ Detected: Mistral AI" appears
- ✅ Text color changes to green (#34d399)

---

### **Test 1.4: Provider Detection — Gemini**
**Steps:**
1. Clear input field
2. Paste Gemini key: `AIza...`

**Expected Results:**
- ✅ "✅ Detected: Google Gemini" appears
- ✅ Text color changes to purple (#a78bfa)

---

### **Test 1.5: Provider Detection — OpenAI**
**Steps:**
1. Clear input field
2. Paste OpenAI key: `sk-proj-...` or `sk-...`

**Expected Results:**
- ✅ "✅ Detected: OpenAI" appears
- ✅ Text color changes to blue (#60a5fa)

---

### **Test 1.6: Save Settings**
**Steps:**
1. Enter OpenRouter key: `sk-or-v1-...`
2. Enable "Use Cloud AI" toggle
3. Click "💾 Save Settings"

**Expected Results:**
- ✅ "✅ Settings saved successfully!" message appears
- ✅ Green success banner shows
- ✅ Redirects to Dashboard after 1 second

**Console Output:**
```
(none expected)
```

**Verify Storage:**
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

### **Test 1.7: Test Connection**
**Steps:**
1. Enter valid OpenRouter key
2. Click "🔍 Test Connection"

**Expected Results:**
- ✅ "⏳ Testing connection..." appears
- ✅ After 1-2 seconds: "✅ Connection successful — OpenRouter key is valid!"
- ✅ Text color changes to green
- ✅ Success animation plays

**Console Output:**
```
✅ Provider saved: OpenRouter
```

---

## 🧪 Test Suite 2: Dashboard (Read-Only Display)

### **Test 2.1: Mode Status Display**
**Steps:**
1. Navigate to Dashboard (should auto-redirect after saving settings)

**Expected Results:**
- ✅ Mode status shows: "🌩️ **Cloud Mode:** Connected to **OpenRouter**"
- ✅ Text color is blue (#60a5fa)
- ✅ No input fields visible
- ✅ No duplicate toggles

---

### **Test 2.2: BYOK Banner (Active State)**
**Expected Results:**
- ✅ Banner has gradient background (green to blue)
- ✅ Icon shows: 🌩️
- ✅ Title: "Cloud Mode Active"
- ✅ Subtitle: "Using OpenRouter for AI summaries and explanations"
- ✅ Button text: "Settings"

---

### **Test 2.3: Real-Time Sync**
**Steps:**
1. Keep Dashboard open
2. Open Settings in new tab (right-click extension icon → click again)
3. Change key to Claude: `sk-ant-...`
4. Enable Cloud Mode
5. Save Settings
6. Switch back to Dashboard tab

**Expected Results:**
- ✅ Dashboard auto-updates without refresh
- ✅ Mode status changes to: "Connected to **Anthropic (Claude)**"
- ✅ BYOK banner subtitle updates to: "Using Anthropic (Claude) for..."

**Console Output:**
```
(none expected)
```

---

### **Test 2.4: Settings Button Navigation**
**Steps:**
1. Click "Settings" button in BYOK banner

**Expected Results:**
- ✅ Navigates to Settings page
- ✅ Shows saved key (masked as password)
- ✅ Cloud Mode toggle is enabled

---

### **Test 2.5: Local Mode Display**
**Steps:**
1. Go to Settings
2. Disable "Use Cloud AI" toggle
3. Save Settings
4. Return to Dashboard

**Expected Results:**
- ✅ Mode status shows: "🧠 Local Mode — Using Chrome Built-in AI"
- ✅ Text color is gray (#9ca3af)
- ✅ BYOK banner shows: "Local Mode Active"
- ✅ Banner subtitle: "OpenRouter key saved • Enable Cloud Mode in settings to use it"

---

## 🧪 Test Suite 3: Popup (Auto-Read from Storage)

### **Test 3.1: Summarization with Cloud AI**
**Steps:**
1. Go to Settings
2. Enter OpenRouter key
3. Enable Cloud Mode
4. Save Settings
5. Navigate to any webpage (e.g., news article)
6. Highlight a paragraph of text
7. Right-click → "EchoMind: Summarize"

**Expected Results:**
- ✅ Popup opens
- ✅ Shows "Processing..." with thinking animation
- ✅ Summary appears after 2-5 seconds
- ✅ No key prompt or input field

**Console Output (DevTools → Service Worker):**
```
🤖 Using openrouter for summarization
📡 Endpoint: https://openrouter.ai/api/v1/chat/completions
📋 Headers: {Authorization: "Bearer sk-or-***", HTTP-Referer: "...", ...}
📦 Body: {model: "openai/gpt-4o-mini", messages: Array(1)}
📊 Response status: 200 OK
📥 Response data: {id: "gen-...", choices: Array(1), ...}
✅ Extracted summary (245 chars): This article discusses...
```

---

### **Test 3.2: Explanation with Cloud AI**
**Steps:**
1. Highlight different text
2. Right-click → "EchoMind: Explain"

**Expected Results:**
- ✅ Popup opens
- ✅ Shows "Processing..." with thinking animation
- ✅ Explanation appears after 2-5 seconds
- ✅ Uses saved OpenRouter key automatically

**Console Output:**
```
🤖 Using openrouter for explanation
📊 Response status: 200 OK
✅ Extracted explanation (...)
```

---

### **Test 3.3: Local Mode Fallback**
**Steps:**
1. Go to Settings
2. Disable "Use Cloud AI" toggle
3. Save Settings
4. Highlight text on webpage
5. Right-click → "EchoMind: Summarize"

**Expected Results:**
- ✅ Popup opens
- ✅ Shows "Processing..." briefly
- ✅ Local summary appears (truncated, basic)
- ✅ Prefix: "🔐 Local Summary:"

**Console Output:**
```
(No API calls, uses local Chrome AI)
```

---

### **Test 3.4: No Key Entered**
**Steps:**
1. Clear storage: `chrome.storage.local.clear()`
2. Reload extension
3. Highlight text
4. Right-click → "EchoMind: Summarize"

**Expected Results:**
- ✅ Popup opens
- ✅ Uses local mode (no error)
- ✅ Shows basic local summary

---

## 🧪 Test Suite 4: Background Worker (Dynamic Storage)

### **Test 4.1: Context Menu Summarize**
**Steps:**
1. Ensure OpenRouter key is saved and Cloud Mode enabled
2. Highlight text on any webpage
3. Right-click → "EchoMind: Summarize"

**Expected Results:**
- ✅ Popup opens automatically
- ✅ Summary processes using OpenRouter
- ✅ No errors in console

**Console Output (Service Worker):**
```
🤖 Summarizing with OpenRouter
🤖 Using openrouter for summarization
📊 Response status: 200 OK
✅ Extracted summary (...)
```

---

### **Test 4.2: Context Menu Explain**
**Steps:**
1. Highlight different text
2. Right-click → "EchoMind: Explain"

**Expected Results:**
- ✅ Popup opens
- ✅ Explanation processes using OpenRouter
- ✅ Saved to Memory Vault

**Console Output:**
```
🤖 Explaining with OpenRouter
📊 Response status: 200 OK
✅ Extracted explanation (...)
```

---

### **Test 4.3: Provider Switching**
**Steps:**
1. Save OpenRouter key → Test summarize → Verify works
2. Go to Settings
3. Replace with Claude key: `sk-ant-...`
4. Save Settings
5. Test summarize again

**Expected Results:**
- ✅ First summary uses OpenRouter
- ✅ Second summary uses Claude (Anthropic)
- ✅ No errors during switch

**Console Output:**
```
// First request:
🤖 Using openrouter for summarization

// Second request (after switch):
🤖 Using anthropic for summarization
📡 Endpoint: https://api.anthropic.com/v1/messages
```

---

## 🧪 Test Suite 5: Memory Vault

### **Test 5.1: Save to Vault**
**Steps:**
1. Summarize text using Cloud AI
2. Go to Dashboard
3. Check Memory Vault section

**Expected Results:**
- ✅ Summary appears in vault
- ✅ Shows mode: "SUMMARY"
- ✅ Shows timestamp
- ✅ Shows full summary text

---

### **Test 5.2: Multiple Entries**
**Steps:**
1. Summarize 3 different texts
2. Explain 1 text
3. Check vault

**Expected Results:**
- ✅ 4 entries total
- ✅ 3 marked as "SUMMARY"
- ✅ 1 marked as "EXPLANATION"
- ✅ All have timestamps
- ✅ Newest appears first

---

### **Test 5.3: Clear Vault**
**Steps:**
1. Click "🧹 Clear Vault" button
2. Confirm dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirming: "Vault cleared." message
- ✅ All entries removed
- ✅ Shows: "Vault is empty. Start using EchoMind to save summaries!"

---

## 🧪 Test Suite 6: Edge Cases

### **Test 6.1: Invalid API Key**
**Steps:**
1. Go to Settings
2. Enter invalid key: `sk-or-v1-invalid123`
3. Enable Cloud Mode
4. Save Settings
5. Try to summarize text

**Expected Results:**
- ✅ Settings save successfully (no validation on save)
- ✅ Summarization fails with error
- ✅ Console shows: `❌ openrouter Error: 401 - Unauthorized`
- ✅ Popup shows error message

---

### **Test 6.2: Network Offline**
**Steps:**
1. Disconnect internet
2. Try to summarize with Cloud Mode enabled

**Expected Results:**
- ✅ Shows network error
- ✅ Console shows: `❌ Error calling openrouter API: Failed to fetch`
- ✅ Graceful error handling (no crash)

---

### **Test 6.3: Empty Text Selection**
**Steps:**
1. Don't highlight any text
2. Right-click → "EchoMind: Summarize"

**Expected Results:**
- ✅ Popup opens
- ✅ Shows: "Please highlight some text first ⚠️"
- ✅ No API call made

---

### **Test 6.4: Very Long Text**
**Steps:**
1. Highlight entire long article (5000+ words)
2. Right-click → "EchoMind: Summarize"

**Expected Results:**
- ✅ Popup opens
- ✅ Processing takes longer (10-15 seconds)
- ✅ Summary appears successfully
- ✅ No timeout errors

---

### **Test 6.5: Special Characters in Text**
**Steps:**
1. Highlight text with emojis, unicode, code snippets
2. Summarize

**Expected Results:**
- ✅ Handles special characters correctly
- ✅ Summary preserves meaning
- ✅ No encoding errors

---

## 🧪 Test Suite 7: Storage Persistence

### **Test 7.1: Extension Reload**
**Steps:**
1. Save OpenRouter key with Cloud Mode enabled
2. Go to chrome://extensions
3. Click "Reload" button on EchoMind Pro
4. Open Dashboard

**Expected Results:**
- ✅ Settings persist after reload
- ✅ Dashboard shows correct provider
- ✅ Summarization still works

---

### **Test 7.2: Browser Restart**
**Steps:**
1. Save settings
2. Close Chrome completely
3. Reopen Chrome
4. Check Dashboard

**Expected Results:**
- ✅ All settings persist
- ✅ API key still saved
- ✅ Cloud Mode still enabled

---

### **Test 7.3: Multiple Windows**
**Steps:**
1. Open Dashboard in Window 1
2. Open Settings in Window 2
3. Change key in Window 2
4. Check Window 1

**Expected Results:**
- ✅ Window 1 auto-updates (real-time sync)
- ✅ No need to refresh

---

## 📊 Test Results Summary

### **Pass Criteria:**
- All 7 test suites pass
- No console errors
- Storage schema correct
- Real-time sync works
- All 5 providers detected correctly

### **Test Results Template:**
```
✅ Test Suite 1: Settings Page — PASS (7/7)
✅ Test Suite 2: Dashboard — PASS (5/5)
✅ Test Suite 3: Popup — PASS (4/4)
✅ Test Suite 4: Background — PASS (3/3)
✅ Test Suite 5: Memory Vault — PASS (3/3)
✅ Test Suite 6: Edge Cases — PASS (5/5)
✅ Test Suite 7: Persistence — PASS (3/3)

Total: 30/30 tests passed ✅
```

---

## 🐛 Bug Report Template

If you find issues, report using this format:

```markdown
**Test:** [Test Suite X.Y: Test Name]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Output:** [Paste console errors]
**Storage State:** [Run chrome.storage.local.get() and paste]
**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3
```

---

## 🚀 Ready for Production?

After completing all tests:

- [ ] All 30 tests pass
- [ ] No console errors
- [ ] Storage schema correct
- [ ] Real-time sync verified
- [ ] All providers work
- [ ] Edge cases handled
- [ ] Documentation complete

**If all checked → Ready for Chrome Web Store submission! 🎉**

---

**Testing completed by:** _____________  
**Date:** _____________  
**Version tested:** v2.0.1  
**Build:** echomind-pro-v2.0.1-unified.zip
