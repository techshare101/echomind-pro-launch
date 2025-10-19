/**
 * ✅ Build Validator
 * Automatically validates that all required Chrome extension files are present
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

function error(msg) {
  console.error(`❌ ${msg}`);
}

function warn(msg) {
  console.warn(`⚠️  ${msg}`);
}

// Required files for Chrome extension
const requiredFiles = {
  critical: [
    { path: "manifest.json", desc: "Extension manifest" },
    { path: "popup.html", desc: "Popup UI" },
    { path: "popup.js", desc: "Popup logic" },
    { path: "popup.css", desc: "Popup styles" },
    { path: "background.js", desc: "Service worker" },
    { path: "content.js", desc: "Content script" },
    { path: "content.css", desc: "Content styles" },
  ],
  optional: [
    { path: "icons/icon16.png", desc: "16x16 toolbar icon" },
    { path: "icons/icon48.png", desc: "48x48 management icon" },
    { path: "icons/icon128.png", desc: "128x128 store icon" },
  ]
};

// Files that should NOT be in dist
const forbiddenPatterns = [
  ".ts",
  ".tsx",
  ".map",
  "node_modules",
  ".git",
  "scripts"
];

// Allowed src files (vault pages)
const allowedSrcFiles = ["vault.html", "vault.js", "vault.css"];

console.log("🔍 Validating EchoMind build...\n");

// Check if dist exists
if (!fs.existsSync(distPath)) {
  error("Dist folder not found! Run 'npm run build:prod' first.");
  process.exit(1);
}

let hasErrors = false;
let hasWarnings = false;

// Check critical files
log("Checking critical files...", "📋");
for (const file of requiredFiles.critical) {
  const filePath = path.resolve(distPath, file.path);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    log(`  ✓ ${file.path} (${sizeKB} KB) - ${file.desc}`, "");
  } else {
    error(`  ✗ Missing: ${file.path} - ${file.desc}`);
    hasErrors = true;
  }
}

// Check optional files
console.log("");
log("Checking optional files...", "🎨");
for (const file of requiredFiles.optional) {
  const filePath = path.resolve(distPath, file.path);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    log(`  ✓ ${file.path} (${sizeKB} KB) - ${file.desc}`, "");
  } else {
    warn(`  ⚠ Missing: ${file.path} - ${file.desc}`);
    hasWarnings = true;
  }
}

// Check for forbidden files
console.log("");
log("Checking for dev-only files...", "🔒");
const distContents = fs.readdirSync(distPath, { recursive: true });
const foundForbidden = [];

for (const item of distContents) {
  const itemStr = String(item);
  
  // Skip src folder itself, only check files inside
  if (itemStr === "src" || itemStr === "src\\") {
    continue;
  }
  
  // Allow vault files in src folder
  if (itemStr.startsWith("src")) {
    const isAllowed = allowedSrcFiles.some(f => itemStr.includes(f));
    if (!isAllowed) {
      foundForbidden.push(itemStr);
    }
    continue;
  }
  
  for (const pattern of forbiddenPatterns) {
    if (itemStr.includes(pattern) && !itemStr.includes("icons")) {
      foundForbidden.push(itemStr);
      break;
    }
  }
}

if (foundForbidden.length > 0) {
  error("Found dev-only files in dist:");
  foundForbidden.forEach(file => error(`  - ${file}`));
  hasErrors = true;
} else {
  log("  ✓ No dev-only files detected", "");
}

// Validate manifest.json
console.log("");
log("Validating manifest.json...", "📄");
try {
  const manifestPath = path.resolve(distPath, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  
  if (manifest.manifest_version === 3) {
    log(`  ✓ Manifest version: ${manifest.manifest_version}`, "");
  } else {
    error(`  ✗ Invalid manifest version: ${manifest.manifest_version}`);
    hasErrors = true;
  }
  
  log(`  ✓ Extension name: ${manifest.name}`, "");
  log(`  ✓ Version: ${manifest.version}`, "");
  
  // Check permissions
  if (manifest.permissions && manifest.permissions.length > 0) {
    log(`  ✓ Permissions: ${manifest.permissions.join(", ")}`, "");
  }
  
  // Verify referenced files exist
  const referencedFiles = [
    manifest.action?.default_popup,
    manifest.background?.service_worker,
    ...(manifest.content_scripts?.[0]?.js || []),
    ...(manifest.content_scripts?.[0]?.css || [])
  ].filter(Boolean);
  
  for (const file of referencedFiles) {
    const filePath = path.resolve(distPath, file);
    if (!fs.existsSync(filePath)) {
      error(`  ✗ Manifest references missing file: ${file}`);
      hasErrors = true;
    }
  }
  
} catch (err) {
  error("Failed to validate manifest.json");
  console.error(err.message);
  hasErrors = true;
}

// Calculate total size
console.log("");
log("Calculating package size...", "📊");
let totalSize = 0;
function calculateSize(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      calculateSize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
}
calculateSize(distPath);
const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
log(`  Total size: ${sizeMB} MB`, "");

// Final result
console.log("");
if (hasErrors) {
  error("Build validation FAILED! ❌");
  error("Fix the errors above and rebuild.");
  process.exit(1);
} else if (hasWarnings) {
  warn("Build validation passed with warnings ⚠️");
  warn("Consider addressing the warnings above.");
  log("\n✅ Extension can be loaded, but may have missing features", "");
} else {
  log("Build validation PASSED! ✅", "🎉");
  log("Extension is ready for distribution", "");
}

console.log("");
log("Next steps:", "🚀");
console.log("  1. Test: Load unpacked in chrome://extensions");
console.log("  2. Package: npm run package");
console.log("  3. Distribute or publish to Chrome Web Store");
