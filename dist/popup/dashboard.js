console.log("🧠 EchoMind dashboard v0.3.9 loaded");

const aiToggle = document.getElementById("aiToggle");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveBtn = document.getElementById("saveSettingsBtn");
const vaultBox = document.getElementById("vaultBox");
const clearVaultBtn = document.getElementById("clearVaultBtn");
const refreshVaultBtn = document.getElementById("refreshVaultBtn");
const settingsStatus = document.getElementById("settingsStatus");

async function loadVault() {
  const { vaultData } = await chrome.storage.local.get("vaultData");
  const entries = vaultData?.entries || [];
  
  if (entries.length === 0) {
    vaultBox.textContent = "Vault is empty. Start using EchoMind to save summaries!";
    return;
  }

  vaultBox.textContent = entries
    .map((v, i) => {
      const mode = v.mode ? v.mode.toUpperCase() : "SUMMARY";
      const lang = v.lang ? ` (${v.lang})` : "";
      const date = new Date(v.date).toLocaleString();
      return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#${i + 1} – ${mode}${lang}
Date: ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${v.summary}
`;
    })
    .join("\n");
}

async function loadSettings() {
  const { aiSettings } = await chrome.storage.local.get("aiSettings");
  if (aiSettings) {
    aiToggle.checked = aiSettings.enabled || false;
    apiKeyInput.value = aiSettings.key || "";
  }
}

async function loadData() {
  await loadSettings();
  await loadVault();
}

saveBtn.addEventListener("click", async () => {
  const settings = {
    enabled: aiToggle.checked,
    key: apiKeyInput.value.trim(),
  };
  await chrome.storage.local.set({ aiSettings: settings });
  
  settingsStatus.textContent = "✅ Settings saved successfully!";
  settingsStatus.className = "status success";
  settingsStatus.style.display = "block";
  
  setTimeout(() => {
    settingsStatus.style.display = "none";
  }, 3000);
});

refreshVaultBtn.addEventListener("click", async () => {
  vaultBox.textContent = "Loading...";
  await loadVault();
});

clearVaultBtn.addEventListener("click", async () => {
  if (!confirm("⚠️ Clear all Vault data? This cannot be undone!")) return;
  await chrome.storage.local.remove("vaultData");
  vaultBox.textContent = "Vault cleared.";
});

// Load data on page load
loadData();
