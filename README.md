# 🧿 EchoMind Pro

**Chrome Extension + Stripe-powered AI writing engine by MetalMindTech**

EchoMind Pro is a premium Chrome extension that transforms any web page into an interactive AI-powered workspace. Featuring instant summarization, smart explanations, and a permanent Memory Vault — with seamless Stripe-powered Pro upgrades and instant activation.

![EchoMind Pro](https://via.placeholder.com/800x400/5eead4/0f172a?text=EchoMind+Pro+%7C+MetalMindTech)

## 🌟 Features

### **Free Tier**
- **✨ Instant Summarization** - Highlight any text and get AI-powered summaries
- **💡 Smart Explanations** - Ask for simple explanations and practical examples
- **📝 Text Rewriting** - Simplify complex content or change tone
- **💾 Memory Vault** - Save and search all your insights locally
- **🔒 100% Private** - All processing happens on-device using Chrome's built-in AI

### **Pro Tier** 🌟
- **⚡ Unlimited AI Requests** - No rate limits
- **🎯 Advanced Context Analysis** - Deeper insights
- **💎 Priority Support** - Get help faster
- **🔄 Export & Sync** - Save insights across devices
- **🎊 Instant Activation** - Pro unlocks immediately after payment
- **🧿 Holographic Forge Seal** - Exclusive MetalMindTech branding

## 🚀 Quick Start

### Prerequisites

- **Chrome Canary** or **Chrome Dev** (version 128+)
- Chrome AI features enabled (see setup guide below)

### Installation

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

4. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Enabling Chrome Built-in AI

EchoMind requires Chrome's experimental AI features:

1. **Update Chrome**
   - Use Chrome Canary or Chrome Dev (128+)
   - Download: [Chrome Canary](https://www.google.com/chrome/canary/)

2. **Enable AI Features**
   - Navigate to `chrome://flags/#optimization-guide-on-device-model`
   - Set to "Enabled BypassPerfRequirement"
   - Navigate to `chrome://flags/#prompt-api-for-gemini-nano`
   - Set to "Enabled"
   - Restart Chrome

3. **Verify Installation**
   - Open DevTools Console on any page
   - Type: `await window.ai.summarizer.capabilities()`
   - Should return: `{ available: "readily" }`

## 📖 How to Use

1. **Highlight text** on any webpage
2. **Choose an action** from the popup menu:
   - 🌟 **Summarize** - Get a concise summary
   - 💡 **Explain** - Understand complex concepts
   - ✏️ **Simplify** - Rewrite in simpler terms
   - 💾 **Save** - Add to your Memory Vault
3. **View results** instantly in the extension popup
4. **Access saved insights** from the Memory Vault

## 🛠️ Tech Stack

### **Frontend**
- **React 18** + TypeScript
- **TailwindCSS** + Custom Forge Theme
- **Vite** - Lightning-fast builds
- **Lucide React** - Beautiful icons

### **AI & Processing**
- **Chrome Built-in AI APIs**
  - Summarization API
  - Prompt API (Language Model)
  - Rewriter API
- **Hybrid Fallback** - Works with or without built-in AI

### **Backend & Payments**
- **Firebase Functions** - Serverless backend
- **Stripe** - Payment processing
  - Checkout Sessions
  - Webhooks
  - Subscription management
- **Firestore** - User subscription database

### **Deployment**
- **Vercel** - Success/cancel pages
- **Firebase Hosting** - Optional hosting
- **Chrome Web Store** - Extension distribution

### **Storage**
- **Chrome Storage API** - Local data
- **localStorage** - Pro status caching
- **Firestore** - Subscription sync

## 📁 Project Structure

```
echomind/
├── src/
│   ├── popup/              # Extension popup UI
│   │   ├── popup.html      # Popup HTML
│   │   ├── popup.js        # Popup logic + Pro features
│   │   └── popup.css       # Forge theme styling
│   ├── background.ts       # Service worker + context menus
│   ├── content.ts          # Content script + Shadow DOM
│   ├── vault.html          # Memory Vault (permanent tab)
│   ├── vault.js            # Vault logic (search/export)
│   └── vault.css           # Vault glassmorphism theme
├── functions/              # Firebase Cloud Functions
│   ├── index.js            # All backend functions
│   │   ├── createCheckoutSession
│   │   ├── stripeWebhook
│   │   ├── checkSubscription
│   │   └── verifySessionInstant
│   └── package.json
├── success.html            # Payment success page
├── cancel.html             # Payment cancel page
├── pricing.html            # Pricing page
├── manifest.json           # Extension manifest
├── vite.config.ts          # Build configuration
├── vercel.json             # Vercel deployment config
└── package.json
```

## 💎 Pro Features Architecture

### **Instant Unlock System**
1. User clicks "Upgrade Monthly" ($4.99) or "Upgrade Annual" ($49.99)
2. `createCheckoutSession` function creates Stripe checkout
3. User completes payment with test card: `4242 4242 4242 4242`
4. Stripe redirects to `success.html?session_id=cs_test_...`
5. `verifySessionInstant` function validates payment
6. Firestore updated: `status: "active"`
7. `localStorage.isProActive = "true"`
8. 🎊 Confetti launches on success page
9. 🧿 "Welcome to Forge Mode" appears
10. User reopens extension
11. ✨ PRO badge pulses
12. 🎊 Popup confetti celebration
13. 💎 "Welcome to Forge Mode" (one-time)
14. Full Pro features unlocked!

### **Subscription Management**
- **Auto-verification** - Checks subscription on every popup open
- **Toast notifications** - "✨ EchoMind Pro activated"
- **localStorage caching** - Fast Pro detection
- **Webhook sync** - Stripe events update Firestore
- **Instant activation** - No waiting for webhooks

## 🎨 Design Philosophy

EchoMind Pro follows the **Forge Aesthetic** — a holographic, premium interface that emphasizes:
- **Privacy-first** - No data leaves your device (AI processing)
- **Instant gratification** - Zero-delay Pro activation
- **Visual celebration** - Confetti + breathing seal animations
- **Premium branding** - MetalMindTech holographic insignia
- **Performance** - Instant responses with local AI
- **Seamless payments** - One-click Stripe checkout

## 🧿 MetalMindTech Forge Branding

### **Holographic Seal**
- **Shimmer animation** - 8-second hue rotation (emerald → violet → blue)
- **Breathing pulse** - 6-second gentle scale animation
- **Hover effect** - Scales to 1.08x with violet glow
- **Living presence** - Feels like a breathing AI entity

### **"Welcome to Forge Mode"**
- **Success page** - Fades in after confetti, pulses forever
- **Popup (one-time)** - Appears on first Pro activation
- **Gradient text** - Emerald → Violet → Blue
- **Text glow** - Pulsing emerald/violet shadow

### **Color Palette**
- **Emerald** (#5EEAD4) - Growth, prosperity, AI
- **Violet** (#7C3AED) - Creativity, innovation, premium
- **Blue** (#3B82F6) - Trust, technology, intelligence
- **Dark** (#0F172A) - Professional, focused background

## 🔮 Roadmap

- [x] Stripe payment integration
- [x] Instant Pro unlock system
- [x] Confetti celebrations
- [x] Holographic Forge seal
- [x] Auto subscription verification
- [ ] Voice mode (text-to-speech for insights)
- [ ] Translation support
- [ ] Export insights to Markdown
- [ ] Keyboard shortcuts
- [ ] Dark/light theme toggle
- [ ] Browser sync (encrypted)
- [ ] PDF support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- Built for the [Chrome Built-in AI Challenge](https://googlechromeai.devpost.com/)
- Powered by Chrome's experimental AI APIs
- Inspired by the vision of local-first, privacy-preserving AI
- Stripe integration for seamless payments
- Firebase for serverless backend

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/techshare101/echomind-pro-launch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/techshare101/echomind-pro-launch/discussions)
- **Email**: support@metalmindtech.com

## 🚀 Deployment

### **Extension**
```bash
npm run build
# Load dist folder in chrome://extensions
```

### **Backend (Firebase)**
```bash
cd functions
npm install
firebase deploy --only functions
```

### **Frontend (Vercel)**
```bash
vercel --prod
```

## 💰 Revenue Model

- **Free Tier**: Basic AI features
- **Pro Monthly**: $4.99/month
- **Pro Annual**: $49.99/year (save 17%)

**Test Card**: `4242 4242 4242 4242` (any future date, any CVC)

---

<div align="center">

## 🧿 **EchoMind Pro**

**Learn privately. Think locally. Upgrade instantly.** 🧠✨

### © 2025 **MetalMindTech**

**Built by Kesarel × Kojo**

*Forged with 🔥 in the AI revolution*

---

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-violet.svg)](https://stripe.com)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-blue.svg)](https://firebase.google.com)

</div>
