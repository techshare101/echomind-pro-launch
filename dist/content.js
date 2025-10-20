function z(t){return(t.match(/[^.!?]+[.!?]+/g)||[t]).slice(0,3).join(" ").trim()||t.substring(0,200)+"..."}async function C(t,e){if("ai"in window)try{const o=await window.ai.summarizer.capabilities();if(o.available==="readily"){const r=await window.ai.summarizer.create({type:(e==null?void 0:e.type)||"tl;dr",format:"plain-text",length:(e==null?void 0:e.length)||"medium"}),s=await r.summarize(t);return r.destroy(),s}else o.available==="after-download"&&console.warn("⏳ Summarizer model is downloading...")}catch(o){console.warn("Chrome Built-in AI summarizer failed:",o)}return console.info("Using local fallback summarizer"),`📝 Summary (local processing):

${z(t)}

💡 For AI-powered summaries, enable Chrome Built-in AI in chrome://flags/#optimization-guide-on-device-model`}let d=null,u=null,m=!1,a=null,x="";console.log("🌟 EchoMind v0.2.9 Context Aura loaded");function k(t){const e=t.toString().trim();if(!e)return"";a&&a.remove(),a=document.createElement("div"),Object.assign(a.style,{position:"fixed",inset:"0",pointerEvents:"none",background:"transparent",zIndex:"2147483646"});const n=document.createElement("pre");return n.textContent=e,n.style.display="none",a.appendChild(n),document.body.appendChild(a),x=e,e}function v(){a==null||a.remove(),a=null,x=""}function A(t,e){const n=window.innerWidth/2,o=window.innerHeight/2,r=document.createElement("div");Object.assign(r.style,{position:"fixed",left:`${n}px`,top:`${o}px`,width:"20px",height:"20px",borderRadius:"50%",background:"rgba(16,185,129,0.6)",boxShadow:"0 0 20px rgba(16,185,129,0.9)",zIndex:"2147483647",transform:"translate(-50%, -50%) scale(1)",opacity:"1",pointerEvents:"none",transition:"transform 1s ease-out, opacity 1s ease-out"}),document.body.appendChild(r),requestAnimationFrame(()=>{r.style.transform="translate(-50%, -50%) scale(10)",r.style.opacity="0"}),setTimeout(()=>r.remove(),1e3)}function y(t){const e=document.createElement("div");e.className="echomind-toast",e.innerHTML=`<div class="title">✅ EchoMind</div><div>${t.slice(0,250)}</div>`,Object.assign(e.style,{position:"fixed",right:"20px",bottom:"20px",background:"rgba(20,20,25,.95)",color:"#f3f3f3",padding:"14px 18px",borderRadius:"10px",fontSize:"14px",zIndex:"2147483647",boxShadow:"0 6px 18px rgba(0,0,0,.45)"}),document.body.appendChild(e),setTimeout(()=>e.remove(),8e3)}async function S(t,e){let n="";try{const r={Summarize:`Summarize this:

`,Explain:`Explain clearly:

`,Simplify:`Simplify this:

`,Proofread:`Proofread and correct grammar:

`}[t]||"";n=await C(r+e)}catch{n="[AI unavailable]"}const o={type:t,text:n,time:Date.now()};chrome.storage.local.get(["vaultEntries"],({vaultEntries:r=[]})=>{r.push(o),chrome.storage.local.set({vaultEntries:r})}),y(`${t} Complete ✅
${n}`)}async function M(t,e){if(!e)return;if(t==="save"){const o={type:"Save",text:e,time:Date.now()};chrome.storage.local.get(["vaultEntries"],({vaultEntries:r=[]})=>{r.push(o),chrome.storage.local.set({vaultEntries:r})}),y("Saved to Memory Vault ✅");return}const n=t.charAt(0).toUpperCase()+t.slice(1);await S(n,e)}chrome.runtime.onMessage.addListener((t,e,n)=>(t.type==="ECHO_ACTION"&&(A(),M(t.action,t.text),n({received:!0})),!0));function I(){if(d)return d;const t=document.createElement("div");Object.assign(t.style,{position:"fixed",inset:"0",zIndex:"2147483647",pointerEvents:"none"}),document.documentElement.appendChild(t),d=t.attachShadow({mode:"open"});const e=document.createElement("style");return e.textContent=`
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
  `,d.appendChild(e),d}function $(t){const e=t.getRangeAt(0).getBoundingClientRect(),n=I();u&&u.remove(),k(t);const o=document.createElement("div");o.className="menu",["Summarize","Explain","Simplify","Proofread","Save"].forEach(h=>{const i=document.createElement("button");i.textContent=h,o.appendChild(i),i.onmousedown=c=>{c.preventDefault(),c.stopPropagation()},i.onclick=async c=>{if(c.preventDefault(),c.stopPropagation(),m)return;m=!0;const b=x||t.toString().trim();if(!b){m=!1;return}if(o.querySelectorAll("button").forEach(l=>l.setAttribute("disabled","true")),i.classList.add("loading"),h==="Save"){const l={type:"Save",text:b,time:Date.now()};chrome.storage.local.get(["vaultEntries"],({vaultEntries:w=[]})=>{w.push(l),chrome.storage.local.set({vaultEntries:w})}),y("Saved to Memory Vault ✅")}else await S(h,b);i.classList.remove("loading"),o.querySelectorAll("button").forEach(l=>l.removeAttribute("disabled")),v(),m=!1}});const s=360,E=60,p=8;let g=e.bottom+10,f=e.left+e.width/2-s/2;g=Math.max(p,Math.min(g,window.innerHeight-E-p)),f=Math.max(p,Math.min(f,window.innerWidth-s-p)),Object.assign(o.style,{top:`${g+window.scrollY}px`,left:`${f+window.scrollX}px`,width:`${s}px`}),n.appendChild(o),u=o}document.addEventListener("mouseup",t=>{var o;if(m||(o=t.target)!=null&&o.closest(".menu"))return;const e=window.getSelection(),n=e==null?void 0:e.toString().trim();if(!n||n.length<3){v(),u&&u.remove();return}$(e)});
