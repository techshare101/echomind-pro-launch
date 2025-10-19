/**
 * AI Fallback Helper
 * Provides graceful fallback when Chrome Built-in AI is unavailable
 */

/**
 * Check if Chrome Built-in AI is available
 */
export function isBuiltInAIAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('ai' in window || 'Summarizer' in window || 'Rewriter' in window || 'Proofreader' in window)
  );
}

/**
 * Simple local text processing fallback (no API calls)
 * This provides basic functionality when Built-in AI isn't available
 */
export function localTextSummary(text: string): string {
  // Extract first few sentences as summary
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const summary = sentences.slice(0, 3).join(' ').trim();
  return summary || text.substring(0, 200) + '...';
}

export function localTextSimplify(text: string): string {
  // Basic simplification: remove complex punctuation, shorten
  return text
    .replace(/[;:—]/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
}

export function localTextExplain(text: string): string {
  return `This text discusses: ${localTextSummary(text)}\n\nNote: Full AI explanation requires Chrome Built-in AI to be enabled.`;
}

export function localTextProofread(text: string): string {
  // Basic cleanup
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s([,.!?])/g, '$1')
    .trim();
}
