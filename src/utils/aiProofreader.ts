/**
 * Chrome Built-in AI Proofreader with Hybrid Fallback
 * Provides on-device text proofreading using Gemini Nano
 */

/// <reference path="../types/chrome-ai.d.ts" />

import { localTextProofread } from './aiFallback';

export async function checkProofreaderAvailability(): Promise<boolean> {
  if (!('Proofreader' in window)) {
    console.warn('Chrome AI Proofreader not available');
    return false;
  }

  try {
    // @ts-expect-error - Chrome AI types
    const capabilities = await window.Proofreader.capabilities();
    return capabilities.available !== 'no';
  } catch (error) {
    console.error('Error checking Proofreader availability:', error);
    return false;
  }
}

export async function proofreadText(text: string, lang = 'en'): Promise<string> {
  // Try Chrome Built-in AI first
  if ('Proofreader' in window) {
    try {
      // @ts-expect-error - Chrome AI types
      const capabilities = await window.Proofreader.capabilities();
      
      if (capabilities.available === 'readily') {
        // @ts-expect-error - Chrome AI types
        const proofreader = await window.Proofreader.create({ outputLanguage: lang });
        const proofreadResult = await proofreader.proofread(text);
        proofreader.destroy();
        return proofreadResult;
      } else if (capabilities.available === 'after-download') {
        console.warn('⏳ Proofreader model is downloading...');
        // Fall through to fallback
      }
    } catch (error) {
      console.warn('Chrome Built-in AI proofreader failed:', error);
      // Fall through to fallback
    }
  }

  // Fallback: Local text processing
  console.info('Using local fallback proofreader');
  const proofread = localTextProofread(text);
  return `✓ Proofread (local processing):\n\n${proofread}\n\n💡 For AI-powered proofreading, enable Chrome Built-in AI in chrome://flags/#optimization-guide-on-device-model`;
}
