/**
 * 📦 Package Extension for Distribution
 * Creates a production-ready .zip file from dist/ folder
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootPath = path.resolve(__dirname, "..");
const distPath = path.resolve(rootPath, "dist");
const manifestPath = path.resolve(distPath, "manifest.json");

function log(msg, icon = "🔸") {
  console.log(`${icon} ${msg}`);
}

function error(msg) {
  console.error(`❌ ${msg}`);
}

try {
  // Check if dist exists
  if (!fs.existsSync(distPath)) {
    error("Dist folder not found! Run 'npm run build:prod' first.");
    process.exit(1);
  }

  // Check if manifest exists in dist
  if (!fs.existsSync(manifestPath)) {
    error("manifest.json not found in dist! Run 'npm run build:prod' first.");
    process.exit(1);
  }

  // Read version from manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const version = manifest.version || "0.0.0";
  const zipName = `echomind-v${version}.zip`;
  const zipPath = path.resolve(rootPath, zipName);

  log("Packaging EchoMind extension...", "📦");
  log(`Version: ${version}`, "🏷️");

  // Remove existing zip if present
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    log("Removed old package", "🗑️");
  }

  // Create zip using PowerShell on Windows
  log("Creating zip archive...", "🗜️");
  
  try {
    // Use PowerShell Compress-Archive
    const psCommand = `Compress-Archive -Path "${distPath}\\*" -DestinationPath "${zipPath}" -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: "inherit" });
    
    log("Package created successfully!", "✅");
    log(`File: ${zipName}`, "📦");
    
    // Get file size
    const stats = fs.statSync(zipPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    log(`Size: ${sizeMB} MB`, "📊");
    log(`Location: ${zipPath}`, "📂");

    console.log("");
    log("Next steps:", "🚀");
    console.log("  1. Test: Load unpacked from dist/ in chrome://extensions");
    console.log("  2. Distribute: Share the .zip file");
    console.log("  3. Publish: Upload to Chrome Web Store");

  } catch (err) {
    error("Failed to create zip archive");
    console.error(err.message);
    console.log("");
    log("Manual packaging:", "💡");
    console.log(`  1. Navigate to: ${distPath}`);
    console.log(`  2. Select all files and create a zip archive`);
    console.log(`  3. Name it: ${zipName}`);
    process.exit(1);
  }

} catch (err) {
  error("Packaging failed");
  console.error(err);
  process.exit(1);
}
