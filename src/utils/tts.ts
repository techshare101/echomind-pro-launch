/**
 * Text-to-Speech Utility
 * Provides voice reading for insights
 */

export interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function checkTTSAvailability(): boolean {
  return 'speechSynthesis' in window;
}

export function speak(text: string, options?: TTSOptions): void {
  if (!checkTTSAvailability()) {
    console.warn('Text-to-Speech not available in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set options
  utterance.lang = options?.lang || 'en-US';
  utterance.rate = options?.rate || 1.0;
  utterance.pitch = options?.pitch || 1.1;
  utterance.volume = options?.volume || 1.0;

  // Handle events
  utterance.onstart = () => {
    console.log('🔊 TTS started');
  };

  utterance.onend = () => {
    console.log('🔊 TTS finished');
  };

  utterance.onerror = (event) => {
    console.error('TTS error:', event);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (checkTTSAvailability()) {
    window.speechSynthesis.cancel();
  }
}

export function pauseSpeaking(): void {
  if (checkTTSAvailability()) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (checkTTSAvailability()) {
    window.speechSynthesis.resume();
  }
}

export function isSpeaking(): boolean {
  if (!checkTTSAvailability()) return false;
  return window.speechSynthesis.speaking;
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!checkTTSAvailability()) return [];
  return window.speechSynthesis.getVoices();
}

// Wait for voices to load
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}
