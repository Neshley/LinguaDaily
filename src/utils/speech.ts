// Web Speech API wrapper for pronunciation with voice matching, fallbacks, and speed control

export function speakWord(
  text: string,
  languageCode: string,
  rate: number = 0.9,
  fallbackCodes?: string[]
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      resolve();
      return;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      utterance.rate = Math.max(0.5, Math.min(1.5, rate));
      utterance.pitch = 1.0;

      const findVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        const targetCode = languageCode.toLowerCase().replace('_', '-');
        // 1. Exact match (e.g. zh-hk)
        const exactMatch = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetCode);
        if (exactMatch) return exactMatch;

        // 2. Prefix match (e.g. yue or zh)
        const prefix = targetCode.split('-')[0];
        const prefixMatch = voices.find((v) =>
          v.lang.toLowerCase().replace('_', '-').startsWith(prefix)
        );
        if (prefixMatch) return prefixMatch;

        // 3. Fallback codes
        if (fallbackCodes && fallbackCodes.length > 0) {
          for (const fb of fallbackCodes) {
            const fbClean = fb.toLowerCase().replace('_', '-');
            const fbMatch = voices.find(
              (v) =>
                v.lang.toLowerCase().replace('_', '-') === fbClean ||
                v.lang.toLowerCase().replace('_', '-').startsWith(fbClean.split('-')[0])
            );
            if (fbMatch) return fbMatch;
          }
        }

        return null;
      };

      const matchedVoice = findVoice();
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error or interrupted:', e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis exception:', err);
      resolve();
    }
  });
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export const playNativeSpeech = speakWord;

