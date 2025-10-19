// Chrome Built-in AI API Type Definitions
interface Window {
  ai?: AI;
}

interface AI {
  summarizer?: {
    capabilities(): Promise<SummarizerCapabilities>;
    create(options?: SummarizerOptions): Promise<Summarizer>;
  };
  languageModel?: {
    capabilities(): Promise<LanguageModelCapabilities>;
    create(options?: LanguageModelOptions): Promise<LanguageModel>;
  };
  rewriter?: {
    capabilities(): Promise<RewriterCapabilities>;
    create(options?: RewriterOptions): Promise<Rewriter>;
  };
  translator?: {
    capabilities(): Promise<TranslatorCapabilities>;
    create(options?: TranslatorOptions): Promise<Translator>;
  };
}

// Proofreader API (window.Proofreader)
declare global {
  interface Window {
    Proofreader?: {
      capabilities(): Promise<ProofreaderCapabilities>;
      create(options?: ProofreaderOptions): Promise<Proofreader>;
    };
  }
}

interface ProofreaderCapabilities {
  available: 'readily' | 'after-download' | 'no';
}

interface ProofreaderOptions {
  outputLanguage?: string;
}

interface Proofreader {
  proofread(text: string): Promise<string>;
  destroy(): void;
}

interface SummarizerCapabilities {
  available: 'readily' | 'after-download' | 'no';
}

interface SummarizerOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

interface Summarizer {
  summarize(text: string): Promise<string>;
  destroy(): void;
}

interface LanguageModelCapabilities {
  available: 'readily' | 'after-download' | 'no';
  defaultTemperature?: number;
  defaultTopK?: number;
  maxTopK?: number;
}

interface LanguageModelOptions {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
}

interface LanguageModel {
  prompt(text: string): Promise<string>;
  promptStreaming(text: string): ReadableStream;
  destroy(): void;
}

interface RewriterCapabilities {
  available: 'readily' | 'after-download' | 'no';
}

interface RewriterOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  format?: 'as-is' | 'plain-text' | 'markdown';
  length?: 'as-is' | 'shorter' | 'longer';
}

interface Rewriter {
  rewrite(text: string): Promise<string>;
  destroy(): void;
}

interface TranslatorCapabilities {
  available: 'readily' | 'after-download' | 'no';
  languagePairAvailable(sourceLanguage: string, targetLanguage: string): Promise<'readily' | 'after-download' | 'no'>;
}

interface TranslatorOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

interface Translator {
  translate(text: string): Promise<string>;
  destroy(): void;
}

export {};
