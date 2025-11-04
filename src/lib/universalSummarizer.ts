// EchoMind Pro - Universal BYOK Summarizer
// Supports: OpenAI, Anthropic, Mistral, Gemini, OpenRouter

export interface SummarizerConfig {
  apiKey: string;
  enableCloud: boolean;
}

export type AIProvider = 'openrouter' | 'openai' | 'anthropic' | 'mistral' | 'gemini' | 'unknown';

/**
 * Detect AI provider from API key prefix
 */
export function detectProvider(apiKey: string): AIProvider {
  if (!apiKey) return 'unknown';
  
  if (apiKey.startsWith('sk-or-')) return 'openrouter';
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';
  // ✅ Check Gemini BEFORE Mistral (Gemini keys start with AIza)
  if (apiKey.startsWith('AIza')) return 'gemini';
  // ✅ Mistral: old format (mistral-xxx) + new format (32-40 alphanumeric, no prefix)
  if (apiKey.startsWith('mistral-')) return 'mistral';
  if (/^[A-Za-z0-9]{32,40}$/.test(apiKey)) return 'mistral';
  if (apiKey.startsWith('sk-')) return 'openai';
  
  return 'unknown';
}

/**
 * Extract summary from provider-specific response
 */
function extractSummary(provider: AIProvider, data: any): string {
  try {
    switch (provider) {
      case 'openrouter':
      case 'openai':
      case 'mistral':
        return data.choices?.[0]?.message?.content?.trim() || 'No summary available.';
      
      case 'anthropic':
        return data.content?.[0]?.text?.trim() || 'No summary available.';
      
      case 'gemini':
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No summary available.';
      
      default:
        return 'Unsupported provider response format.';
    }
  } catch (error) {
    console.error('Error extracting summary:', error);
    return 'Error parsing AI response.';
  }
}

/**
 * Simple local fallback (no API)
 */
function simpleLocalSummary(text: string): string {
  const maxLength = 200;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Universal Summarizer - Works with any AI provider
 */
export async function universalSummarize(text: string, config: SummarizerConfig): Promise<string> {
  // Fallback to local if cloud is disabled or no key
  if (!config.enableCloud || !config.apiKey) {
    return simpleLocalSummary(text);
  }

  const provider = detectProvider(config.apiKey);
  
  if (provider === 'unknown') {
    return 'Invalid API key format. Please check your settings.';
  }

  console.log(`🤖 Using ${provider} for summarization`);
  
  let endpoint: string;
  let headers: Record<string, string>;
  let body: any;

  // Route selection: OpenRouter for all non-OpenAI providers
  const useOpenRouter = provider === 'anthropic' || provider === 'mistral' || provider === 'gemini' || provider === 'openrouter';

  // Model mapping per provider
  const modelMap: Record<string, string> = {
    'openai': 'gpt-4o-mini',
    'openrouter': 'openai/gpt-4o-mini',
    'anthropic': 'anthropic/claude-3.5-sonnet',
    'mistral': 'mistralai/mistral-medium',
    'gemini': 'google/gemini-pro'
  };

  const model = modelMap[provider] || 'openai/gpt-4o-mini';

  // Configure request based on provider
  if (provider === 'openai') {
    // OpenAI can be called directly
    endpoint = 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    };
    body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates concise summaries.' },
        { role: 'user', content: `Summarize this text concisely:\n\n${text}` }
      ],
      max_tokens: 500
    };
  } else {
    // All other providers route through OpenRouter (unified endpoint)
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://echomind-pro-launch.vercel.app',
      'X-Title': 'EchoMind Pro',
      'Content-Type': 'application/json'
    };
    body = {
      model: model, // Provider-specific model format
      messages: [
        { role: 'system', content: 'You are a helpful assistant that creates concise summaries.' },
        { role: 'user', content: `Summarize this text concisely:\n\n${text}` }
      ],
      max_tokens: 500
    };
  }

  try {
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log(`📋 Headers:`, headers);
    console.log(`📦 Body:`, body);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      return `❌ ${provider} Error: ${response.status} - ${response.statusText}`;
    }

    const data = await response.json();
    console.log(`📥 Response data:`, data);
    
    const summary = extractSummary(provider, data);
    console.log(`✅ Extracted summary (${summary.length} chars):`, summary.substring(0, 100) + '...');
    
    return summary;

  } catch (error) {
    console.error(`❌ Error calling ${provider} API:`, error);
    return `❌ ${provider} Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Universal Explain - Same as summarize but with different prompt
 */
export async function universalExplain(text: string, config: SummarizerConfig): Promise<string> {
  // Fallback to local if cloud is disabled or no key
  if (!config.enableCloud || !config.apiKey) {
    return `This text is about: ${simpleLocalSummary(text)}`;
  }

  const provider = detectProvider(config.apiKey);
  
  if (provider === 'unknown') {
    return 'Invalid API key format. Please check your settings.';
  }

  let endpoint: string;
  let headers: Record<string, string>;
  let body: any;

  // 🧠 Model mapping per provider (same as summarize)
  const modelMap: Record<string, string> = {
    'openai': 'gpt-4o-mini',
    'openrouter': 'openai/gpt-4o-mini',
    'anthropic': 'anthropic/claude-3.5-sonnet',
    'mistral': 'mistralai/mistral-medium',
    'gemini': 'google/gemini-pro'
  };

  const model = modelMap[provider] || 'openai/gpt-4o-mini';

  // Configure request based on provider (same unified routing as summarize)
  // ✅ UNIFIED ROUTING: Route all non-OpenAI providers through OpenRouter
  if (provider === 'openai') {
    // OpenAI can be called directly
    endpoint = 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    };
    body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that explains complex topics in simple terms.' },
        { role: 'user', content: `Explain this text in simple terms:\n\n${text}` }
      ],
      max_tokens: 500
    };
  } else {
    // All other providers route through OpenRouter (unified endpoint)
    endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'HTTP-Referer': 'https://echomind-pro-launch.vercel.app',
      'X-Title': 'EchoMind Pro',
      'Content-Type': 'application/json'
    };
    body = {
      model: model, // Provider-specific model format
      messages: [
        { role: 'system', content: 'You are a helpful assistant that explains complex topics in simple terms.' },
        { role: 'user', content: `Explain this text in simple terms:\n\n${text}` }
      ],
      max_tokens: 500
    };
  }

  try {
    console.log(`🤖 Using ${provider} for explanation`);
    console.log(`📡 Endpoint: ${endpoint}`);
    console.log(`📋 Headers:`, headers);
    console.log(`📦 Body:`, body);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      return `❌ ${provider} Error: ${response.status} - ${response.statusText}`;
    }

    const data = await response.json();
    console.log(`📥 Response data:`, data);
    
    const explanation = extractSummary(provider, data);
    console.log(`✅ Extracted explanation (${explanation.length} chars):`, explanation.substring(0, 100) + '...');
    
    return explanation;

  } catch (error) {
    console.error(`❌ Error calling ${provider} API:`, error);
    return `❌ ${provider} Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
