// EchoMind v0.2.9 — Context Aura Edition
// Shadow DOM + AnchorLock + visual pulse effects
import { summarizeText } from "./utils/aiSummarizer";

let shadowRoot: ShadowRoot | null = null;
let menuEl: HTMLElement | null = null;
let busy = false;
let anchorOverlay: HTMLElement | null = null;
let anchoredText = "";

console.log("🌟 EchoMind v0.2.9 Context Aura loaded");

// === AnchorLock System ===
function lockSelection(sel: Selection): string {
  const text = sel.toString().trim();
  if (!text) return "";
  
  // Remove old anchor
  if (anchorOverlay) anchorOverlay.remove();

  // Create invisible overlay to preserve selection data
  anchorOverlay = document.createElement("div");
  Object.assign(anchorOverlay.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    background: "transparent",
    zIndex: "2147483646",
  });

  // Hidden pre element holds the text safely
  const pre = document.createElement("pre");
  pre.textContent = text;
  pre.style.display = "none";
  anchorOverlay.appendChild(pre);

  document.body.appendChild(anchorOverlay);
  anchoredText = text;
  return text;
}

function unlockSelection() {
  anchorOverlay?.remove();
  anchorOverlay = null;
  anchoredText = "";
}

// === Aura Pulse Animation ===
function triggerAura(x?: number, y?: number) {
  const centerX = x || window.innerWidth / 2;
  const centerY = y || window.innerHeight / 2;
  
  const pulse = document.createElement("div");
  Object.assign(pulse.style, {
    position: "fixed",
    left: `${centerX}px`,
    top: `${centerY}px`,
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.6)",
    boxShadow: "0 0 20px rgba(16,185,129,0.9)",
    zIndex: "2147483647",
    transform: "translate(-50%, -50%) scale(1)",
    opacity: "1",
    pointerEvents: "none",
    transition: "transform 1s ease-out, opacity 1s ease-out",
  });
  
  document.body.appendChild(pulse);
  
  requestAnimationFrame(() => {
    pulse.style.transform = "translate(-50%, -50%) scale(10)";
    pulse.style.opacity = "0";
  });
  
  setTimeout(() => pulse.remove(), 1000);
}

// === Toast Notification ===
function toast(msg: string) {
  const t = document.createElement("div");
  t.className = "echomind-toast";
  t.innerHTML = `<div class="title">✅ EchoMind</div><div>${msg.slice(0,250)}</div>`;
  Object.assign(t.style, {
    position: "fixed", right: "20px", bottom: "20px",
    background: "rgba(20,20,25,.95)", color: "#f3f3f3",
    padding: "14px 18px", borderRadius: "10px",
    fontSize: "14px", zIndex: "2147483647",
    boxShadow: "0 6px 18px rgba(0,0,0,.45)"
  });
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),8000);
}

// === AI Processing ===
async function run(label: string, text: string) {
  let result = "";
  try {
    const prefix = {
      Summarize: "Summarize this:\n\n",
      Explain: "Explain clearly:\n\n",
      Simplify: "Simplify this:\n\n",
      Proofread: "Proofread and correct grammar:\n\n",
    }[label] || "";
    result = await summarizeText(prefix + text);
  } catch { result = "[AI unavailable]"; }

  const entry = { type: label, text: result, time: Date.now() };
  chrome.storage.local.get(["vaultEntries"], ({ vaultEntries = [] }) => {
    vaultEntries.push(entry);
    chrome.storage.local.set({ vaultEntries });
  });

  toast(`${label} Complete ✅\n${result}`);
}

// === Context Menu Action Handler ===
async function performEchoAction(action: string, text: string) {
  if (!text) return;
  
  if (action === "save") {
    const entry = { type: "Save", text, time: Date.now() };
    chrome.storage.local.get(["vaultEntries"], ({ vaultEntries = [] }) => {
      vaultEntries.push(entry);
      chrome.storage.local.set({ vaultEntries });
    });
    toast("Saved to Memory Vault ✅");
    return;
  }

  const label = action.charAt(0).toUpperCase() + action.slice(1);
  await run(label, text);
}

// === Message Listener (for context menu) ===
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "ECHO_ACTION") {
    triggerAura();
    performEchoAction(msg.action, msg.text);
    sendResponse({ received: true });
  }
  return true;
});

// === Shadow DOM Setup ===
function getShadow(): ShadowRoot {
  if (shadowRoot) return shadowRoot;
  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed", inset: "0", zIndex: "2147483647", pointerEvents: "none"
  });
  document.documentElement.appendChild(host);
  shadowRoot = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .menu{position:absolute;display:flex;gap:6px;padding:6px;
      background:rgba(24,24,27,.92);
      border:1px solid rgba(16,185,129,0.4);
      backdrop-filter:blur(8px);
      border-radius:10px;
      box-shadow:0 0 15px rgba(16,185,129,0.3);
      pointer-events:auto;font-family:Inter,sans-serif;}
    .menu button{border:none;outline:none;background:rgba(255,255,255,.1);
      color:#e5e5e5;font-size:13px;padding:6px 10px;border-radius:6px;
      cursor:pointer;transition:background .2s;font-weight:500;letter-spacing:0.2px;}
    .menu button:hover{background:rgba(255,255,255,.2);}
    @keyframes shimmer{0%{background-position:-200% 0}
      100%{background-position:200% 0}}
    .menu button.loading{
      background:linear-gradient(110deg,
        rgba(16,185,129,.3) 8%,rgba(16,185,129,.8) 18%,rgba(16,185,129,.3) 33%);
      background-size:200% 100%;animation:shimmer 1.3s linear infinite;
      color:#fff!important;pointer-events:none;}
  `;
  shadowRoot.appendChild(style);
  return shadowRoot;
}

// === Menu Creation ===
function createMenu(sel: Selection) {
  const rect = sel.getRangeAt(0).getBoundingClientRect();
  const root = getShadow();
  if (menuEl) menuEl.remove();

  // Lock selection before menu appears
  const lockedText = lockSelection(sel);

  const menu = document.createElement("div");
  menu.className = "menu";
  const acts = ["Summarize","Explain","Simplify","Proofread","Save"];

  acts.forEach(label=>{
    const b=document.createElement("button");
    b.textContent=label; menu.appendChild(b);

    b.onmousedown=e=>{e.preventDefault();e.stopPropagation();};
    b.onclick=async e=>{
      e.preventDefault(); e.stopPropagation();
      if(busy) return; busy=true;
      
      // Use anchored text if available
      const text = anchoredText || sel.toString().trim();
      if(!text){busy=false;return;}

      menu.querySelectorAll("button").forEach(x=>x.setAttribute("disabled","true"));
      b.classList.add("loading");

      if(label==="Save"){
        const entry={type:"Save",text,time:Date.now()};
        chrome.storage.local.get(["vaultEntries"],({vaultEntries=[]})=>{
          vaultEntries.push(entry);
          chrome.storage.local.set({vaultEntries});
        });
        toast("Saved to Memory Vault ✅");
      } else { await run(label,text); }

      b.classList.remove("loading");
      menu.querySelectorAll("button").forEach(x=>x.removeAttribute("disabled"));
      unlockSelection();
      busy=false;
    };
  });

  const mw=360,mh=60,p=8;
  let top=rect.bottom+10,left=rect.left+rect.width/2-mw/2;
  top=Math.max(p,Math.min(top,window.innerHeight-mh-p));
  left=Math.max(p,Math.min(left,window.innerWidth-mw-p));
  Object.assign(menu.style,{
    top:`${top+window.scrollY}px`,left:`${left+window.scrollX}px`,width:`${mw}px` 
  });

  root.appendChild(menu);
  menuEl = menu;
}

// === Selection Listener ===
document.addEventListener("mouseup",e=>{
  if(busy) return;
  if((e.target as HTMLElement)?.closest(".menu")) return;
  const sel = window.getSelection(); const text = sel?.toString().trim();
  if(!text || text.length < 3){ 
    unlockSelection();
    if(menuEl) menuEl.remove(); 
    return; 
  }
  createMenu(sel!);
});
