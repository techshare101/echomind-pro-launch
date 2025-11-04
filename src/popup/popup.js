console.log("🧠 EchoMind popup v0.4.0 Pro Edition loaded");

const summarizeBtn = document.getElementById("summarizeBtn");
const explainBtn = document.getElementById("explainBtn");
const proofreadBtn = document.getElementById("proofreadBtn");
const translateBtn = document.getElementById("translateBtn");
const vaultBtn = document.getElementById("vaultBtn");
const clearVaultBtn = document.getElementById("clearVaultBtn");
const statusEl = document.getElementById("status");
const summaryBox = document.getElementById("summaryBox");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const aiToggle = document.getElementById("aiToggle");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

// Pro upgrade elements
const proBox = document.getElementById("proBox");
const proStatus = document.getElementById("proStatus");
const upgradeMonthlyBtn = document.getElementById("upgradeMonthly");
const upgradeAnnualBtn = document.getElementById("upgradeAnnual");

// Firebase Cloud Functions endpoints (unified API)
const CHECKOUT_ENDPOINT = "https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCheckoutSession";
const CHECK_SUBSCRIPTION_ENDPOINT = "https://us-central1-echomind-pro-launch.cloudfunctions.net/api/checkSubscription";

function showStatus(msg, type = "info") {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function shimmer(el) {
  el.classList.add("loading");
  setTimeout(() => el.classList.remove("loading"), 1500);
}

function startThinking() {
  summaryBox.classList.add("thinking");
}

function stopThinking() {
  summaryBox.classList.remove("thinking");
}

// Helper to get selected text from active tab or stored tab
async function getSelectedText() {
  try {
    // First, check if we have a stored sourceTabId (from context menu)
    const { sourceTabId } = await chrome.storage.local.get("sourceTabId");
    
    let tabId = null;
    
    if (sourceTabId) {
      // Use the stored tab ID from context menu
      tabId = sourceTabId;
      console.log("Using stored tab ID:", tabId);
    } else {
      // Try to get the active tab (when popup is opened normally)
      const tabs = await chrome.tabs.query({ active: true, currentWindow: false });
      if (tabs && tabs.length > 0 && tabs[0].id) {
        tabId = tabs[0].id;
        console.log("Using active tab ID:", tabId);
      }
    }
    
    if (!tabId) {
      console.log("No valid tab ID found");
      return "";
    }
    
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => window.getSelection().toString(),
    });
    
    return result || "";
  } catch (err) {
    console.log("Cannot access tab:", err);
    return "";
  }
}

function formatSummary(summary) {
  return summary
    .replace(/^(.+?:)/gm, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

// Create visual banner showing which AI provider was used
function createProviderBanner(provider, isLocal = false) {
  let engineLabel, engineColor;
  
  if (isLocal) {
    engineLabel = "Local Chrome AI (Fallback)";
    engineColor = "#f87171"; // Red
  } else if (provider.includes("OpenAI")) {
    engineLabel = "GPT-4 via OpenAI";
    engineColor = "#8b5cf6"; // Violet
  } else if (provider.includes("Claude")) {
    engineLabel = "Claude via OpenRouter";
    engineColor = "#00ffff"; // Cyan
  } else if (provider.includes("Mistral")) {
    engineLabel = "Mistral via OpenRouter";
    engineColor = "#ff6b6b"; // Orange-red
  } else if (provider.includes("Gemini")) {
    engineLabel = "Gemini via OpenRouter";
    engineColor = "#4285f4"; // Google blue
  } else if (provider.includes("OpenRouter")) {
    engineLabel = "OpenRouter";
    engineColor = "#00ffff"; // Cyan
  } else {
    engineLabel = provider || "Unknown Provider";
    engineColor = "#aaa"; // Gray
  }
  
  return `
    <div style="
      background: linear-gradient(to right, ${engineColor}33, transparent);
      border-left: 4px solid ${engineColor};
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;
      color: ${engineColor};
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      <span style="font-size: 1.1rem;">☁️</span>
      <span>Cloud Summary: ${engineLabel}</span>
    </div>
  `;
}

// 🔮 FORGE TRACE HUD v2 - Neon gradient HUD with animated latency bar
async function renderForgeTraceHUD(engine, endpoint, status, latencyMs) {
  const result = await chrome.storage.local.get(["showDebug", "compactHUD"]);
  const showDebug = result.showDebug ?? false;
  const compactMode = result.compactHUD ?? false;
  
  if (!showDebug) return "";

  // Define Forge color gradients
  const gradients = {
    "Claude": "linear-gradient(90deg, #00ffffaa, #8b5cf6aa)",
    "OpenAI": "linear-gradient(90deg, #8b5cf6aa, #ff80b5aa)",
    "Mistral": "linear-gradient(90deg, #f97316aa, #fde047aa)",
    "Gemini": "linear-gradient(90deg, #38bdf8aa, #a855f7aa)",
    "Local": "linear-gradient(90deg, #f87171aa, #facc15aa)",
  };

  const color =
    engine.includes("Claude")
      ? gradients["Claude"]
      : engine.includes("GPT-4") || engine.includes("OpenAI")
      ? gradients["OpenAI"]
      : engine.includes("Mistral")
      ? gradients["Mistral"]
      : engine.includes("Gemini")
      ? gradients["Gemini"]
      : gradients["Local"];

  // Normalize latency for the bar (cap at 5s)
  const latencyPct = Math.min((latencyMs / 5000) * 100, 100).toFixed(1);
  const latencyColor =
    latencyMs < 1000 ? "#10b981" : latencyMs < 2500 ? "#facc15" : "#ef4444";

  // Compact mode: just model + latency
  if (compactMode) {
    return `
      <div class="forge-trace-hud-compact" style="
        background: #0f172acc;
        border: 1px solid #1e293b;
        border-radius: 6px;
        margin-top: 6px;
        padding: 6px 10px;
        font-family: 'JetBrains Mono', monospace;
        color: #d1d5db;
        font-size: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: fadeIn 0.5s ease-in-out;
      ">
        <span style="font-weight:600; background:${color}; -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          🤖 ${engine}
        </span>
        <span style="color:${latencyColor}; font-weight:600;">
          ⏱️ ${latencyMs.toFixed(0)}ms
        </span>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(5px); }
          to { opacity:1; transform:translateY(0); }
        }
      </style>
    `;
  }

  // Full mode: complete telemetry
  return `
    <div class="forge-trace-hud" style="
      background: #0f172acc;
      border: 1px solid #1e293b;
      border-radius: 10px;
      margin-top: 8px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      color: #d1d5db;
      font-size: 0.85rem;
      box-shadow: 0 0 12px ${latencyColor}33;
      animation: fadeIn 0.5s ease-in-out;
    ">
      <div style="font-weight:600; background:${color}; -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
        ⚙️ Forge Trace HUD
      </div>
      <div style="margin-top:6px; line-height:1.5;">
        🌐 <b>Endpoint:</b> <span style="font-size:0.75rem; color:#9ca3af;">${endpoint}</span><br/>
        🤖 <b>Engine:</b> ${engine}<br/>
        📊 <b>Status:</b> ${status}<br/>
      </div>
      <div style="margin-top:6px;">
        ⏱️ <b>Latency:</b> ${latencyMs.toFixed(2)} ms
        <div style="
          width:100%; height:6px; border-radius:4px; margin-top:3px;
          background:#1f2937; overflow:hidden;
        ">
          <div style="
            width:${latencyPct}%;
            height:6px;
            background:${latencyColor};
            border-radius:4px;
            transition:width 0.5s ease-in-out;
            animation:pulseGlow 2s infinite ease-in-out;
          "></div>
        </div>
      </div>
    </div>

    <style>
      @keyframes fadeIn {
        from { opacity:0; transform:translateY(5px); }
        to { opacity:1; transform:translateY(0); }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 6px ${latencyColor}66; }
        50% { box-shadow: 0 0 16px ${latencyColor}aa; }
      }
    </style>
  `;
}

// Forge pulse animation on successful response
function showForgePulse() {
  const pulse = document.createElement("div");
  pulse.style = `
    position:fixed; bottom:20px; right:20px;
    width:12px; height:12px;
    background: radial-gradient(circle, #00ffff, #8b5cf6);
    border-radius:50%; box-shadow:0 0 20px #00ffff;
    opacity:0.8; animation: forgePulse 2s infinite ease-in-out;
    z-index: 9999;
  `;
  document.body.appendChild(pulse);
  setTimeout(() => pulse.remove(), 4000);

  // Add animation style if not already present
  if (!document.getElementById("forge-pulse-style")) {
    const style = document.createElement("style");
    style.id = "forge-pulse-style";
    style.textContent = `
      @keyframes forgePulse {
        0%,100% { transform: scale(1); opacity:0.6; }
        50% { transform: scale(1.8); opacity:1; }
      }
    `;
    document.head.appendChild(style);
  }
}

async function sendMessageSafe(payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(payload, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.warn("⚠️ Message failed:", err);
        resolve(null);
      } else resolve(response);
    });
  });
}

// ---------- summarizers ----------
async function localSummarize(text) {
  if (!text) return "No text selected.";
  const words = text.split(" ");
  const short = words.slice(0, 60).join(" ") + (words.length > 60 ? "…" : "");
  const explanation =
    "💡 Explanation:\nThis summary condenses the passage and explains why it may be relevant.";
  return `🔐 Local Summary:\n${short}\n\n${explanation}`;
}

async function aiSummarize(text, key) {
  try {
    // ✅ UNIFIED ROUTING: Detect provider and route accordingly
    const isOpenRouter = key.startsWith("sk-or-");
    const isOpenAI = key.startsWith("sk-proj-") || (key.startsWith("sk-") && !key.startsWith("sk-ant-") && !key.startsWith("sk-or-"));
    const isClaude = key.startsWith("sk-ant-");
    // ✅ Check Gemini BEFORE Mistral (Gemini keys start with AIza)
    const isGemini = key.startsWith("AIza");
    // ✅ Mistral: old format (mistral-xxx) + new format (32-40 alphanumeric, no prefix)
    const isMistral = !isGemini && (key.startsWith("mistral-") || /^[A-Za-z0-9]{32,40}$/.test(key));
    
    // ✅ Route Claude and Mistral through Firebase proxy (CORS-safe)
    const useProxy = isClaude || isMistral;
    
    if (useProxy) {
      // Route through Firebase proxy for CORS-blocked providers
      let provider = "";
      if (isClaude) provider = "Claude";
      else if (isMistral) provider = "Mistral";
      
      console.log(`🤖 Using ${provider} via Forge Proxy for summarization`);
      
      const startTime = performance.now();
      
      const response = await fetch("https://us-central1-echomind-pro-launch.cloudfunctions.net/universalSummarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: key,
          provider: provider,
          text: text
        })
      });
      
      const latency = performance.now() - startTime;
      
      if (!response.ok) {
        console.error(`❌ Proxy Error: ${response.status}`);
        return `⚠️ ${provider} (via Forge Proxy) error: ${response.status}`;
      }
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error(`❌ API Error:`, data);
        window.lastTelemetry = {
          provider: `${provider} (via Forge Proxy)`,
          endpoint: data.endpoint || "Firebase Proxy",
          status: `${data.status} ERROR`,
          latency
        };
        return `⚠️ ${provider} error: ${data.reason}`;
      }
      
      // Store telemetry
      window.lastUsedProvider = `${provider} (via Forge Proxy)`;
      window.lastTelemetry = {
        provider: `${provider} (via Forge Proxy)`,
        endpoint: data.endpoint || "Firebase Proxy",
        status: `${data.status} OK`,
        latency: data.latency || latency,
        model: data.model
      };
      
      showForgePulse();
      
      return `☁️ AI Summary (${provider} via Forge Proxy):\n${data.summary}`;
    }
    
    // ✅ Gemini Hybrid Route: Proxy + OpenRouter fallback
    if (isGemini) {
      const provider = "Gemini";
      const startTime = performance.now();
      let summary = "";
      let status = "";
      let latency = 0;
      let route = "Forge Proxy";
      let endpoint = "";
      let model = "";
      
      // 1️⃣ Try Firebase proxy first
      try {
        console.log(`🤖 Using ${provider} (via Forge Proxy) for summarization`);
        endpoint = "https://us-central1-echomind-pro-launch.cloudfunctions.net/geminiProxy";
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: key,
            text: text
          })
        });
        
        latency = performance.now() - startTime;
        const data = await response.json();
        
        if (data.ok && data.summary) {
          summary = data.summary;
          status = "200 OK";
          model = data.model;
          console.log(`✅ Success with ${model} via Proxy (${latency}ms)`);
        } else {
          console.warn(`⚠️ Gemini proxy failed:`, data);
          status = `${data.status || 502} Proxy Fail`;
        }
      } catch (err) {
        console.error(`❌ Gemini proxy fetch error:`, err);
        status = "Network Error (Proxy)";
      }
      
      // 2️⃣ If proxy failed, return detailed error (no OpenRouter fallback for Google keys)
      if (!summary) {
        console.error(`❌ Gemini proxy failed and no fallback available for Google API keys`);
        // Note: OpenRouter fallback only works with OpenRouter keys (sk-or-...)
        // Google API keys (AIza...) cannot be used with OpenRouter
      }
      
      // 3️⃣ Store telemetry and return
      window.lastUsedProvider = `${provider} (via ${route})`;
      window.lastTelemetry = {
        provider: `${provider} (via ${route})`,
        endpoint,
        status,
        latency,
        model,
        route
      };
      
      if (summary) {
        showForgePulse();
        return `☁️ AI Summary (${provider} via ${route}):\n${summary}`;
      } else {
        return `⚠️ ${provider} (${route}) error: ${status}`;
      }
    }
    
    // Direct routing for OpenAI and OpenRouter
    let endpoint, headers, provider;
    
    if (isOpenAI) {
      // OpenAI direct call
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      };
      provider = "OpenAI";
    } else {
      // OpenRouter direct call
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://echomind-pro-launch.vercel.app",
        "X-Title": "EchoMind Pro",
      };
      provider = "OpenRouter";
    }
    
    console.log(`🤖 Using ${provider} for summarization`);
    console.log(`📡 Endpoint: ${endpoint}`);
    
    // 🧠 Model mapping per provider
    let model = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
    
    console.log(`📋 Model: ${model}`);
    
    // Track latency for Forge HUD
    const startTime = performance.now();
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Provide a concise 2-part answer:\n\n1️⃣ Summary – 4–6 short paragraphs capturing key ideas.\n2️⃣ Explanation – why these points matter or what insights they reveal.",
          },
          { role: "user", content: text },
        ],
      }),
    });
    
    const latency = performance.now() - startTime;
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details:`, errorText);
      
      // Store telemetry for HUD
      window.lastTelemetry = {
        provider,
        endpoint,
        status: `${response.status} ERROR`,
        latency
      };
      
      return `⚠️ ${provider} error: ${response.status} - ${response.statusText}`;
    }
    
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "No result.";
    
    // Store provider info and telemetry for banner and HUD
    window.lastUsedProvider = provider;
    window.lastTelemetry = {
      provider,
      endpoint,
      status: `${response.status} OK`,
      latency
    };
    
    // Show Forge pulse on success
    showForgePulse();
    
    return `☁️ AI Summary (${provider}):\n${summary}`;
  } catch (err) {
    console.error("❌ Cloud summarizer error:", err);
    window.lastUsedProvider = "Error - Fallback";
    return "⚠️ Cloud summarizer error.";
  }
}

// ---------- initialization ----------
async function init() {
  try {
    showStatus("Connecting…");
    const ping = await sendMessageSafe({ type: "ping" });
    if (!ping) {
      showStatus("⚠️ Background inactive — retrying…", "warn");
      setTimeout(init, 1000);
      return;
    }
    showStatus("Ready ✅");

    const { pendingSummary, pendingMode, openaiKey, enableCloud, targetLang } = await chrome.storage.local.get([
      "pendingSummary",
      "pendingMode",
      "openaiKey",
      "enableCloud",
      "targetLang",
    ]);
    
    // Update UI if settings panel exists
    if (aiToggle && apiKeyInput) {
      aiToggle.checked = enableCloud || false;
      apiKeyInput.value = openaiKey || "";
    }

    if (pendingSummary) {
      console.log(`📥 Auto processing: ${pendingMode || 'summarize'}`);
      startThinking();
      const text = pendingSummary;
      const useAI = enableCloud && openaiKey;
      const mode = pendingMode || "summarize";
      const lang = targetLang || "English";

      // Choose label + prompt based on mode
      let label = "Summary";
      let prompt = text;

      switch (mode) {
        case "explain":
          label = "Explanation";
          prompt = `Explain this passage clearly and briefly:\n\n${text}`;
          break;
        case "proofread":
          label = "Proofread Result";
          prompt = `Proofread and correct the following text, improving grammar and clarity but keeping the meaning:\n\n${text}`;
          break;
        case "translate":
          label = `Translation (${lang})`;
          prompt = `Translate this text naturally into ${lang}:\n\n${text}`;
          break;
        default:
          label = "Summary";
          prompt = `Summarize this text and briefly explain why it matters:\n\n${text}`;
          break;
      }

      // Run local or cloud AI
      const result = useAI
        ? await aiSummarize(prompt, openaiKey)
        : await localSummarize(text);

      // Set UI state + style with provider banner and Forge HUD
      summaryBox.setAttribute("data-mode", mode);
      const provider = window.lastUsedProvider || (useAI ? "Cloud AI" : "Local");
      const banner = useAI ? createProviderBanner(provider, false) : createProviderBanner("Local", true);
      
      // Add Forge Trace HUD if telemetry available
      let forgeHUD = "";
      if (useAI && window.lastTelemetry) {
        forgeHUD = await renderForgeTraceHUD(
          window.lastTelemetry.provider,
          window.lastTelemetry.endpoint,
          window.lastTelemetry.status,
          window.lastTelemetry.latency
        );
      }
      
      summaryBox.innerHTML = `${banner}${forgeHUD}<strong>${label}:</strong><br>${result.replace(/\n/g, "<br>")}`;
      summaryBox.scrollTop = 0;
      await chrome.storage.local.set({ lastSummaryLength: result.length });
      stopThinking();
      showStatus(`${label} complete ✅`);

      // Save to vault with mode metadata
      const vault = await chrome.storage.local.get("vaultData");
      const entries = vault.vaultData?.entries || [];
      entries.push({
        text,
        summary: result,
        date: new Date().toISOString(),
        mode: mode,
        lang: lang || null,
      });
      await chrome.storage.local.set({ vaultData: { entries } });

      await chrome.storage.local.remove(["pendingSummary", "pendingMode", "targetLang", "sourceTabId"]);
    }
  } catch (err) {
    console.error("💫 Init error:", err);
    showStatus("Error initializing", "error");
  }
}

// ---------- unified action runner for all modes ----------
async function runAction(mode, lang = "English") {
  try {
    startThinking();
    showStatus(`Processing ${mode}...`);

    const text = await getSelectedText();
    if (!text.trim()) {
      stopThinking();
      showStatus("Please highlight some text first ⚠️", "warn");
      return;
    }

    const { openaiKey, enableCloud } = await chrome.storage.local.get(["openaiKey", "enableCloud"]);
    const useAI = enableCloud && openaiKey;

    let label = "";
    let prompt = "";

    switch (mode) {
      case "explain":
        label = "Explanation";
        prompt = `Explain this passage clearly and briefly:\n\n${text}`;
        break;
      case "proofread":
        label = "Proofread Result";
        prompt = `Proofread and correct the following text, improving grammar and clarity but keeping the meaning:\n\n${text}`;
        break;
      case "translate":
        label = `Translation (${lang})`;
        prompt = `Translate this text naturally into ${lang}:\n\n${text}`;
        break;
      default:
        label = "Summary";
        prompt = `Summarize this text and briefly explain why it matters:\n\n${text}`;
        break;
    }

    const result = useAI 
      ? await aiSummarize(prompt, openaiKey) 
      : await localSummarize(text);

    // Add provider banner and Forge HUD to show which AI was used
    summaryBox.setAttribute("data-mode", mode);
    const provider = window.lastUsedProvider || (useAI ? "Cloud AI" : "Local");
    const banner = useAI ? createProviderBanner(provider, false) : createProviderBanner("Local", true);
    
    // Add Forge Trace HUD if telemetry available
    let forgeHUD = "";
    if (useAI && window.lastTelemetry) {
      forgeHUD = await renderForgeTraceHUD(
        window.lastTelemetry.provider,
        window.lastTelemetry.endpoint,
        window.lastTelemetry.status,
        window.lastTelemetry.latency
      );
    }
    
    summaryBox.innerHTML = `${banner}${forgeHUD}<strong>${label}:</strong><br>${result.replace(/\n/g, "<br>")}`;
    summaryBox.scrollTop = 0;
    await chrome.storage.local.set({ lastSummaryLength: result.length });
    stopThinking();
    showStatus(`${label} complete ✅`);

    // Save to vault with metadata
    const vault = await chrome.storage.local.get("vaultData");
    const entries = vault.vaultData?.entries || [];
    entries.push({
      text,
      summary: result,
      date: new Date().toISOString(),
      mode: mode,
      lang: lang || null,
    });
    await chrome.storage.local.set({ vaultData: { entries } });
    await chrome.storage.local.remove("sourceTabId"); // Clean up sourceTabId after use
  } catch (err) {
    console.error(`💫 ${mode} error:`, err);
    stopThinking();
    showStatus(`Error in ${mode}`, "error");
  }
}

// ---------- button handlers ----------
summarizeBtn.addEventListener("click", () => {
  shimmer(summarizeBtn);
  runAction("summarize");
});

explainBtn.addEventListener("click", () => {
  shimmer(explainBtn);
  runAction("explain");
});

proofreadBtn.addEventListener("click", () => {
  shimmer(proofreadBtn);
  runAction("proofread");
});

translateBtn.addEventListener("click", async () => {
  shimmer(translateBtn);
  const lang = prompt("Translate to which language?", "Spanish");
  if (lang && lang.trim()) {
    await runAction("translate", lang.trim());
  } else {
    showStatus("Translation cancelled", "warn");
  }
});

vaultBtn.addEventListener("click", async () => {
  shimmer(vaultBtn);
  const container = document.getElementById("vaultContainer");
  const summaryBox = document.getElementById("summaryBox");
  const filters = container.querySelectorAll(".filter");
  const entriesDiv = document.getElementById("vaultEntries");
  
  // Hide main view, show vault
  summaryBox.classList.add("hidden");
  container.classList.remove("hidden");

  const { vaultData } = await chrome.storage.local.get("vaultData");
  const entries = vaultData?.entries || [];
  
  if (entries.length === 0) {
    entriesDiv.innerHTML = "<p>Vault is empty.</p>";
    showStatus("Vault loaded ✅");
    return;
  }

  // Render entries by mode
  const renderVault = (filter) => {
    filters.forEach((f) => f.classList.toggle("active", f.dataset.filter === filter));
    const filtered =
      filter === "all" ? entries : entries.filter((e) => e.mode === filter);
    
    entriesDiv.innerHTML =
      filtered.length === 0
        ? `<p>No entries found for "${filter}".</p>`
        : filtered
            .map(
              (v, i) => `
          <div class="vault-entry">
            <strong>#${i + 1} – ${v.mode.toUpperCase()}${v.lang ? " (" + v.lang + ")" : ""}</strong><br>
            <small>${new Date(v.date).toLocaleString()}</small><br>
            <p>${v.summary.replace(/\n/g, "<br>")}</p>
          </div>`
            )
            .join("<hr>");
  };

  // Initial load (All)
  renderVault("all");

  // Add click listeners to filters
  filters.forEach((btn) =>
    btn.addEventListener("click", () => renderVault(btn.dataset.filter))
  );

  showStatus("Vault loaded ✅");
});

clearVaultBtn.addEventListener("click", async () => {
  const ok = confirm("Clear all Vault data?");
  if (!ok) return;
  shimmer(clearVaultBtn);
  await chrome.storage.local.clear();
  summaryBox.textContent = "";
  showStatus("Vault cleared 🧹");
});

// ===== Animated Settings Panel =====
const mainPanel = document.getElementById('mainPanel');
const manageSubBtn = document.getElementById('manageSubBtn');
const backBtn = document.getElementById('backBtn');
const PORTAL_ENDPOINT = "https://us-central1-echomind-pro-launch.cloudfunctions.net/api/createCustomerPortalSession";

// Open Settings with slide animation
settingsBtn.addEventListener('click', () => {
  // Dashboard slides out left
  mainPanel.classList.add('translate-x-[-100%]', 'opacity-0');
  mainPanel.classList.remove('translate-x-0', 'opacity-100');

  setTimeout(() => {
    mainPanel.style.display = 'none';
    settingsPanel.classList.remove('hidden');
    // Settings slides in from right
    setTimeout(() => {
      settingsPanel.classList.remove('translate-x-full', 'opacity-0');
      settingsPanel.classList.add('translate-x-0', 'opacity-100');
    }, 30);
  }, 250);
});

// Back to Dashboard with slide animation
backBtn.addEventListener('click', () => {
  // Settings slides out right
  settingsPanel.classList.add('translate-x-full', 'opacity-0');
  settingsPanel.classList.remove('translate-x-0', 'opacity-100');

  setTimeout(() => {
    settingsPanel.classList.add('hidden');
    mainPanel.style.display = 'block';
    // Dashboard glides in from left
    setTimeout(() => {
      mainPanel.classList.remove('translate-x-[-100%]', 'opacity-0');
      mainPanel.classList.add('translate-x-0', 'opacity-100');
    }, 30);
  }, 300);
});

// 🌌 Forge Portal Overlay Elements
const portalOverlay = document.getElementById('portalOverlay');
const portalFrame = document.getElementById('portalFrame');
const portalLoader = document.getElementById('portalLoader');
const portalProgress = document.getElementById('portalProgress');
const closePortalBtn = document.getElementById('closePortalBtn');

// Open Portal in New Tab (Stripe doesn't allow iframe embedding)
async function openPortalInNewTab() {
  try {
    showStatus('Opening Stripe portal...', 'info');
    
    // Get user email from localStorage with priority order
    const userEmail = localStorage.getItem('echomind_pro_email') || 
                      localStorage.getItem('userEmail') || 
                      localStorage.getItem('user_email');
    
    console.log('🔍 Looking up portal for email:', userEmail);
    
    if (!userEmail || userEmail === 'publicuser@echomind.ai') {
      showStatus('⚠️ Please complete a purchase first', 'error');
      console.warn('No valid user email found in localStorage');
      return;
    }
    
    const response = await fetch(PORTAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail }),
    });

    console.log('📡 Portal response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Portal error:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Portal data received:', data);
    
    if (data.url) {
      // Open Stripe portal in new tab
      console.log('🚀 Opening Stripe portal in new tab:', data.url);
      chrome.tabs.create({ url: data.url });
      showStatus('✅ Portal opened in new tab', 'success');
    } else {
      throw new Error('No portal URL received from server');
    }
  } catch (error) {
    console.error('❌ Error opening customer portal:', error);
    showStatus(`❌ ${error.message || 'Unable to open portal'}`, 'error');
    
    // Show helpful message if customer not found
    if (error.message.includes('Customer not found') || error.message.includes('404')) {
      showStatus('❌ No subscription found. Please upgrade first.', 'error');
    }
  }
}

// Close Portal Overlay
function closePortalOverlay() {
  portalOverlay.classList.add('opacity-0');
  portalOverlay.style.pointerEvents = 'none';
  
  setTimeout(() => {
    portalOverlay.classList.add('hidden');
    portalFrame.src = '';
    portalFrame.classList.remove('loaded');
    portalProgress.style.width = '0%';
  }, 400);
  
  showStatus('Portal closed', 'info');
}

// Manage Subscription - Opens Stripe Portal in New Tab
manageSubBtn.addEventListener('click', () => {
  // Click feedback animation
  manageSubBtn.style.transform = 'scale(0.97)';
  setTimeout(() => {
    manageSubBtn.style.transform = 'scale(1)';
  }, 150);
  
  // Open portal in new tab (Stripe doesn't allow iframe embedding)
  openPortalInNewTab();
});

// Close button handler
closePortalBtn.addEventListener('click', closePortalOverlay);

saveSettingsBtn.addEventListener("click", async () => {
  await chrome.storage.local.set({ 
    enableCloud: aiToggle.checked,
    openaiKey: apiKeyInput.value.trim()
  });
  settingsPanel.classList.add("hidden");
  showStatus("Settings saved ✅");
});

// ---------- dashboard button with fallback ----------
const openDashboardBtn = document.getElementById("openDashboardBtn");

openDashboardBtn?.addEventListener("click", async () => {
  let opened = false;

  try {
    // Try to open the normal dashboard page with 1s timeout
    const openPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Dashboard timeout")), 1000);
      chrome.runtime.openOptionsPage(() => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });

    await openPromise;
    opened = true;
  } catch (err) {
    console.warn("⚠️ Dashboard open failed or timed out:", err);
  }

  // If dashboard didn't open, use the mini fallback
  if (!opened) openMiniDashboard();
});

// ---------- mini dashboard fallback ----------
function openMiniDashboard() {
  // Hide main content
  const app = document.getElementById("app");
  app.style.display = "none";

  // Build fallback dashboard UI
  const fallback = document.createElement("div");
  fallback.className = "mini-dashboard";
  fallback.innerHTML = `
    <h3>⚙️ EchoMind Mini Dashboard</h3>
    <p style="color: #aaa; font-size: 12px;">Fallback mode - full dashboard unavailable</p>
    <label>
      <input type="checkbox" id="miniAiToggle"> Enable Cloud AI (OpenAI)
    </label><br>
    <textarea id="miniApiKey" placeholder="Enter your OpenAI API key here (sk-...)"></textarea><br>
    <button id="miniSave">💾 Save Settings</button>
    <button id="miniBack">← Back</button>
    <hr style="border-color: #333; margin: 12px 0;">
    <button id="miniClearVault" style="background: #ff4444; color: white;">🧹 Clear Vault</button>
  `;
  document.body.appendChild(fallback);

  // Load existing settings
  chrome.storage.local.get(["enableCloud", "openaiKey"], ({ enableCloud, openaiKey }) => {
    document.getElementById("miniAiToggle").checked = enableCloud || false;
    document.getElementById("miniApiKey").value = openaiKey || "";
  });

  // Save handler
  document.getElementById("miniSave").addEventListener("click", async () => {
    await chrome.storage.local.set({ 
      enableCloud: document.getElementById("miniAiToggle").checked,
      openaiKey: document.getElementById("miniApiKey").value.trim()
    });
    showStatus("Settings saved ✅");
    setTimeout(() => {
      fallback.remove();
      app.style.display = "block";
    }, 1500);
  });

  // Clear vault handler
  document.getElementById("miniClearVault").addEventListener("click", async () => {
    if (confirm("⚠️ Clear all vault entries? This cannot be undone!")) {
      await chrome.storage.local.remove("vaultData");
      showStatus("Vault cleared 🧹");
    }
  });

  // Back handler
  document.getElementById("miniBack").addEventListener("click", () => {
    fallback.remove();
    app.style.display = "block";
  });
}

// ---------- back to main button ----------
const backToMainBtn = document.getElementById("backToMainBtn");

backToMainBtn?.addEventListener("click", () => {
  const container = document.getElementById("vaultContainer");
  const summaryBox = document.getElementById("summaryBox");
  container.classList.add("hidden");
  summaryBox.classList.remove("hidden");
  showStatus("Ready ✅");
});

// ========== 💳 PRO UPGRADE FUNCTIONALITY ==========

// Toast notification helper
function showToast(msg, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "0.9rem";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
  toast.style.transition = "all 0.3s ease";
  
  // Color based on type
  if (type === "success") {
    toast.style.background = "rgba(34, 197, 94, 0.9)";
    toast.style.color = "white";
  } else if (type === "error") {
    toast.style.background = "rgba(239, 68, 68, 0.9)";
    toast.style.color = "white";
  } else {
    toast.style.background = "rgba(59, 130, 246, 0.9)";
    toast.style.color = "white";
  }
  
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Check subscription status on popup load
async function checkSubscriptionStatus() {
  try {
    // Try to get user email from storage (or use public default for testing)
    let { userEmail } = await chrome.storage.local.get("userEmail");
    
    // Fallback to a public email for testing (users can upgrade without login)
    if (!userEmail) {
      userEmail = "publicuser@echomind.ai";
      console.log("No user email found, using public email for checkout");
    }

    // Make the subscription check request
    const response = await fetch(`${CHECK_SUBSCRIPTION_ENDPOINT}?email=${userEmail}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === "active") {
      console.log("✅ EchoMind Pro verified active");
      
      // Save to localStorage for quick access
      localStorage.setItem("isProActive", "true");
      localStorage.setItem("proActivatedAt", new Date().toISOString());
      
      // Save email for portal access (use data.email from response if available)
      const emailToSave = data.email || userEmail;
      if (emailToSave && emailToSave !== 'publicuser@echomind.ai') {
        localStorage.setItem("echomind_pro_email", emailToSave);
        console.log("💾 Saved user email for portal access:", emailToSave);
      }
      
      // Show Pro badge in header
      proStatus?.classList.remove("hidden");
      
      // Hide upgrade box
      proBox?.classList.add("hidden");
      
      // Update status message
      showStatus("✨ Pro Active", "success");
      
      // Show welcome toast (only on first activation)
      const lastToast = localStorage.getItem("lastProToast");
      const now = Date.now();
      if (!lastToast || (now - parseInt(lastToast)) > 3600000) { // 1 hour
        showToast("✨ EchoMind Pro activated — welcome back!", "success");
        localStorage.setItem("lastProToast", now.toString());
      }
      
      // Show "Welcome to Forge Mode" (one-time only)
      const forgeWelcomeShown = localStorage.getItem("forgeWelcomeShown");
      if (!forgeWelcomeShown) {
        setTimeout(() => {
          const welcome = document.getElementById("forge-welcome-popup");
          if (welcome) {
            welcome.classList.remove("hidden");
            welcome.style.opacity = "1";
            welcome.style.transform = "translateY(0)";
            welcome.style.animation = "forgePulseText 4s ease-in-out 1";
            
            // Fade out after 5 seconds
            setTimeout(() => {
              welcome.style.opacity = "0";
              welcome.style.transform = "translateY(10px)";
              localStorage.setItem("forgeWelcomeShown", "true");
              
              // Hide after fade completes
              setTimeout(() => {
                welcome.classList.add("hidden");
              }, 1000);
            }, 5000);
          }
        }, 1500); // Show after confetti starts
      }
      
      return true;
    } else {
      console.log("⚠️ EchoMind Pro inactive, showing upgrade box");
      
      // Save to localStorage
      localStorage.setItem("isProActive", "false");
      
      // Hide Pro badge
      proStatus?.classList.add("hidden");
      
      // Show upgrade box
      proBox?.classList.remove("hidden");
      
      return false;
    }
  } catch (error) {
    console.error("Error checking subscription:", error);
    
    // Hide Pro badge on error
    proStatus?.classList.add("hidden");
    
    // Show upgrade box on error (fail open for revenue)
    proBox?.classList.remove("hidden");
    
    // Show error toast
    showToast("⚠️ Could not verify Pro status. Try again later.", "error");
    
    return false;
  }
}

// Handle upgrade button clicks
async function handleUpgrade(plan) {
  const button = plan === "monthly" ? upgradeMonthlyBtn : upgradeAnnualBtn;
  const originalHTML = button.innerHTML;

  try {
    // Show loading state
    button.innerHTML = '<span style="font-size: 0.9rem;">⏳ Loading...</span>';
    button.disabled = true;

    console.log(`Creating ${plan} checkout session...`);

    // Call Firebase function to create checkout session (proxied through Vercel)
    const response = await fetch(`${CHECKOUT_ENDPOINT}?plan=${plan}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.url) {
      console.log("✅ Checkout session created:", data.sessionId);
      
      // Open Stripe Checkout in a new tab
      chrome.tabs.create({ url: data.url });
      
      // Show success message
      showStatus(`Opening ${plan} checkout...`, "success");
    } else {
      throw new Error("No checkout URL returned");
    }
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    showStatus("Checkout failed. Please try again.", "error");
    alert(`Failed to create checkout session: ${error.message}`);
    
    // Reset button
    button.innerHTML = originalHTML;
    button.disabled = false;
  }
}

// Attach event listeners to upgrade buttons
upgradeMonthlyBtn?.addEventListener("click", () => handleUpgrade("monthly"));
upgradeAnnualBtn?.addEventListener("click", () => handleUpgrade("annual"));

// ========== 🎊 FORGE CELEBRATION EFFECTS ==========

// Pro badge pulse animation
function proBadgePulse() {
  const badge = proStatus;
  if (!badge || badge.classList.contains("hidden")) return;
  
  badge.style.animation = "forgePulse 2s ease-in-out 1";
  setTimeout(() => {
    badge.style.animation = "";
  }, 2000);
}

// Popup confetti celebration
function forgeConfetti() {
  const confetti = document.createElement("canvas");
  confetti.id = "popup-confetti";
  confetti.style.position = "fixed";
  confetti.style.top = "0";
  confetti.style.left = "0";
  confetti.style.width = "100%";
  confetti.style.height = "100%";
  confetti.style.pointerEvents = "none";
  confetti.style.zIndex = "9999";
  document.body.appendChild(confetti);

  const ctx = confetti.getContext("2d");
  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;
  
  const parts = Array.from({length: 80}, () => ({
    x: Math.random() * confetti.width,
    y: Math.random() * confetti.height - confetti.height,
    size: Math.random() * 4 + 2,
    color: `hsl(${Math.random() * 360}, 100%, 60%)`,
    speed: Math.random() * 3 + 1,
    angle: Math.random() * Math.PI * 2,
  }));

  function draw() {
    ctx.clearRect(0, 0, confetti.width, confetti.height);
    parts.forEach(p => {
      p.y += p.speed;
      p.x += Math.sin(p.angle) * 0.3;
      if (p.y > confetti.height) p.y = -10;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    requestAnimationFrame(draw);
  }
  
  draw();
  
  // Fade out and remove after 3 seconds
  setTimeout(() => {
    confetti.style.opacity = "0";
    confetti.style.transition = "opacity 1s ease";
    setTimeout(() => confetti.remove(), 1000);
  }, 3000);
}

// Trigger celebration when Pro is detected
function celebrateProActivation() {
  const isProActive = localStorage.getItem("isProActive") === "true";
  const lastCelebration = localStorage.getItem("lastProCelebration");
  const now = Date.now();
  
  // Only celebrate once per session (or after 1 hour)
  if (isProActive && (!lastCelebration || (now - parseInt(lastCelebration)) > 3600000)) {
    setTimeout(() => {
      console.log("🎊 Celebrating Pro activation!");
      proBadgePulse();
      forgeConfetti();
      localStorage.setItem("lastProCelebration", now.toString());
    }, 800);
  }
}

// Check subscription status when popup opens
checkSubscriptionStatus().then(() => {
  // Celebrate if Pro is active
  celebrateProActivation();
});

init();

// ========== 🛡️ UI STATE RESET SAFEGUARD ==========

/**
 * Universal UI state reset function
 * Ensures no overlays are blocking the main dashboard
 * Call this if UI becomes unresponsive
 */
function resetUIState() {
  console.log('🔄 Resetting UI state...');
  
  // Hide all overlay panels
  const panels = ['settingsPanel', 'portalOverlay'];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      el.style.pointerEvents = 'none';
      el.style.opacity = '0';
      el.style.display = 'none';
    }
  });
  
  // Ensure main panel is visible and clickable
  const main = document.getElementById('mainPanel');
  if (main) {
    main.classList.remove('hidden');
    main.style.display = 'block';
    main.style.pointerEvents = 'auto';
    main.style.opacity = '1';
    main.classList.remove('translate-x-[-100%]', 'opacity-0');
    main.classList.add('translate-x-0', 'opacity-100');
  }
  
  // Clear portal iframe
  if (portalFrame) {
    portalFrame.src = '';
    portalFrame.classList.remove('loaded');
  }
  
  console.log('✅ UI state reset complete');
}

// Enhanced Escape key handler - resets entire UI state
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close portal if open
    if (!portalOverlay.classList.contains('hidden')) {
      closePortalOverlay();
    }
    // Close settings if open
    else if (!settingsPanel.classList.contains('hidden')) {
      backBtn.click();
    }
    // Otherwise, reset entire UI state as safeguard
    else {
      resetUIState();
    }
  }
});

// Expose reset function globally for debugging
window.resetUIState = resetUIState;

// ========== 🌟 DYNAMIC PLAN BADGE SYSTEM ==========

/**
 * Updates the plan badge dynamically based on user's subscription
 * Supports: starter, pro, annual plans with different color schemes
 */
let planBadgeListener = null; // Store listener for cleanup

async function updatePlanBadge() {
  const badge = document.getElementById('planBadge');
  const nameEl = document.getElementById('planName');
  const statusEl = document.getElementById('planStatus');
  const manageBtn = document.getElementById('planManageBtn');
  const proBox = document.getElementById('proBox');

  if (!badge || !nameEl || !statusEl || !manageBtn) {
    console.warn('⚠️ Plan badge elements not found');
    return;
  }

  try {
    // Get user email from localStorage
    const userEmail = localStorage.getItem('echomind_pro_email') || 
                      localStorage.getItem('userEmail') || 
                      localStorage.getItem('user_email');

    if (!userEmail || userEmail === 'publicuser@echomind.ai') {
      // No valid user - show upgrade box
      badge.classList.add('hidden');
      if (proBox) proBox.classList.remove('hidden');
      console.log('📦 No subscription - showing upgrade box');
      return;
    }

    // Check subscription status from localStorage (set by checkSubscriptionStatus)
    const isPro = localStorage.getItem('echomind_pro_status') === 'true';
    const planType = localStorage.getItem('echomind_plan_type') || 'starter';

    console.log('🔍 Plan badge update:', { isPro, planType, userEmail });

    if (!isPro) {
      // Free tier - show upgrade box
      badge.classList.add('hidden');
      if (proBox) proBox.classList.remove('hidden');
      return;
    }

    // User has active subscription - show badge, hide upgrade box
    badge.classList.remove('hidden');
    if (proBox) proBox.classList.add('hidden');

    // Configure badge based on plan type
    let config = {
      text: 'Starter Plan',
      status: 'Free Tier Active',
      className: 'starter',
      showManage: false
    };

    if (planType === 'monthly' || planType === 'pro') {
      config = {
        text: 'Pro Plan',
        status: 'Monthly Subscription Active',
        className: 'pro',
        showManage: true
      };
    } else if (planType === 'annual' || planType === 'yearly') {
      config = {
        text: 'Annual Plan',
        status: 'Annual Subscription Active',
        className: 'annual',
        showManage: true
      };
    }

    // Apply styles
    badge.className = `plan-badge ${config.className}`;
    nameEl.textContent = `EchoMind ${config.text}`;
    statusEl.textContent = config.status;

    // Show/hide manage button
    if (config.showManage) {
      manageBtn.style.display = 'block';
      manageBtn.onclick = () => {
        console.log(`🚀 Opening Stripe portal for ${config.text}`);
        openPortalInNewTab();
      };
    } else {
      manageBtn.style.display = 'none';
    }

    console.log(`✅ Plan badge updated: ${config.text}`);

  } catch (err) {
    console.error('❌ Error updating plan badge:', err);
    // Fallback to starter
    badge.classList.remove('hidden');
    badge.className = 'plan-badge starter';
    nameEl.textContent = 'EchoMind Starter';
    statusEl.textContent = 'Free tier active';
    manageBtn.style.display = 'none';
  }
}

/**
 * Sets up real-time Firestore listener for plan changes
 * Updates badge instantly when subscription changes (no reload needed)
 */
function setupPlanBadgeListener() {
  // Clean up existing listener
  if (planBadgeListener) {
    planBadgeListener();
    planBadgeListener = null;
  }

  const userEmail = localStorage.getItem('echomind_pro_email') || 
                    localStorage.getItem('userEmail') || 
                    localStorage.getItem('user_email');

  if (!userEmail || userEmail === 'publicuser@echomind.ai') {
    console.log('📦 No user email - skipping Firestore listener');
    return;
  }

  try {
    // Listen to user's subscription document in Firestore
    const db = firebase.firestore();
    const docRef = db.collection('user_subscription_status').doc(userEmail);

    console.log('👂 Setting up real-time plan badge listener for:', userEmail);

    planBadgeListener = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        console.log('🔄 Subscription data updated:', data);

        // Update localStorage
        localStorage.setItem('echomind_pro_status', data.isPro ? 'true' : 'false');
        localStorage.setItem('echomind_plan_type', data.planType || 'starter');
        localStorage.setItem('echomind_pro_email', userEmail);

        // Update badge immediately
        updatePlanBadge();

        // Show notification if plan changed
        if (data.isPro) {
          showStatus(`✅ ${data.planType === 'annual' ? 'Annual' : 'Pro'} plan active`, 'success');
        }
      } else {
        console.log('📭 No subscription document found');
        localStorage.setItem('echomind_pro_status', 'false');
        localStorage.setItem('echomind_plan_type', 'starter');
        updatePlanBadge();
      }
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });

    console.log('✅ Real-time plan badge listener active');

  } catch (err) {
    console.error('❌ Error setting up Firestore listener:', err);
  }
}

// Initialize plan badge on load
updatePlanBadge();

// Set up real-time listener after subscription check
checkSubscriptionStatus().then(() => {
  setupPlanBadgeListener();
  celebrateProActivation();
});

// ========== 🚀 FORGE TELEPORT: SETTINGS → DASHBOARD ==========

/**
 * Creates a cinematic toast notification
 * @param {string} message - Toast message
 * @param {number} duration - Display duration in ms
 */
function showForgeToast(message, duration = 2500) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'forge-toast animate-toast-fade';
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 50);
  
  // Fade out
  setTimeout(() => {
    toast.style.opacity = '0';
  }, duration - 500);
  
  // Remove
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// Update Settings "Manage Subscription" button to redirect to dashboard
const settingsManageBtn = document.getElementById('manageSubBtn');
if (settingsManageBtn) {
  // Remove old listener and add new one
  const newManageBtn = settingsManageBtn.cloneNode(true);
  settingsManageBtn.parentNode.replaceChild(newManageBtn, settingsManageBtn);
  
  newManageBtn.addEventListener('click', () => {
    const dashboardUrl = 'https://echomind-pro-launch.vercel.app/dashboard?from=success';
    console.log('🚀 Opening Forge Cockpit at:', dashboardUrl);
    
    // Click feedback animation
    newManageBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      newManageBtn.style.transform = 'scale(1)';
    }, 150);
    
    // Show cinematic toast
    showForgeToast('🚀 Opening Forge Cockpit...');
    
    // Redirect after cinematic delay
    setTimeout(() => {
      chrome.tabs.create({ url: dashboardUrl });
    }, 900);
  });
}
