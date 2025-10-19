/**
 * 🧠 Forge Phase III – Smart Reload
 * Detects if Chrome Canary is running and intelligently reloads the extension.
 */
import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const extensionPath = path.resolve(__dirname, "..", "dist");
const platform = os.platform();

function log(msg, icon = "🔸") {
  console.log(`${icon} ${msg}`);
}

function error(msg) {
  console.error(`❌ ${msg}`);
}

function run(cmd, options = {}) {
  return spawnSync(cmd, { shell: true, stdio: "inherit", ...options });
}

// ========== BUILD PHASE ==========
log("Building EchoMind...", "⚙️");
try {
  execSync("npm run build", { stdio: "inherit" });
  log("Build complete!", "✅");
} catch (err) {
  error("Build failed. Aborting reload.");
  process.exit(1);
}

// ========== CHROME DETECTION ==========
log("Checking for Chrome Canary process...", "🔍");
let chromeRunning = false;
let chromePath = null;

if (platform === "win32") {
  // Windows: Check tasklist for chrome.exe
  try {
    const res = spawnSync("tasklist", { encoding: "utf-8" });
    const output = res.stdout?.toString() || "";
    chromeRunning = output.toLowerCase().includes("chrome.exe");
    
    if (chromeRunning) {
      log("Chrome Canary detected running", "✓");
    }
  } catch (err) {
    log("Could not detect Chrome process", "⚠️");
  }

  // Set Chrome paths for Windows
  const possiblePaths = [
    path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome SxS", "Application", "chrome.exe"),
    "C:\\Program Files\\Google\\Chrome SxS\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome SxS\\Application\\chrome.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      chromePath = p;
      break;
    }
  }

} else if (platform === "darwin") {
  // macOS: Check for Chrome process
  try {
    const res = spawnSync("pgrep", ["-i", "chrome"], { encoding: "utf-8" });
    chromeRunning = res.status === 0;
    if (chromeRunning) {
      log("Chrome Canary detected running", "✓");
    }
  } catch (err) {
    log("Could not detect Chrome process", "⚠️");
  }

  chromePath = "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary";

} else {
  // Linux: Check for Chrome process
  try {
    const res = spawnSync("pgrep", ["-i", "chrome"], { encoding: "utf-8" });
    chromeRunning = res.status === 0;
    if (chromeRunning) {
      log("Chrome Canary detected running", "✓");
    }
  } catch (err) {
    log("Could not detect Chrome process", "⚠️");
  }

  chromePath = "google-chrome";
}

// ========== RELOAD LOGIC ==========
if (chromeRunning) {
  log("Chrome Canary is already running", "♻️");
  log("Extension built and ready at: " + extensionPath, "📂");
  console.log("");
  log("To reload the extension:", "👉");
  console.log("   1. Open chrome://extensions in Chrome Canary");
  console.log("   2. Click the reload (⟳) button on EchoMind");
  console.log("");
  log("Or close Chrome and run 'npm run forge:hot' again for auto-launch", "💡");

  // Attempt to bring Chrome window to foreground (Windows only)
  if (platform === "win32") {
    try {
      // Try to activate Chrome window using PowerShell
      const psScript = `
        $wshell = New-Object -ComObject wscript.shell;
        $wshell.AppActivate('Chrome')
      `;
      spawnSync("powershell", ["-Command", psScript], { stdio: "ignore" });
      log("Chrome window brought to foreground", "🎯");
    } catch (err) {
      // Silently fail - not critical
    }
  }

} else {
  log("Chrome Canary not running → launching with extension", "🚀");
  
  if (!chromePath || !fs.existsSync(chromePath)) {
    error("Chrome Canary not found at expected location");
    log("Extension ready at: " + extensionPath, "📂");
    log("Please launch Chrome Canary manually and load the extension", "👉");
    process.exit(1);
  }

  try {
    let command;
    if (platform === "win32") {
      command = `"${chromePath}" --load-extension="${extensionPath}" --auto-open-devtools-for-tabs`;
    } else if (platform === "darwin") {
      command = `"${chromePath}" --load-extension="${extensionPath}" --auto-open-devtools-for-tabs`;
    } else {
      command = `${chromePath} --load-extension="${extensionPath}" --auto-open-devtools-for-tabs`;
    }

    // Launch Chrome in background (don't wait)
    if (platform === "win32") {
      spawnSync("cmd", ["/c", "start", "", command], { stdio: "ignore", detached: true });
    } else {
      spawnSync("sh", ["-c", `${command} &`], { stdio: "ignore", detached: true });
    }

    log("Chrome Canary launched successfully!", "✅");
    log("Extension loaded from: " + extensionPath, "📂");
  } catch (err) {
    error("Failed to launch Chrome Canary");
    console.error(err);
    process.exit(1);
  }
}

console.log("");
log("Forge Smart Reload complete", "🔥");
