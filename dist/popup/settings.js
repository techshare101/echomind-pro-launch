// EchoMind Pro - Settings Page
// Handles Universal BYOK (Bring Your Own Key) functionality

// Detect AI provider from key prefix
function detectProvider(apiKey) {
  if (!apiKey) return 'none';
  if (apiKey.startsWith('sk-or-')) return 'OpenRouter';
  if (apiKey.startsWith('sk-ant-')) return 'Anthropic (Claude)';
  // ✅ Check Gemini BEFORE Mistral (Gemini keys start with AIza)
  if (apiKey.startsWith('AIza')) return 'Google Gemini';
  // ✅ Mistral: old format (mistral-xxx) + new format (32-40 alphanumeric, no prefix)
  if (apiKey.startsWith('mistral-')) return 'Mistral AI';
  if (/^[A-Za-z0-9]{32,40}$/.test(apiKey)) return 'Mistral AI (New Format)';
  if (apiKey.startsWith('sk-')) return 'OpenAI';
  return 'Unknown';
}

// Update provider detection display
function updateProviderDetection() {
  const keyInput = document.getElementById('openai-key');
  const detectionDiv = document.getElementById('providerDetection');
  const provider = detectProvider(keyInput.value.trim());
  
  if (provider === 'none') {
    detectionDiv.textContent = '';
  } else if (provider === 'Unknown') {
    detectionDiv.textContent = '⚠️ Unknown key format';
    detectionDiv.style.color = '#f87171';
  } else {
    detectionDiv.textContent = `✅ Detected: ${provider}`;
    detectionDiv.style.color = '#5EEAD4';
  }
}

// Enhanced provider detection with color feedback
function enhancedProviderDetection() {
  const keyInput = document.getElementById('openai-key');
  const providerText = document.getElementById('provider-detect');
  const key = keyInput.value.trim();
  
  let provider = 'unknown';
  let color = '#9ca3af';
  
  if (key.startsWith('sk-or-')) {
    provider = '✅ Detected: OpenRouter';
    color = '#38bdf8';
  } else if (key.startsWith('sk-ant-')) {
    provider = '✅ Detected: Claude (Anthropic)';
    color = '#fbbf24';
  } else if (key.startsWith('AIza')) {
    // ✅ Check Gemini BEFORE Mistral
    provider = '✅ Detected: Google Gemini';
    color = '#a78bfa';
  } else if (key.startsWith('mistral-')) {
    provider = '✅ Detected: Mistral AI';
    color = '#34d399';
  } else if (/^[A-Za-z0-9]{32,40}$/.test(key)) {
    // ✅ New Mistral format (32-40 alphanumeric, no prefix)
    provider = '✅ Detected: Mistral AI (New Format)';
    color = '#f97316';
  } else if (key.startsWith('sk-')) {
    provider = '✅ Detected: OpenAI';
    color = '#60a5fa';
  } else if (key.length > 5) {
    provider = '⚠️ Unknown format — check key.';
    color = '#f87171';
  } else {
    provider = 'Waiting for key input...';
    color = '#9ca3af';
  }
  
  providerText.textContent = provider;
  providerText.style.color = color;
  
  // Also update the old detection div for compatibility
  updateProviderDetection();
}

// Load existing settings on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const result = await chrome.storage.local.get(['openaiKey', 'enableCloud', 'showDebug', 'compactHUD']);
    
    if (result.openaiKey) {
      document.getElementById('openai-key').value = result.openaiKey;
      enhancedProviderDetection();
    }
    
    // Load debug settings
    document.getElementById('show-debug').checked = result.showDebug ?? false;
    document.getElementById('compact-hud').checked = result.compactHUD ?? false;
    
    document.getElementById('enable-cloud').checked = result.enableCloud || false;
    
    // Add input listener for real-time provider detection
    document.getElementById('openai-key').addEventListener('input', enhancedProviderDetection);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
});

// Toggle key visibility
document.getElementById('toggleKeyVisibility').addEventListener('click', () => {
  const keyInput = document.getElementById('openai-key');
  const toggleBtn = document.getElementById('toggleKeyVisibility');
  
  if (keyInput.type === 'password') {
    keyInput.type = 'text';
    toggleBtn.textContent = 'Hide';
  } else {
    keyInput.type = 'password';
    toggleBtn.textContent = 'Show';
  }
});

// Save settings
document.getElementById('saveSettings').addEventListener('click', async () => {
  const key = document.getElementById('openai-key').value.trim();
  const enableCloud = document.getElementById('enable-cloud').checked;
  const showDebug = document.getElementById('show-debug').checked;
  const compactHUD = document.getElementById('compact-hud').checked;
  const statusMessage = document.getElementById('statusMessage');

  try {
    // Validate API key format (check if recognized)
    const provider = detectProvider(key);
    if (key && provider === 'Unknown') {
      statusMessage.textContent = '⚠️ Unrecognized API key format. Please check your key.';
      statusMessage.className = 'status-message error';
      return;
    }

    // Save to chrome.storage.local with provider info and debug settings
    await chrome.storage.local.set({
      openaiKey: key,
      enableCloud: enableCloud,
      providerDisplay: provider !== 'none' ? provider : null,
      showDebug: showDebug,
      compactHUD: compactHUD
    });

    // Show success message
    statusMessage.textContent = '✅ Settings saved successfully!';
    statusMessage.className = 'status-message success';

    // Redirect to dashboard after 1 second
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    console.error('Error saving settings:', error);
    statusMessage.textContent = '❌ Error saving settings. Please try again.';
    statusMessage.className = 'status-message error';
  }
});

// Back to dashboard
document.getElementById('backToDashboard').addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Enable cloud toggle warning
document.getElementById('enable-cloud').addEventListener('change', (e) => {
  const keyInput = document.getElementById('openai-key');
  
  if (e.target.checked && !keyInput.value.trim()) {
    alert('⚠️ Please enter your API key before enabling cloud mode.');
    e.target.checked = false;
  }
});

// Test Connection functionality (using CORS-safe Firebase proxy)
document.getElementById('test-key').addEventListener('click', async () => {
  const key = document.getElementById('openai-key').value.trim();
  const result = document.getElementById('test-result');
  
  if (!key) {
    result.textContent = '⚠️ Please enter an API key first.';
    result.style.color = '#f87171';
    result.classList.remove('success');
    return;
  }
  
  result.textContent = '⏳ Testing connection...';
  result.style.color = '#9ca3af';
  result.classList.remove('success');
  
  try {
    // ✅ Gemini standalone validation (direct call)
    if (key.startsWith('AIza')) {
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
      
      const startTime = Date.now();
      const res = await fetch(geminiEndpoint);
      const latency = Date.now() - startTime;
      
      if (res.ok) {
        const data = await res.json();
        const modelCount = data.models?.length || 0;
        result.textContent = `✅ Gemini key validated successfully (${latency}ms) — ${modelCount} models available`;
        result.style.color = '#4ade80';
        result.classList.add('success');
        
        await chrome.storage.local.set({ 
          providerName: 'gemini',
          providerDisplay: 'Gemini'
        });
        
        console.log(`✅ Provider saved: Gemini`);
      } else {
        result.textContent = `❌ Gemini validation failed (${res.status})`;
        result.style.color = '#f87171';
        result.classList.remove('success');
      }
      return;
    }
    
    // ✅ Use Firebase Cloud Function proxy for other providers (CORS-safe)
    const endpoint = 'https://us-central1-echomind-pro-launch.cloudfunctions.net/validateKey';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    
    const data = await res.json();
    
    if (data.ok) {
      // Show success with latency and model count
      const latencyText = data.latency ? ` (${data.latency}ms)` : '';
      const modelText = data.modelCount ? ` — ${data.modelCount} models available` : '';
      result.textContent = `✅ ${data.provider} key validated successfully${latencyText}${modelText}`;
      result.style.color = '#4ade80';
      result.classList.add('success');
      
      // Save provider name to storage for dashboard display
      await chrome.storage.local.set({ 
        providerName: data.provider.toLowerCase(),
        providerDisplay: data.provider
      });
      
      console.log(`✅ Provider saved: ${data.provider}`);
    } else {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      result.textContent = `❌ Connection failed (${res.status}). Please verify your key.`;
      result.style.color = '#f87171';
      result.classList.remove('success');
    }
  } catch (err) {
    console.error('Test connection error:', err);
    result.textContent = '❌ Network error. Check your connection and try again.';
    result.style.color = '#f87171';
    result.classList.remove('success');
  }
});
