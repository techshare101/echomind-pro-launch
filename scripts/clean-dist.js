/**
 * 🧹 Clean Dist Folder
 * Removes all files from dist/ before a fresh build
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = path.resolve(__dirname, "..", "dist");

function log(msg, icon = "🔸") {
  console.log(`${icon} ${msg}`);
}

try {
  if (fs.existsSync(distPath)) {
    log("Cleaning dist folder...", "🧹");
    fs.rmSync(distPath, { recursive: true, force: true });
    log("Dist folder cleaned!", "✅");
  } else {
    log("Dist folder doesn't exist, skipping clean", "ℹ️");
  }
} catch (error) {
  console.error("❌ Failed to clean dist folder:", error);
  process.exit(1);
}
