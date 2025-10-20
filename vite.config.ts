import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Copy static files that Chrome extension needs
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' },
        { src: 'src/content.css', dest: '.' },
        { src: 'src/popup/popup.css', dest: '.' },
        { src: 'src/popup/popup.html', dest: '.' },
        { src: 'src/popup/dashboard.html', dest: 'popup' },
        { src: 'src/popup/dashboard.js', dest: 'popup' },
        { src: 'src/vault.html', dest: '.' },
        // Copy payment pages for deployment
        { src: 'index.html', dest: '.' },  // Home page for Vercel
        { src: 'dashboard.html', dest: '.' },  // Dashboard page
        { src: 'success.html', dest: '.' },
        { src: 'cancel.html', dest: '.' },
        { src: 'pricing.html', dest: '.' },
      ]
    })
  ],
  publicDir: 'public', // Copies public/ folder (icons, etc.) to dist/
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        vault: resolve(__dirname, 'src/vault.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        'vault-styles': resolve(__dirname, 'src/vault.css'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // Put all JS files in root
          return '[name].js';
        },
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          // Put HTML files in root, CSS files in root
          if (assetInfo.name?.endsWith('.html')) {
            return '[name][extname]';
          }
          return '[name][extname]';
        }
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
