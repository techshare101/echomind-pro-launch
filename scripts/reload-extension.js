/**
 * 🔁 EchoMind Forge Reload Script
 * Builds and relaunches the extension automatically in Chrome Canary.
 */
import { execSync } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 EchoMind build complete!");
console.log("🔁 Reloading extension in Chrome Canary...\n");

// ---- Get extension path ----
const extensionPath = path.resolve(__dirname, "..", "dist");
const platform = os.platform();

try {
  if (platform === "darwin") {
    // macOS Canary path
    const command = `/Applications/Google\\ Chrome\\ Canary.app/Contents/MacOS/Google\\ Chrome\\ Canary --load-extension="${extensionPath}"`;
    execSync(command, { stdio: "inherit" });
  } else if (platform === "win32") {
    // Windows - Try multiple possible Chrome Canary locations
    const possiblePaths = [
      "C:\\Users\\%USERNAME%\\AppData\\Local\\Google\\Chrome SxS\\Application\\chrome.exe",
      "C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome SxS\\Application\\chrome.exe",
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Fallback to stable
    ];

    let launched = false;
    for (const chromePath of possiblePaths) {
      try {
        // Expand %USERNAME% if present
        const expandedPath = chromePath.replace('%USERNAME%', process.env.USERNAME || '');
        const command = `"${expandedPath}" --load-extension="${extensionPath}"`;
        execSync(command, { stdio: "ignore" });
        launched = true;
        console.log(`✅ Chrome launched from: ${expandedPath}`);
        break;
      } catch (err) {
        // Try next path
        continue;
      }
    }

    if (!launched) {
      throw new Error("Chrome Canary not found in common locations");
    }
  } else {
    // Linux Canary (or standard Chrome)
    execSync(`google-chrome --load-extension="${extensionPath}"`, {
      stdio: "inherit",
    });
  }

  console.log("\n✅ EchoMind reloaded successfully in Chrome Canary!");
  console.log("📂 Extension loaded from:", extensionPath);
  console.log("\n💡 Tip: Visit chrome://extensions to manage your extension");
} catch (err) {
  console.error("\n❌ Could not reload Chrome Canary automatically.");
  console.error("📝 Manual steps:");
  console.error("   1. Open chrome://extensions in Chrome Canary");
  console.error("   2. Enable 'Developer mode' (top right)");
  console.error("   3. Click 'Reload' on EchoMind extension");
  console.error("\n📂 Extension built at:", extensionPath);
}
