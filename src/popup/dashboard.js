console.log("🧠 EchoMind dashboard v2.0.1 loaded");

const vaultBox = document.getElementById("vaultBox");
const clearVaultBtn = document.getElementById("clearVaultBtn");
const refreshVaultBtn = document.getElementById("refreshVaultBtn");

// BYOK Banner elements
const byokBanner = document.getElementById("byok-banner");
const bannerIcon = document.getElementById("banner-icon");
const bannerTitle = document.getElementById("banner-title");
const bannerSubtitle = document.getElementById("banner-subtitle");
const goSettingsBtn = document.getElementById("go-settings");

// Detect AI provider from key prefix
function detectProvider(apiKey) {
  if (!apiKey) return null;
  if (apiKey.startsWith('sk-or-')) return 'OpenRouter';
  if (apiKey.startsWith('sk-ant-')) return 'Anthropic (Claude)';
  if (apiKey.startsWith('mistral-')) return 'Mistral AI';
  if (apiKey.startsWith('AIza')) return 'Google Gemini';
  if (apiKey.startsWith('sk-')) return 'OpenAI';
  return 'Unknown';
}

// Update BYOK banner based on current settings
async function updateBYOKBanner() {
  const { openaiKey, enableCloud, providerDisplay } = await chrome.storage.local.get(['openaiKey', 'enableCloud', 'providerDisplay']);
  
  if (openaiKey && openaiKey.trim()) {
    // Use saved provider display name or detect from key
    const provider = providerDisplay || detectProvider(openaiKey);
    
    // Banner shows active status
    byokBanner.classList.add('has-key');
    bannerIcon.textContent = enableCloud ? '🌩️' : '🧠';
    
    if (enableCloud) {
      bannerTitle.textContent = `Cloud Mode Active`;
      bannerSubtitle.textContent = `Using ${provider} for AI summaries and explanations`;
    } else {
      bannerTitle.textContent = `Local Mode Active`;
      bannerSubtitle.textContent = `${provider} key saved • Enable Cloud Mode in settings to use it`;
    }
    
    goSettingsBtn.textContent = 'Settings';
  } else {
    // Banner shows onboarding
    byokBanner.classList.remove('has-key');
    bannerIcon.textContent = '⚙️';
    bannerTitle.textContent = 'Bring Your Own Key';
    bannerSubtitle.textContent = 'Connect OpenAI, Claude, Mistral, Gemini, or OpenRouter to unlock full AI power';
    goSettingsBtn.textContent = 'Add Key';
  }
}

// Navigate to settings
goSettingsBtn.addEventListener('click', () => {
  window.location.href = 'settings.html';
});

// Update mode status display
async function updateModeStatus() {
  const { openaiKey, enableCloud, providerDisplay } = await chrome.storage.local.get(['openaiKey', 'enableCloud', 'providerDisplay']);
  const modeStatus = document.getElementById('mode-status');

  if (!modeStatus) return;

  if (enableCloud && openaiKey) {
    // Use saved provider display name or detect from key
    let provider = providerDisplay || 'Cloud';
    if (!providerDisplay) {
      if (openaiKey.startsWith('sk-or-')) provider = 'OpenRouter';
      else if (openaiKey.startsWith('sk-ant-')) provider = 'Anthropic (Claude)';
      else if (openaiKey.startsWith('mistral-')) provider = 'Mistral AI';
      else if (openaiKey.startsWith('AI') || openaiKey.startsWith('AIza')) provider = 'Google Gemini';
      else if (openaiKey.startsWith('sk-')) provider = 'OpenAI';
    }

    modeStatus.innerHTML = `🌩️ <b>Cloud Mode:</b> Connected to <b>${provider}</b>`;
    modeStatus.style.color = '#60a5fa';
  } else {
    modeStatus.innerHTML = '🧠 Local Mode — Using Chrome Built-in AI';
    modeStatus.style.color = '#9ca3af';
  }
}

// Listen for live changes from Settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes.openaiKey || changes.enableCloud) {
    updateModeStatus();
    updateBYOKBanner();
  }
});

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

async function loadData() {
  await updateModeStatus();
  await updateBYOKBanner();
  await loadVault();
}

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
