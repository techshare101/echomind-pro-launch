# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core Architecture

EchoMind is a premium Chrome extension that provides AI-powered text processing using Chrome's built-in AI APIs. The architecture consists of:

### Frontend (Chrome Extension)
- **React 18 + TypeScript** with Vite build system
- **Manifest V3** Chrome extension structure
- **TailwindCSS** with custom "Forge" theme (cosmic color palette)
- **Shadow DOM** content script for isolated UI injection
- **Chrome Built-in AI APIs** (Summarization, Prompt, Rewriter) for local processing

### Backend (Firebase + Stripe)
- **Firebase Functions** serverless backend for subscription management
- **Firestore** for user subscription status storage
- **Stripe** payment processing with instant Pro unlock system
- **Vercel** hosting for success/cancel payment pages

### Key Components Architecture
- **Background Service Worker** (`src/background.ts`): Context menus, window management, keep-alive
- **Content Script** (`src/content.ts`): Shadow DOM menu injection with "AnchorLock" selection system
- **Popup App** (`src/popup/App.tsx`): Main React UI with Home/Vault views
- **Storage System** (`src/utils/storage.ts`): Chrome Storage API wrapper for insights
- **AI Utilities** (`src/utils/`): Modular AI processing functions with fallback handling

## Development Commands

### Extension Development
```bash
# Install dependencies
npm install

# Build extension for Chrome
npm run build

# Development mode (watch files)
npm run dev

# Clean build artifacts
npm run clean

# Production build with validation
npm run build:prod

# Package for distribution
npm package

# Smart extension reload (development)
npm run forge:reload
npm run forge:hot
```

### Firebase Backend
```bash
# Deploy functions only
cd functions
firebase deploy --only functions

# Start local emulator
npm run start  # (in functions/)

# Environment setup
# Copy .env.example to .env.local and configure:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - STRIPE_PRICE_ID_MONTHLY
# - STRIPE_PRICE_ID_ANNUAL
```

### Testing Setup
Chrome Canary (v128+) required with these flags:
```
chrome://flags/#optimization-guide-on-device-model → Enabled BypassPerfRequirement
chrome://flags/#prompt-api-for-gemini-nano → Enabled
chrome://flags/#summarization-api-for-gemini-nano → Enabled
chrome://flags/#rewriter-api-for-gemini-nano → Enabled
```

Load extension: `chrome://extensions/` → Load unpacked → Select `dist/` folder

## Critical Implementation Details

### AI Integration Pattern
All AI utilities follow this pattern:
1. **Check availability**: `window.ai?.summarizer?.capabilities()`
2. **Progressive enhancement**: Graceful fallback when AI unavailable
3. **Session management**: Create/destroy AI sessions properly
4. **Error boundaries**: Handle "AI not available" states

### Pro Subscription Flow
**Instant Unlock System**:
1. User clicks upgrade → `createCheckoutSession` Firebase function
2. Stripe checkout → Payment completion
3. Redirect to `success.html?session_id=...`
4. `verifySessionInstant` function validates payment instantly
5. Firestore updated + localStorage cache set
6. Extension popup shows Pro features immediately

### Content Script Shadow DOM
The content script uses Shadow DOM isolation with:
- **AnchorLock system**: Preserves selected text even after selection clears
- **Cosmic gradient menu**: Positioned overlay with backdrop blur
- **Event prevention**: Prevents page interference with AI processing

### Storage Architecture
- **Chrome Storage Local**: Primary storage for insights and user data
- **localStorage**: Pro status caching for performance
- **Firestore**: Server-side subscription verification
- **Background Script**: Central message hub between components

## Build Process Specifics

### Vite Configuration
- **Multi-entry build**: Separate bundles for popup, content, background, vault
- **Static file copying**: HTML templates, CSS, manifest copying
- **Asset bundling**: Icons and resources in `public/` folder
- **TypeScript**: Strict mode with Chrome types

### File Structure Mapping
```
src/ → dist/ (build output)
├── popup/ → popup.html + popup.js (React app)
├── background.ts → background.js (Service Worker)
├── content.ts → content.js (Shadow DOM injection)
├── vault.html → vault.html (Memory vault page)
└── utils/ → (bundled into consuming files)
```

## Pro Features Implementation

### UI State Management
- **Pro badge pulsing**: CSS animations with emerald/violet gradients
- **Confetti celebrations**: Triggered on payment success and first Pro activation
- **Holographic seal**: 8-second hue rotation with breathing animation
- **Toast notifications**: Non-blocking success/error messages

### Subscription Verification
- **Auto-check**: Every popup open verifies subscription status
- **Webhook sync**: Stripe events update Firestore in real-time
- **Instant activation**: No waiting for webhooks, immediate Pro unlock
- **Fallback caching**: localStorage prevents repeated API calls

## Development Notes

### Chrome Extension Limitations
- **Manifest V3**: Service workers only (no persistent background pages)
- **CSP restrictions**: No inline scripts, specific security policies required
- **Storage quotas**: Chrome Storage API limits (use efficiently)
- **AI availability**: Built-in AI is experimental, require fallbacks

### Firebase Functions Environment
- **2nd Gen Functions**: Uses `defineSecret()` for environment variables
- **CORS handling**: Required for extension API calls
- **Stripe API version**: Pinned to `2024-12-18.acacia`
- **Firestore rules**: Ensure proper read/write permissions

### Testing Strategy
- **Manual testing**: Use `test/test-page.html` for consistent testing
- **Payment testing**: Use Stripe test card `4242 4242 4242 4242`
- **AI testing**: Check model download in DevTools console
- **Extension reload**: Use reload button in `chrome://extensions/`

## Common Issues & Solutions

### "Chrome AI not available"
- Verify Chrome Canary version 128+
- Check all 4 AI flags are enabled
- Wait for model download (5-10 minutes first time)
- Restart Chrome completely after flag changes

### Build failures
- Clear `node_modules` and reinstall
- Ensure TypeScript types are properly configured
- Check Vite config for proper entry points
- Validate manifest.json syntax

### Pro unlock not working
- Verify Firebase secrets are properly set
- Check Stripe webhook endpoint configuration
- Ensure CORS headers in Firebase functions
- Test with browser network tab for API errors

### Extension not loading
- Check `dist/` folder contains all required files
- Verify manifest.json is valid
- Look for console errors in extension service worker
- Ensure proper file permissions

## Environment Variables

### Firebase Functions (.env)
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
SUCCESS_URL=https://echomind-ai.vercel.app/success.html
CANCEL_URL=https://echomind-ai.vercel.app/cancel.html
```

### Extension Configuration
No environment variables needed for extension itself - all configuration happens through Firebase and Chrome APIs.