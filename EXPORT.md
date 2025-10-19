# 📦 EchoMind Production Export Pipeline

Complete guide for building and distributing EchoMind extension.

---

## 🚀 Quick Start

### Development Build (for testing)
```bash
npm run build
npm run forge:hot
```

### Production Build (for distribution)
```bash
npm run build:prod
npm run package
```

This creates `echomind-v[version].zip` ready for distribution.

---

## 📋 Export Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run clean` | Remove dist folder | Clean slate |
| `npm run build` | Standard build | dist/ folder |
| `npm run build:prod` | Production build + verification | dist/ with manifest |
| `npm run package` | Create distribution zip | echomind-v[X.Y.Z].zip |

---

## 🔄 Complete Export Workflow

### Step 1: Version Bump
Update `manifest.json`:
```json
{
  "version": "0.2.6"  // Increment version
}
```

### Step 2: Clean Build
```bash
npm run build:prod
```

This will:
1. 🧹 Clean the dist folder
2. 🔨 Compile TypeScript
3. 📦 Build with Vite
4. 📄 Copy manifest.json to dist
5. ✅ Verify all required files

### Step 3: Create Package
```bash
npm run package
```

Creates: `echomind-v[version].zip`

**Package includes:**
- `manifest.json`
- `popup.html`, `popup.js`, `popup.css`
- `background.js`
- `content.js`
- `icons/` (if present)

**Does NOT include:**
- `src/` (source code)
- `scripts/` (dev automation)
- `node_modules/`
- `.ts`, `.tsx` files
- Source maps (optional)

---

## ✅ Production Verification Checklist

Before distributing, verify:

### Required Files
- [ ] `manifest.json` exists in dist/
- [ ] `popup.html`, `popup.js`, `popup.css`
- [ ] `background.js`
- [ ] `content.js`
- [ ] Icons (16x16, 48x48, 128x128) - **TODO: Generate icons**

### No Dev Files
- [ ] No `.ts` or `.tsx` files
- [ ] No `node_modules/`
- [ ] No `scripts/` folder
- [ ] No source maps (unless desired)

### Functionality
- [ ] Load unpacked in chrome://extensions works
- [ ] Text selection shows EchoMind menu
- [ ] All AI features work (Summarize, Explain, Simplify, Proofread)
- [ ] Memory Vault saves/loads correctly
- [ ] No console errors

---

## 🧪 Local Testing

### Test the Production Build

1. **Open Chrome Canary**
   ```
   chrome://extensions
   ```

2. **Enable Developer Mode** (top right toggle)

3. **Load Unpacked**
   - Click "Load unpacked"
   - Select: `C:\Users\valen\Development\echomind\dist`

4. **Test All Features**
   - Visit any webpage
   - Select text
   - Verify all menu options work
   - Check Memory Vault
   - Test export functionality

### Test the Zip Package

1. **Extract the .zip to a temp folder**

2. **Load unpacked from extracted folder**

3. **Verify same functionality as dist/**

---

## 🌐 Chrome Web Store Submission

### Prerequisites
- [ ] Google Developer Account ($5 one-time fee)
- [ ] Extension icons (128x128 required)
- [ ] Screenshots for store listing
- [ ] Privacy policy (if collecting data)

### Submission Steps

1. **Go to Developer Dashboard**
   https://chrome.google.com/webstore/devconsole

2. **Create New Item**
   - Upload: `echomind-v[version].zip`

3. **Fill Store Listing**
   ```
   Name: EchoMind
   Tagline: Your private AI mentor for every webpage
   
   Description:
   EchoMind brings the power of Chrome's Built-in AI (Gemini Nano) 
   directly to your browser. Summarize, explain, simplify, and 
   proofread text on any webpage—completely offline and private.
   
   Features:
   • On-device AI processing (no cloud, no tracking)
   • Text summarization
   • ELI5 explanations
   • Text simplification
   • Grammar proofreading with Gemini Nano
   • Memory Vault for saving insights
   
   Category: Productivity / AI Tools
   Language: English
   ```

4. **Upload Assets**
   - Small icon: 128x128px PNG
   - Screenshots: 1280x800px or 640x400px
   - Promotional images (optional)

5. **Set Permissions**
   Justify each permission:
   - `storage`: Save user insights to Memory Vault
   - `activeTab`: Read selected text from current page
   - `scripting`: Inject content script for text selection
   - `<all_urls>`: Work on any webpage user visits

6. **Submit for Review**
   - Review time: 1-3 business days
   - Check email for approval/feedback

---

## 📊 Distribution Options

### Option 1: Chrome Web Store (Recommended)
- ✅ Automatic updates
- ✅ User trust/credibility
- ✅ Easy installation
- ❌ $5 developer fee
- ❌ Review process

### Option 2: Direct Distribution (.zip)
- ✅ Free
- ✅ Immediate availability
- ✅ Full control
- ❌ Manual updates
- ❌ Requires "Developer mode"

### Option 3: GitHub Releases
- ✅ Version control
- ✅ Open source community
- ✅ Free hosting
- ❌ Users need to sideload

---

## 🔧 Troubleshooting

### Build fails
```bash
# Clear everything and rebuild
npm run clean
npm run build:prod
```

### Package script fails
```bash
# Manual packaging:
# 1. Navigate to dist/ folder
# 2. Select all files
# 3. Right-click → Send to → Compressed (zipped) folder
# 4. Rename to echomind-v[version].zip
```

### Icons missing
```
⚠️ TODO: Generate extension icons
See: dist/icons/README.md
```

### Chrome rejects package
- Check manifest.json syntax
- Verify all permissions are justified
- Ensure no forbidden APIs are used
- Remove any external resource loads

---

## 📝 Version Management

Update version in `manifest.json` following semantic versioning:

- **Patch** (0.2.5 → 0.2.6): Bug fixes
- **Minor** (0.2.x → 0.3.0): New features
- **Major** (0.x.y → 1.0.0): Breaking changes

After version bump:
1. Update `CHANGELOG.wind`
2. Run `npm run build:prod`
3. Run `npm run package`
4. Test the package
5. Distribute or submit to store

---

## 🎯 Quick Reference

### One-Command Export
```bash
# Complete production export
npm run build:prod && npm run package
```

### Output Location
```
echomind/
├── dist/                        # Built extension (load unpacked)
└── echomind-v0.2.5.zip         # Distribution package
```

### Next Steps After Export
1. ✅ Test locally in Chrome
2. 📤 Upload to Chrome Web Store OR
3. 📦 Share .zip file directly

---

## 📞 Support

For issues with the export pipeline:
1. Check build logs for errors
2. Verify Node.js version (v16+ required)
3. Ensure all dependencies are installed: `npm install`
4. Review `scripts/` folder for script issues

---

**🔥 Your extension is now export-ready!**
