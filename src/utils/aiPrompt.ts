/**
 * Chrome Built-in AI Language Model (Prompt API)
 * Provides conversational AI for follow-up questions
 */

/// <reference path="../types/chrome-ai.d.ts" />

import { localTextExplain } from './aiFallback';

export async function checkPromptAvailability(): Promise<boolean> {
  // @ts-expect-error - Chrome AI types
  if (!window.ai?.languageModel) {
    console.warn('Chrome AI Language Model not available');
    return false;
  }

  // @ts-expect-error - Chrome AI types
  const capabilities = await window.ai.languageModel.capabilities();
  return capabilities.available !== 'no';
}

export async function askQuestion(
  context: string,
  question: string
): Promise<string> {
  try {
    // @ts-expect-error - Chrome AI types
    if (!window.ai?.languageModel) {
      throw new Error(
        '❌ Chrome AI Language Model not available. Please use Chrome Canary with AI flags enabled.'
      );
    }

    // @ts-expect-error - Chrome AI types
    const capabilities = await window.ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      throw new Error(
        '❌ Language model not available. Please enable chrome://flags/#prompt-api-for-gemini-nano'
      );
    }

    if (capabilities.available === 'after-download') {
      throw new Error(
        '⏳ Language model is downloading. Please wait a few minutes and try again.'
      );
    }

    // @ts-expect-error - Chrome AI types
    const model = await window.ai.languageModel.create({
      systemPrompt: 'You are a helpful AI assistant that explains concepts clearly and concisely. Focus on education and understanding.',
    });

    const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nProvide a clear, concise answer:`;
    const response = await model.prompt(prompt);
    
    model.destroy();

    return response;
  } catch (error: any) {
    console.error('Prompt failed:', error);
    
    if (error.message.includes('❌') || error.message.includes('⏳')) {
      throw error;
    }
    
    throw new Error('❌ Failed to generate explanation. Ensure Chrome AI is properly configured.');
  }
}

export async function explainSimply(text: string): Promise<string> {
  // Try Chrome Built-in AI first
  // @ts-expect-error - Chrome AI types
  if (window.ai?.languageModel) {
    try {
      // @ts-expect-error - Chrome AI types
      const capabilities = await window.ai.languageModel.capabilities();
      
      if (capabilities.available === 'readily') {
        // @ts-expect-error - Chrome AI types
        const session = await window.ai.languageModel.create({
          systemPrompt: 'You are a helpful teacher. Explain concepts in simple terms that a 5-year-old could understand.',
        });

        const prompt = `Explain this in simple terms:\n\n"${text}"`;
        const explanation = await session.prompt(prompt);
        
        session.destroy();
        return explanation;
      } else if (capabilities.available === 'after-download') {
        console.warn('⏳ Language model is downloading...');
        // Fall through to fallback
      }
    } catch (error) {
      console.warn('Chrome Built-in AI language model failed:', error);
      // Fall through to fallback
    }
  }

  // Fallback: Local text processing
  console.info('Using local fallback explainer');
  const explanation = localTextExplain(text);
  return `💡 ${explanation}\n\n✨ For AI-powered explanations, enable Chrome Built-in AI in chrome://flags/#prompt-api-for-gemini-nano`;
}

export async function provideExample(text: string): Promise<string> {
  return askQuestion(text, 'Provide a clear, practical example to illustrate this concept.');
}

export async function extractKeyPoints(text: string): Promise<string> {
  return askQuestion(text, 'Extract 5 key points from this text in bullet format.');
}
