import fetch from "node-fetch";
import { onRequest } from "firebase-functions/v2/https";

/**
 * EchoMind Universal Key Validator (Forge Proxy)
 * Validates API keys for OpenAI, OpenRouter, Claude, Mistral, Gemini
 * Returns validation status + latency + model count
 */
export const validateKey = onRequest(async (req, res) => {
  // CORS headers
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ 
        ok: false, 
        reason: "Missing API key" 
      });
    }

    let provider = "Unknown";
    let endpoint = "";
    let headers = {};

    // --- Detect provider from key format ---
    if (apiKey.startsWith("sk-or-")) {
      provider = "OpenRouter";
      endpoint = "https://openrouter.ai/api/v1/models";
      headers = {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://echomind-pro-launch.vercel.app/",
        "X-Title": "EchoMind Pro"
      };
    } else if (apiKey.startsWith("sk-ant-")) {
      provider = "Claude";
      endpoint = "https://api.anthropic.com/v1/models";
      headers = { 
        "x-api-key": apiKey, 
        "anthropic-version": "2023-06-01" 
      };
    } else if (/^(mistral-[A-Za-z0-9]{16,}|[A-Za-z0-9]{32,40})$/.test(apiKey)) {
      provider = "Mistral";
      endpoint = "https://api.mistral.ai/v1/models";
      headers = { 
        "Authorization": `Bearer ${apiKey}` 
      };
    } else if (apiKey.startsWith("sk-")) {
      provider = "OpenAI";
      endpoint = "https://api.openai.com/v1/models";
      headers = { 
        "Authorization": `Bearer ${apiKey}` 
      };
    } else if (apiKey.startsWith("AIza")) {
      provider = "Gemini";
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      headers = {};
    }

    if (provider === "Unknown") {
      return res.status(400).json({ 
        ok: false, 
        reason: "Unrecognized key format" 
      });
    }

    // --- Perform validation ping with latency tracking ---
    const startTime = Date.now();
    const response = await fetch(endpoint, { 
      method: "GET",
      headers 
    });
    const latency = Date.now() - startTime;

    const valid = response.ok;
    const status = response.status;

    // --- Try to get model count ---
    let modelCount = 0;
    if (valid) {
      try {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          modelCount = data.data.length;
        } else if (data.models && Array.isArray(data.models)) {
          modelCount = data.models.length;
        }
      } catch (err) {
        console.warn("Could not parse model list:", err);
      }
    }

    // --- Return validation result ---
    res.json({
      ok: valid,
      status,
      provider,
      endpoint,
      latency,
      modelCount,
      reason: valid 
        ? `Key validated successfully` 
        : `Error ${status} - ${response.statusText}`
    });

  } catch (err) {
    console.error("Validation error:", err);
    res.status(500).json({ 
      ok: false, 
      reason: "Server error - unable to validate key" 
    });
  }
});
