# 🔧 Build and Test Guide for EchoMind

Complete step-by-step guide to build, install, and test EchoMind.

---

## ⚡ Quick Start (5 Steps)

### 1. Install Dependencies

```bash
cd c:/Users/valen/Development/echomind
npm install
```

Wait for all packages to install (~1-2 minutes).

### 2. Create Placeholder Icons

You need 3 icon files. **Quick method** - use an online generator:

**Option A: Favicon Generator (Easiest)**
1. Visit https://favicon.io/favicon-generator/
2. Settings:
   - Text: **"E"**
   - Background: **Rounded**
   - Font Color: **#FFFFFF**
   - Background Color: **#6366f1**
   - Font Family: **Bold**
3. Download the generated icons
4. Rename and copy to `public/icons/`:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-48x48.png` → `icon48.png` (may need to generate separately)
   - `android-chrome-192x192.png` → resize to 128x128 → `icon128.png`

**Option B: Manual SVG Creation**

Create `icon-template.svg`:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <text x="64" y="88" font-family="Arial" font-size="80" font-weight="bold" 
        fill="white" text-anchor="middle">E</text>
</svg>
```

Then convert to PNG using any online SVG-to-PNG converter at 128x128, 48x48, and 16x16.

### 3. Build the Extension

```bash
npm run build
```

This creates the `dist/` folder with the compiled extension.

**Expected output:**
```
vite v5.0.8 building for production...
✓ built in 3.21s
```

### 4. Enable Chrome AI Flags

Open Chrome Canary and set these flags:

```
chrome://flags/#optimization-guide-on-device-model
→ Enabled BypassPerfRequirement

chrome://flags/#prompt-api-for-gemini-nano
→ Enabled

chrome://flags/#summarization-api-for-gemini-nano
→ Enabled

chrome://flags/#rewriter-api-for-gemini-nano
→ Enabled
```

**Restart Chrome Canary**

### 5. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the **`dist`** folder
5. EchoMind should appear! 🎉

---

## 🧪 Testing the Extension

### Trigger AI Model Download

Before testing, ensure the AI model is downloaded:

1. Open DevTools (F12) on any page
2. Paste in Console:
   ```javascript
   await window.ai.summarizer.create();
   ```
3. Wait for confirmation (may take 5-10 minutes on first run)

### Test with Demo Page

Open the test page:

```
file:///c:/Users/valen/Development/echomind/test/test-page.html
```

Or navigate to any webpage (Wikipedia works great).

### Test Flow

1. **Highlight Text** (at least 10 characters)
2. **Verify Menu Appears** - Cosmic gradient menu with 4 buttons
3. **Click "Summarize"** - Should show loading indicator
4. **Open Extension Popup** - Click EchoMind icon in toolbar
5. **View Result** - Should display summary on Home tab
6. **Check Vault** - Click "Vault" tab to see saved insight
7. **Test Search** - Type in search box to filter insights
8. **Test Delete** - Click trash icon to remove an insight

---

## 🐛 Troubleshooting

### "Chrome AI not available"

**Cause:** AI APIs not enabled or model not downloaded

**Fix:**
1. Verify you're using Chrome Canary (not stable Chrome)
2. Check all 4 flags are enabled in `chrome://flags`
3. Restart Chrome completely
4. Trigger model download (see above)
5. Wait 5-10 minutes for download to complete

### "Menu doesn't appear when highlighting"

**Cause:** Content script not injected or page not refreshed

**Fix:**
1. Refresh the webpage after installing extension
2. Ensure you're highlighting at least 10 characters
3. Check extension is enabled in `chrome://extensions/`
4. Check console for errors (F12)

### "Build errors"

**Cause:** Missing dependencies or version mismatch

**Fix:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Popup is blank"

**Cause:** Build issue or missing files

**Fix:**
1. Check `dist/` folder exists with these files:
   - `popup.html`
   - `popup.js`
   - `background.js`
   - `content.js`
   - `manifest.json`
2. Rebuild: `npm run build`
3. Reload extension in `chrome://extensions/` (click reload icon)

### Extension loads but AI fails

**Cause:** Model still downloading or not available

**Fix:**
1. Open any page, press F12
2. Check AI availability:
   ```javascript
   await window.ai?.summarizer?.capabilities()
   // Should return: { available: "readily" }
   ```
3. If returns "after-download", wait for download
4. If returns "no" or undefined, re-enable flags

---

## 🔍 Development Mode

### Watch Mode (Live Reload)

```bash
npm run dev
```

After making code changes:
1. Save your files
2. Go to `chrome://extensions/`
3. Click the reload icon on EchoMind card
4. Refresh any test pages

### Check Logs

**Background Script Logs:**
1. Go to `chrome://extensions/`
2. Find EchoMind
3. Click "Errors" or "Service Worker" link
4. View console logs

**Content Script Logs:**
1. Open any webpage
2. Press F12
3. Check Console tab for "🧠 EchoMind content script loaded"

**Popup Logs:**
1. Right-click extension icon
2. Select "Inspect popup"
3. View console in DevTools

---

## ✅ Verification Checklist

Before considering the extension "working":

- [ ] Dependencies installed without errors
- [ ] Icons created (16, 48, 128 px)
- [ ] Build completes successfully
- [ ] Extension loads in Chrome without errors
- [ ] AI flags enabled and browser restarted
- [ ] AI model downloaded (check with DevTools)
- [ ] Text selection shows cosmic menu
- [ ] Summarize action works and shows result
- [ ] Explain action works
- [ ] Simplify action works
- [ ] Save action adds to vault
- [ ] Vault displays saved insights
- [ ] Search filters insights correctly
- [ ] Delete removes insights
- [ ] No console errors in any context

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Record Demo Video** (2-3 minutes)
   - Show highlight → action → result flow
   - Demonstrate Memory Vault
   - Highlight privacy (all local)

2. **Prepare for Submission**
   - Update README with screenshots
   - Fill out DEVPOST.md completely
   - Create GitHub repository
   - Package as .zip

3. **Optional Enhancements**
   - Create professional icon designs
   - Add keyboard shortcuts
   - Improve error messages
   - Add translation feature
   - Implement voice mode

---

## 📞 Need Help?

Check these resources:

- **Setup Guide**: `SETUP.md`
- **Quick Start**: `QUICKSTART.md`
- **Project Status**: `PROJECT_STATUS.md`
- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/built-in

Common issues are usually:
1. Wrong Chrome version (need Canary)
2. Flags not enabled
3. Model not downloaded
4. Extension not reloaded after changes

---

**You're ready to forge! 🔥🧠✨**
