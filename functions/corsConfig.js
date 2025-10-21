// functions/corsConfig.js
const cors = require('cors');

module.exports = cors({
  origin: [
    'https://echomind-pro-launch.vercel.app', // ✅ Production Vercel domain
    'http://localhost:5173',                  // ✅ Local dev (Vite)
    'http://localhost:5000',                  // ✅ Firebase emulator
    'chrome-extension://*',                   // ✅ Chrome extension support
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  credentials: true,
});
