/**
 * Chrome Built-in AI Summarizer with Hybrid Fallback
 * Uses on-device Gemini Nano model for text summarization
 */

/// <reference path="../types/chrome-ai.d.ts" />

import { isBuiltInAIAvailable, localTextSummary } from './aiFallback';

export async function checkSummarizerAvailability(): Promise<boolean> {
  if (!('ai' in window)) {
    console.warn('Chrome AI not available');
    return false;
  }

  try {
    // @ts-expect-error - Chrome AI types
    const capabilities = await window.ai.summarizer.capabilities();
    return capabilities.available !== 'no';
  } catch (error) {
    console.error('Error checking summarizer availability:', error);
    return false;
  }
}

export async function summarizeText(
  text: string,
  options?: {
    type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
    length?: 'short' | 'medium' | 'long';
  }
): Promise<string> {
  // Try Chrome Built-in AI first
  if ('ai' in window) {
    try {
      // @ts-expect-error - Chrome AI types
      const capabilities = await window.ai.summarizer.capabilities();
      
      if (capabilities.available === 'readily') {
        // @ts-expect-error - Chrome AI types
        const summarizer = await window.ai.summarizer.create({
          type: options?.type || 'tl;dr',
          format: 'plain-text',
          length: options?.length || 'medium',
        });

        const summary = await summarizer.summarize(text);
        summarizer.destroy();
        return summary;
      } else if (capabilities.available === 'after-download') {
        console.warn('⏳ Summarizer model is downloading...');
        // Fall through to fallback
      }
    } catch (error) {
      console.warn('Chrome Built-in AI summarizer failed:', error);
      // Fall through to fallback
    }
  }

  // Fallback: Local text processing
  console.info('Using local fallback summarizer');
  const summary = localTextSummary(text);
  return `📝 Summary (local processing):\n\n${summary}\n\n💡 For AI-powered summaries, enable Chrome Built-in AI in chrome://flags/#optimization-guide-on-device-model`;
}
