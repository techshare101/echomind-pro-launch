# Icon Generation Guide

## Quick Icon Creation

Since we need 3 icon sizes (16x16, 48x48, 128x128), here are quick ways to create them:

### Option 1: Use Figma (Recommended)

1. Create a 128x128 artboard
2. Design the icon with the cosmic gradient:
   - Colors: #6366f1 to #4338ca
   - Add a brain or echo wave symbol
3. Export as PNG at:
   - 128x128 (icon128.png)
   - 48x48 (icon48.png)
   - 16x16 (icon16.png)

### Option 2: Use Online Tools

**Favicon Generator:**
- Visit: https://favicon.io/favicon-generator/
- Choose:
  - Text: "E" or "EM"
  - Background: Rounded, #6366f1
  - Font: Bold
- Download and rename to icon16.png, icon48.png, icon128.png

### Option 3: Use ImageMagick (CLI)

If you have a high-res icon (e.g., icon.png):

```bash
# Install ImageMagick first
# Then run:
magick icon.png -resize 128x128 public/icons/icon128.png
magick icon.png -resize 48x48 public/icons/icon48.png
magick icon.png -resize 16x16 public/icons/icon16.png
```

### Option 4: Simple SVG Template

Create `icon.svg`:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="20" fill="url(#gradient)"/>
  <text x="64" y="90" font-family="Arial" font-size="72" font-weight="bold" 
        fill="white" text-anchor="middle">E</text>
</svg>
```

Convert to PNG using any SVG-to-PNG converter.

## Placement

Save all icons to: `public/icons/`

```
public/icons/
├── icon16.png
├── icon48.png
└── icon128.png
```

Then rebuild the extension:

```bash
npm run build
```
