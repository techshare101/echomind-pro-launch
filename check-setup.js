/**
 * EchoMind Setup Checker
 * Run: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧠 EchoMind Setup Checker\n');

let allGood = true;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
console.log(`✓ Node.js version: ${nodeVersion}`);
if (majorVersion < 18) {
  console.log('  ⚠️  Warning: Node 18+ recommended');
  allGood = false;
}

// Check required files
const requiredFiles = [
  'package.json',
  'manifest.json',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'popup.html',
  'src/background.ts',
  'src/content.ts',
  'src/popup/App.tsx',
];

console.log('\n📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allGood = false;
});

// Check for icons
console.log('\n🎨 Checking icons:');
const iconSizes = [16, 48, 128];
const iconsExist = iconSizes.map(size => {
  const iconPath = path.join(__dirname, 'public', 'icons', `icon${size}.png`);
  const exists = fs.existsSync(iconPath);
  console.log(`  ${exists ? '✓' : '✗'} icon${size}.png`);
  return exists;
});

if (!iconsExist.some(Boolean)) {
  console.log('  ⚠️  No icons found. See scripts/build-icons.md for generation guide.');
  console.log('  ⚠️  Extension will work but won\'t have proper icons.');
}

// Check node_modules
console.log('\n📦 Checking dependencies:');
const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`  ${nodeModulesExists ? '✓' : '✗'} node_modules`);
if (!nodeModulesExists) {
  console.log('  ℹ️  Run: npm install');
  allGood = false;
}

// Check dist folder
console.log('\n🏗️  Checking build:');
const distExists = fs.existsSync(path.join(__dirname, 'dist'));
console.log(`  ${distExists ? '✓' : '✗'} dist folder`);
if (!distExists) {
  console.log('  ℹ️  Run: npm run build');
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood && nodeModulesExists) {
  if (distExists) {
    console.log('✅ All checks passed! Ready to load in Chrome.');
    console.log('\nNext steps:');
    console.log('1. Open Chrome Canary');
    console.log('2. Go to chrome://extensions/');
    console.log('3. Enable Developer Mode');
    console.log('4. Click "Load unpacked"');
    console.log('5. Select the "dist" folder');
  } else {
    console.log('⚡ Almost ready! Run: npm run build');
  }
} else {
  console.log('⚠️  Setup incomplete. See messages above.');
  if (!nodeModulesExists) {
    console.log('\n👉 Next step: npm install');
  }
}
console.log('='.repeat(50) + '\n');

console.log('📚 For detailed setup: see QUICKSTART.md or SETUP.md\n');
