/**
 * Chrome Built-in AI Rewriter with Hybrid Fallback
 * Transforms text tone and format locally
 */

/// <reference path="../types/chrome-ai.d.ts" />

import { localTextSimplify } from './aiFallback';

export async function checkRewriterAvailability(): Promise<boolean> {
  // @ts-expect-error - Chrome AI types
  if (!window.ai?.rewriter) {
    console.warn('Chrome AI Rewriter not available');
    return false;
  }

  // @ts-expect-error - Chrome AI types
  const capabilities = await window.ai.rewriter.capabilities();
  return capabilities.available !== 'no';
}

export async function rewriteText(
  text: string,
  options?: {
    tone?: 'as-is' | 'more-formal' | 'more-casual';
    length?: 'as-is' | 'shorter' | 'longer';
  }
): Promise<string> {
  // Try Chrome Built-in AI first
  // @ts-expect-error - Chrome AI types
  if (window.ai?.rewriter) {
    try {
      // @ts-expect-error - Chrome AI types
      const capabilities = await window.ai.rewriter.capabilities();
      
      if (capabilities.available === 'readily') {
        // @ts-expect-error - Chrome AI types
        const rewriter = await window.ai.rewriter.create({
          tone: options?.tone || 'more-casual',
          format: 'plain-text',
          length: options?.length || 'shorter',
        });

        const rewritten = await rewriter.rewrite(text);
        rewriter.destroy();
        return rewritten;
      } else if (capabilities.available === 'after-download') {
        console.warn('⏳ Rewriter model is downloading...');
        // Fall through to fallback
      }
    } catch (error) {
      console.warn('Chrome Built-in AI rewriter failed:', error);
      // Fall through to fallback
    }
  }

  // Fallback: Local text processing
  console.info('Using local fallback rewriter');
  const simplified = localTextSimplify(text);
  return `📝 Simplified (local processing):\n\n${simplified}\n\n💡 For AI-powered rewriting, enable Chrome Built-in AI in chrome://flags/#rewriter-api-for-gemini-nano`;
}

export async function simplifyText(text: string): Promise<string> {
  return rewriteText(text, { tone: 'more-casual', length: 'shorter' });
}
