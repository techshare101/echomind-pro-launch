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

// Firebase Cloud Functions endpoints (proxied through Vercel)
const CHECKOUT_ENDPOINT = "/api/createCheckoutSession";
const CHECK_SUBSCRIPTION_ENDPOINT = "/api/checkSubscription";

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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Provide a concise 2-part answer:\n\n1️⃣ Summary – 4–6 short paragraphs capturing key ideas.\n2️⃣ Explanation – why these points matter or what insights they reveal.",
          },
          { role: "user", content: text },
        ],
      }),
    });
    const data = await response.json();
    return `☁️ AI Summary:\n${data.choices?.[0]?.message?.content || "No result."}`;
  } catch (err) {
    console.error(err);
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

    const { pendingSummary, pendingMode, aiSettings, targetLang } = await chrome.storage.local.get([
      "pendingSummary",
      "pendingMode",
      "aiSettings",
      "targetLang",
    ]);
    if (aiSettings) {
      aiToggle.checked = aiSettings.enabled;
      apiKeyInput.value = aiSettings.key || "";
    }

    if (pendingSummary) {
      console.log(`📥 Auto processing: ${pendingMode || 'summarize'}`);
      startThinking();
      const text = pendingSummary;
      const key = aiSettings?.key;
      const useAI = aiSettings?.enabled && key;
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
        ? await aiSummarize(prompt, key)
        : await localSummarize(text);

      // Set UI state + style
      summaryBox.setAttribute("data-mode", mode);
      summaryBox.innerHTML = `<strong>${label}:</strong><br>${result.replace(/\n/g, "<br>")}`;
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

    const { aiSettings } = await chrome.storage.local.get("aiSettings");
    const key = aiSettings?.key;
    const useAI = aiSettings?.enabled && key;

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
      ? await aiSummarize(prompt, key) 
      : await localSummarize(text);

    summaryBox.setAttribute("data-mode", mode);
    summaryBox.innerHTML = `<strong>${label}:</strong><br>${result.replace(/\n/g, "<br>")}`;
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

// ---------- settings panel ----------
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});

saveSettingsBtn.addEventListener("click", async () => {
  const settings = {
    enabled: aiToggle.checked,
    key: apiKeyInput.value.trim(),
  };
  await chrome.storage.local.set({ aiSettings: settings });
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
  chrome.storage.local.get("aiSettings", ({ aiSettings }) => {
    if (aiSettings) {
      document.getElementById("miniAiToggle").checked = aiSettings.enabled || false;
      document.getElementById("miniApiKey").value = aiSettings.key || "";
    }
  });

  // Save handler
  document.getElementById("miniSave").addEventListener("click", async () => {
    const settings = {
      enabled: document.getElementById("miniAiToggle").checked,
      key: document.getElementById("miniApiKey").value.trim(),
    };
    await chrome.storage.local.set({ aiSettings: settings });
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

    const data = await response.json();

    if (data.status === "active") {
      console.log("✅ EchoMind Pro verified active");
      
      // Save to localStorage for quick access
      localStorage.setItem("isProActive", "true");
      localStorage.setItem("proActivatedAt", new Date().toISOString());
      
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
