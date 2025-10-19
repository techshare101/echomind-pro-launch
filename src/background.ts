/**
 * EchoMind v0.3.3 "Stable Context Summarizer"
 * Unified Background Service Worker
 */

console.log('🧠 EchoMind background v0.3.3 loaded');

if (typeof self !== 'undefined') {
  // ---------- 1️⃣ Keep-alive Heartbeat ----------
  let keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  function keepAlive() {
    chrome.runtime.getPlatformInfo(() => {}); // ping
  }
  function startKeepAlive() {
    if (!keepAliveInterval) {
      keepAliveInterval = setInterval(keepAlive, 15 * 1000);
      console.log('📚 Keep-alive heartbeat active');
    }
  }
  chrome.runtime.onStartup.addListener(startKeepAlive);
  startKeepAlive();

  // ---------- 2️⃣ Safe Vault Loader ----------
  async function loadVault() {
    try {
      const result = await chrome.storage.local.get(['vaultData']);
      if (!result.vaultData) {
        console.log('⚠️ No vault found — creating new one');
        await chrome.storage.local.set({ vaultData: { entries: [] } });
      }
      return result.vaultData;
    } catch (err) {
      console.error('❌ Vault load error, resetting:', err);
      await chrome.storage.local.clear();
      await chrome.storage.local.set({ vaultData: { entries: [] } });
      return { entries: [] };
    }
  }

  // ---------- 3️⃣ One-Window Guard (Adaptive Sizing) ----------
  let activeWindowId: number | null = null;
  async function openEchoMindWindow(params = '') {
    if (activeWindowId) {
      try {
        await chrome.windows.update(activeWindowId, { focused: true });
        console.log('🧶 Refocused EchoMind window');
        return;
      } catch {
        activeWindowId = null;
      }
    }

    // Read last summary length to decide window size
    const { lastSummaryLength } = await chrome.storage.local.get('lastSummaryLength');
    const baseWidth = 600;
    const baseHeight = 560;
    const extra = lastSummaryLength ? Math.min(Math.ceil(lastSummaryLength / 400), 4) : 0;
    const height = baseHeight + extra * 150;
    const width = baseWidth + Math.min(extra * 150, 400);

    chrome.windows.create(
      {
        url: chrome.runtime.getURL('popup.html') + params,
        type: 'popup',
        width,
        height,
      },
      (win) => {
        if (win && win.id) {
          activeWindowId = win.id;
          // Center the window after creation using the window's current display
          chrome.windows.update(win.id, {
            left: Math.round((win.left || 0) + 100),
            top: Math.round((win.top || 0) + 50),
            focused: true,
          });
          console.log(`🧶 EchoMind window opened: ${width}×${height}`);
        }
      }
    );
  }

  // Listen for window close to reset activeWindowId
  chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === activeWindowId) {
      activeWindowId = null;
      console.log('🧶 EchoMind window closed');
    }
  });

  // ---------- 4️⃣ Icon Click → Open Window ----------
  chrome.action.onClicked.addListener(() => openEchoMindWindow(''));

  // ---------- 5️⃣ Context Menu Integration (Multi-Action + Multilingual) ----------
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      // Core actions
      chrome.contextMenus.create({
        id: 'em_summarize',
        title: '🧠 EchoMind: Summarize',
        contexts: ['selection'],
      });
      chrome.contextMenus.create({
        id: 'em_explain',
        title: '💡 EchoMind: Explain',
        contexts: ['selection'],
      });
      chrome.contextMenus.create({
        id: 'em_proofread',
        title: '✏️ EchoMind: Proofread',
        contexts: ['selection'],
      });

      // Parent translate menu
      chrome.contextMenus.create({
        id: 'em_translate_parent',
        title: '🌍 EchoMind: Translate →',
        contexts: ['selection'],
      });

      // Translation sub-items
      const langs = [
        { id: 'em_translate_en', label: 'English' },
        { id: 'em_translate_es', label: 'Spanish' },
        { id: 'em_translate_fr', label: 'French' },
        { id: 'em_translate_ja', label: 'Japanese' },
        { id: 'em_translate_de', label: 'German' },
        { id: 'em_translate_it', label: 'Italian' },
        { id: 'em_translate_pt', label: 'Portuguese' },
        { id: 'em_translate_zh', label: 'Chinese' },
        { id: 'em_translate_ar', label: 'Arabic' },
        { id: 'em_translate_ru', label: 'Russian' },
      ];

      langs.forEach(({ id, label }) => {
        chrome.contextMenus.create({
          id,
          parentId: 'em_translate_parent',
          title: `🌍 ${label}`,
          contexts: ['selection'],
        });
      });
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!info.selectionText) return;

    let mode = 'summarize';
    let targetLang = 'English';

    if (info.menuItemId === 'em_explain') mode = 'explain';
    if (info.menuItemId === 'em_proofread') mode = 'proofread';
    if (info.menuItemId && info.menuItemId.toString().startsWith('em_translate_')) {
      mode = 'translate';
      const langCode = info.menuItemId.toString().split('_')[2];
      const langMap: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        ja: 'Japanese',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
        zh: 'Chinese',
        ar: 'Arabic',
        ru: 'Russian',
      };
      targetLang = langMap[langCode] || 'English';
    }

    console.log(`📋 Context menu triggered: ${mode}${mode === 'translate' ? ` → ${targetLang}` : ''}`);
    // Write to storage, including the source tab ID
    chrome.storage.local.set(
      { 
        pendingSummary: info.selectionText, 
        pendingMode: mode, 
        targetLang,
        sourceTabId: tab?.id || null
      },
      () => {
        setTimeout(() => {
          openEchoMindWindow(`?mode=${mode}`);
        }, 800);
      }
    );
  });

  // ---------- 6️⃣ Message Handlers ----------
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ping') {
      sendResponse({ status: 'ok', version: '0.3.3' });
      return true;
    }

    if (message.type === 'getVault') {
      loadVault().then((data) => sendResponse({ data }));
      return true;
    }

    if (message.type === 'clearVault') {
      chrome.storage.local.clear(() => {
        console.log('🧹 Vault cleared manually');
        sendResponse({ status: 'cleared' });
      });
      return true;
    }

    if (message.type === 'errorLog') {
      console.error('🧠 EchoMind error:', message.payload);
      sendResponse({ status: 'logged' });
      return true;
    }
  });

  // ---------- 7️⃣ Safety Startup ----------
  chrome.runtime.onInstalled.addListener(() => console.log('🌅 EchoMind installed'));
  console.log('✅ Background service ready');
}
