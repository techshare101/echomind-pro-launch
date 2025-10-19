/**
 * EchoMind Vault Vision - Permanent Tab
 * v0.3.0 - Full vault viewer with search, export, clear
 */

const list = document.getElementById("vault-list");
const search = document.getElementById("search");
const refreshBtn = document.getElementById("refresh");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");
const entryCount = document.getElementById("entry-count");
const filteredCount = document.getElementById("filtered-count");
const filteredNum = document.getElementById("filtered-num");

let allEntries = [];

async function loadVault() {
  try {
    const { vaultEntries = [] } = await chrome.storage.local.get("vaultEntries");
    allEntries = vaultEntries;
    entryCount.textContent = `${allEntries.length} ${allEntries.length === 1 ? "entry" : "entries"}`;
    render();
  } catch (err) {
    console.error("Failed to load vault:", err);
    list.innerHTML = `<p class="empty">⚠️ Error loading vault: ${err.message}</p>`;
  }
}

function render() {
  const q = search.value.toLowerCase().trim();
  
  let filtered = allEntries;
  if (q) {
    filtered = allEntries.filter(e =>
      e.text.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)
    );
  }

  // Update filtered count
  if (q && filtered.length !== allEntries.length) {
    filteredCount.style.display = "inline";
    filteredNum.textContent = filtered.length;
  } else {
    filteredCount.style.display = "none";
  }

  // Render entries (last 200, reversed)
  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty">
      ${q ? "No entries match your search." : "No saved entries yet.\nHighlight text and use EchoMind!"}
    </p>`;
    return;
  }

  list.innerHTML = filtered
    .slice(-200)
    .reverse()
    .map((e, idx) => `
      <div class="entry" data-index="${idx}">
        <div class="entry-header">
          <span class="entry-type">${escapeHtml(e.type)}</span>
          <span class="entry-time">${formatTime(e.time)}</span>
        </div>
        <div class="entry-text">${escapeHtml(e.text.slice(0, 500))}</div>
        <div class="entry-actions">
          <button class="copy-btn" data-text="${escapeHtml(e.text)}">📋 Copy</button>
        </div>
      </div>
    `)
    .join("");

  // Attach copy handlers
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async (ev) => {
      const text = btn.getAttribute("data-text");
      try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = "✅ Copied!";
        setTimeout(() => {
          btn.textContent = original;
        }, 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    });
  });
}

search.addEventListener("input", render);

refreshBtn.addEventListener("click", async () => {
  refreshBtn.disabled = true;
  await loadVault();
  refreshBtn.disabled = false;
});

exportBtn.addEventListener("click", async () => {
  try {
    const { vaultEntries = [] } = await chrome.storage.local.get("vaultEntries");
    const blob = new Blob([JSON.stringify(vaultEntries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: `echomind_vault_${new Date().toISOString().split("T")[0]}.json`
    });
  } catch (err) {
    console.error("Export failed:", err);
    alert("Failed to export vault");
  }
});

clearBtn.addEventListener("click", async () => {
  if (!confirm("🗑️ Clear ALL vault entries? This cannot be undone.")) return;
  try {
    await chrome.storage.local.set({ vaultEntries: [] });
    allEntries = [];
    search.value = "";
    render();
    entryCount.textContent = "0 entries";
  } catch (err) {
    console.error("Clear failed:", err);
    alert("Failed to clear vault");
  }
});

function formatTime(timestamp) {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return then.toLocaleDateString();
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Load vault on page load
loadVault();

// Auto-refresh every 5 seconds to catch new entries
setInterval(loadVault, 5000);
