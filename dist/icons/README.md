# EchoMind Icons

## Required Icons

Place the following icon files in this directory:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Design Guidelines

**Style:**
- Cosmic theme (purples, blues, gradients)
- Brain or echo wave symbol
- Clean, modern, minimalist
- Works well at small sizes

**Colors:**
- Primary: #6366f1 (cosmic-500)
- Secondary: #4338ca (cosmic-700)
- Accent: #a5b4fc (cosmic-300)

## Temporary Placeholder

Until custom icons are created, you can generate placeholder icons using online tools:
- https://www.favicon-generator.org/
- https://favicon.io/favicon-generator/

Or use this SVG as a base:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4338ca;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <path d="M64 30 C 50 30, 40 40, 40 54 C 40 60, 42 65, 45 69 C 38 73, 32 80, 32 90 C 32 102, 42 110, 54 110 L 74 110 C 86 110, 96 102, 96 90 C 96 80, 90 73, 83 69 C 86 65, 88 60, 88 54 C 88 40, 78 30, 64 30 Z" fill="white"/>
  <circle cx="56" cy="50" r="4" fill="#4338ca"/>
  <circle cx="72" cy="50" r="4" fill="#4338ca"/>
  <path d="M 52 65 Q 64 72, 76 65" stroke="#4338ca" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>
```

Export this as PNG at 128x128, 48x48, and 16x16.
