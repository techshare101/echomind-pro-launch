# 🔧 EchoMind Setup Guide

Complete guide to get EchoMind running on your system.

## Prerequisites

### 1. Chrome Browser (Canary or Dev Channel)

EchoMind requires Chrome's experimental AI features, which are currently only available in:
- **Chrome Canary** (recommended)
- **Chrome Dev**

**Download Chrome Canary:**
- Windows/Mac/Linux: https://www.google.com/chrome/canary/

### 2. Node.js and npm

- Node.js 18+ required
- Download: https://nodejs.org/

Verify installation:
```bash
node --version
npm --version
```

## Step-by-Step Installation

### Step 1: Enable Chrome AI Features

1. **Open Chrome Canary**

2. **Enable Optimization Guide**
   - Navigate to: `chrome://flags/#optimization-guide-on-device-model`
   - Set to: **"Enabled BypassPerfRequirement"**

3. **Enable Prompt API**
   - Navigate to: `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to: **"Enabled"**

4. **Enable Summarization API**
   - Navigate to: `chrome://flags/#summarization-api-for-gemini-nano`
   - Set to: **"Enabled"**

5. **Enable Rewriter API**
   - Navigate to: `chrome://flags/#rewriter-api-for-gemini-nano`
   - Set to: **"Enabled"**

6. **Restart Chrome Canary**

### Step 2: Trigger Model Download

Chrome needs to download the AI model to your device:

1. Open DevTools (F12) on any webpage
2. Run this in the Console:
   ```javascript
   await window.ai.summarizer.create();
   ```
3. If it says "Model downloading...", wait a few minutes
4. Verify it's ready:
   ```javascript
   await window.ai.summarizer.capabilities();
   // Should return: { available: "readily" }
   ```

### Step 3: Install EchoMind

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/echomind.git
   cd echomind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

   This creates a `dist/` folder with the compiled extension.

### Step 4: Load Extension in Chrome

1. Open Chrome Canary
2. Navigate to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the `dist` folder from the EchoMind project
6. EchoMind should now appear in your extensions!

## Verification

### Test the Extension

1. **Pin the extension**
   - Click the puzzle icon in Chrome toolbar
   - Pin EchoMind for easy access

2. **Visit any webpage** (e.g., Wikipedia, news article)

3. **Highlight some text** (at least 10 characters)

4. **Click a button** from the popup menu:
   - ✨ Summarize
   - 💡 Explain
   - 📝 Simplify
   - 💾 Save

5. **Check the extension popup** for results

### Troubleshooting

#### "Chrome AI not available"

**Solution:**
- Ensure you're using Chrome Canary (not stable Chrome)
- Verify all flags are enabled: `chrome://flags`
- Wait for model download to complete
- Restart Chrome completely

#### Model download stuck

**Solution:**
- Check internet connection
- Navigate to: `chrome://components/`
- Find "Optimization Guide On Device Model"
- Click "Check for update"
- Wait for download to complete

#### Extension not loading

**Solution:**
- Rebuild: `npm run build`
- Remove and re-add extension in `chrome://extensions/`
- Check console for errors (click "Errors" in extension card)

#### Selection menu not appearing

**Solution:**
- Refresh the webpage after installing extension
- Highlight more than 10 characters of text
- Check content script is injected (DevTools → Sources)

## Development Mode

### Run in Dev Mode

```bash
npm run dev
```

This starts Vite in watch mode. After making changes:
1. Save your files
2. Go to `chrome://extensions/`
3. Click the refresh icon on EchoMind card

### Build for Production

```bash
npm run build
```

## File Structure After Build

```
dist/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
├── content.css
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Next Steps

- Read the [README.md](README.md) for feature overview
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Report issues on GitHub

## Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/echomind/issues)
- Discussions: [Ask questions](https://github.com/yourusername/echomind/discussions)

---

**Happy Learning with EchoMind! 🧠✨**
