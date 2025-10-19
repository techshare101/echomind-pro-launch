# 🧠 EchoMind

**Your private AI mentor for every webpage**

EchoMind is a Chrome extension that transforms any web page into an interactive learning experience using Chrome's built-in AI APIs. Summarize, explain, and save insights — all offline and completely private.

![EchoMind Banner](https://via.placeholder.com/800x400/667eea/ffffff?text=EchoMind)

## 🌟 Features

- **✨ Instant Summarization** - Highlight any text and get AI-powered summaries
- **💡 Smart Explanations** - Ask for simple explanations and practical examples
- **📝 Text Rewriting** - Simplify complex content or change tone
- **💾 Memory Vault** - Save and search all your insights locally
- **🔒 100% Private** - All processing happens on-device using Chrome's built-in AI
- **🌐 Works Offline** - No internet required after initial setup

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

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + Custom Cosmic Theme
- **Build**: Vite
- **AI**: Chrome Built-in AI APIs
  - Summarization API
  - Prompt API (Language Model)
  - Rewriter API
- **Storage**: Chrome Storage API
- **Icons**: Lucide React

## 📁 Project Structure

```
echomind/
├── src/
│   ├── popup/              # React popup UI
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── components/         # Reusable components
│   │   ├── InsightCard.tsx
│   │   └── ActionPanel.tsx
│   ├── utils/              # AI utilities
│   │   ├── aiSummarizer.ts
│   │   ├── aiPrompt.ts
│   │   ├── aiRewriter.ts
│   │   └── storage.ts
│   ├── types/              # TypeScript definitions
│   ├── background.ts       # Service worker
│   ├── content.ts          # Content script
│   └── styles/             # Global styles
├── manifest.json           # Extension manifest
├── vite.config.ts          # Build configuration
└── package.json
```

## 🎨 Design Philosophy

EchoMind follows the **Ark Aesthetic** — a cosmic, elegant interface that emphasizes:
- **Privacy-first** - No data leaves your device
- **Clarity** - Clean, intuitive interactions
- **Performance** - Instant responses with local AI
- **Accessibility** - Works entirely offline

## 🔮 Roadmap

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

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/echomind/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/echomind/discussions)

---

**EchoMind** — Learn privately. Think locally. 🧠✨

Made with 🔥 by [Your Name]
