# ⚡ EchoMind Quick Start

Get EchoMind running in 5 minutes.

## Prerequisites

✅ **Chrome Canary** installed ([Download](https://www.google.com/chrome/canary/))  
✅ **Node.js 18+** installed ([Download](https://nodejs.org/))

## 1. Enable Chrome AI (2 minutes)

Open Chrome Canary and enable these flags:

```
chrome://flags/#optimization-guide-on-device-model
→ Set to "Enabled BypassPerfRequirement"

chrome://flags/#prompt-api-for-gemini-nano
→ Set to "Enabled"

chrome://flags/#summarization-api-for-gemini-nano
→ Set to "Enabled"

chrome://flags/#rewriter-api-for-gemini-nano
→ Set to "Enabled"
```

**Restart Chrome Canary**

## 2. Download AI Model (1 minute)

1. Open DevTools (F12) on any page
2. Paste in Console:
   ```javascript
   await window.ai.summarizer.create();
   ```
3. Wait for "Model ready" message

## 3. Install EchoMind (2 minutes)

```bash
# Navigate to your projects folder
cd Development

# Clone (or this is already done if you're reading this!)
git clone https://github.com/yourusername/echomind.git
cd echomind

# Install dependencies
npm install

# Build extension
npm run build
```

## 4. Load in Chrome

1. Open: `chrome://extensions/`
2. Enable **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select the `dist` folder
5. Done! 🎉

## 5. Try It Out

1. Visit any webpage (e.g., [Wikipedia](https://wikipedia.org))
2. Highlight some text
3. Click **"Summarize"** from the popup
4. View your result in the extension popup

## Troubleshooting

**"AI not available" error?**
- Ensure Chrome Canary is version 128+
- Check all flags are enabled
- Wait for model download (can take 5-10 minutes)

**Menu not appearing?**
- Refresh the webpage after installing extension
- Highlight at least 10 characters
- Check extension is enabled in `chrome://extensions/`

**Build errors?**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

- Read the full [README.md](README.md)
- Check out [SETUP.md](SETUP.md) for detailed configuration
- Join the discussion on GitHub

---

**You're all set! Start learning with EchoMind 🧠✨**
