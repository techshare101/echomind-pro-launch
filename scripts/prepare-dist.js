/**
 * 📦 Prepare Dist for Production
 * Copies manifest.json and verifies all required files are present
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootPath = path.resolve(__dirname, "..");
const distPath = path.resolve(rootPath, "dist");
const manifestSource = path.resolve(rootPath, "manifest.json");
const manifestDest = path.resolve(distPath, "manifest.json");

function log(msg, icon = "🔸") {
  console.log(`${icon} ${msg}`);
}

function error(msg) {
  console.error(`❌ ${msg}`);
}

try {
  log("Preparing dist folder for production...", "📦");

  // Check if dist exists
  if (!fs.existsSync(distPath)) {
    error("Dist folder not found! Run 'npm run build' first.");
    process.exit(1);
  }

  // Manifest is now copied by Vite during build
  log("Vite has copied manifest.json and static files", "ℹ️");

  // Verify required files
  const requiredFiles = [
    "manifest.json",
    "popup.html",
    "popup.js",
    "popup.css",
    "background.js",
    "content.js",
    "content.css"
  ];

  log("Verifying production files...", "🔍");
  let allPresent = true;

  for (const file of requiredFiles) {
    const filePath = path.resolve(distPath, file);
    if (fs.existsSync(filePath)) {
      log(`  ✓ ${file}`, "");
    } else {
      error(`  ✗ Missing: ${file}`);
      allPresent = false;
    }
  }

  if (!allPresent) {
    error("Some required files are missing!");
    process.exit(1);
  }

  // Check for dev-only files (should not be in dist)
  const devFiles = ["node_modules", "scripts", ".ts", ".tsx"];
  const distContents = fs.readdirSync(distPath);
  const foundDevFiles = distContents.filter(item => 
    devFiles.some(devFile => item.includes(devFile))
  );

  if (foundDevFiles.length > 0) {
    error("Found dev-only files in dist:");
    foundDevFiles.forEach(file => console.error(`  - ${file}`));
    error("Dist folder should only contain production files!");
    process.exit(1);
  }

  log("Dist folder is production-ready!", "✅");
  log(`Location: ${distPath}`, "📂");

} catch (err) {
  error("Failed to prepare dist folder");
  console.error(err);
  process.exit(1);
}
