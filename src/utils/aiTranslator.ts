/**
 * Chrome Built-in AI Translator
 * Provides local language translation
 */

/// <reference path="../types/chrome-ai.d.ts" />

export async function checkTranslatorAvailability(): Promise<boolean> {
  // @ts-expect-error - Chrome AI types
  if (!window.ai?.translator) {
    console.warn('Chrome AI Translator not available');
    return false;
  }

  // @ts-expect-error - Chrome AI types
  const capabilities = await window.ai.translator.capabilities();
  return capabilities.available !== 'no';
}

export async function checkLanguagePairAvailability(
  sourceLanguage: string,
  targetLanguage: string
): Promise<'readily' | 'after-download' | 'no'> {
  // @ts-expect-error - Chrome AI types
  if (!window.ai?.translator) {
    return 'no';
  }

  // @ts-expect-error - Chrome AI types
  const capabilities = await window.ai.translator.capabilities();
  return await capabilities.languagePairAvailable(sourceLanguage, targetLanguage);
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'en'
): Promise<string> {
  try {
    // @ts-expect-error - Chrome AI types
    if (!window.ai?.translator) {
      throw new Error(
        '❌ Chrome AI Translator not available. Please use Chrome Canary with AI flags enabled.'
      );
    }

    // Check if language pair is available
    const availability = await checkLanguagePairAvailability(sourceLanguage, targetLanguage);
    
    if (availability === 'no') {
      throw new Error(
        `❌ Translation from ${sourceLanguage} to ${targetLanguage} is not supported.`
      );
    }

    if (availability === 'after-download') {
      throw new Error(
        `⏳ Translation model for ${sourceLanguage} → ${targetLanguage} is downloading. Please wait.`
      );
    }

    // @ts-expect-error - Chrome AI types
    const translator = await window.ai.translator.create({
      sourceLanguage,
      targetLanguage,
    });

    const translated = await translator.translate(text);
    translator.destroy();

    return translated;
  } catch (error: any) {
    console.error('Translation failed:', error);
    
    if (error.message.includes('❌') || error.message.includes('⏳')) {
      throw error;
    }
    
    throw new Error('❌ Translation failed. Ensure Chrome AI is properly configured.');
  }
}

// Common language pairs
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  ar: 'Arabic',
  hi: 'Hindi',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export async function translateToMultipleLanguages(
  text: string,
  targetLanguages: LanguageCode[],
  sourceLanguage: string = 'en'
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (const targetLang of targetLanguages) {
    try {
      results[targetLang] = await translateText(text, targetLang, sourceLanguage);
    } catch (error) {
      results[targetLang] = `Translation failed: ${error}`;
    }
  }

  return results;
}
