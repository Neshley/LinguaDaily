import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyGoalSettings, LanguageMeta, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';
import { ToneVisualizer } from './ToneVisualizer';

interface PronunciationDrillProps {
  words: VocabularyWord[];
  language: LanguageMeta;
  settings: DailyGoalSettings;
  onBackToDashboard: () => void;
  onWordMastered: (wordId: string) => void;
}

export const PronunciationDrill: React.FC<PronunciationDrillProps> = ({
  words,
  language,
  settings,
  onBackToDashboard,
  onWordMastered,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedTranscript, setRecognizedTranscript] = useState<string>('');
  const [matchResult, setMatchResult] = useState<'perfect' | 'close' | 'miss' | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const currentWord = words[currentIndex];

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  useEffect(() => {
    setRecognizedTranscript('');
    setMatchResult(null);
    setScorePercentage(null);
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
  }, [currentIndex]);

  const handlePlayReference = (rate = settings.speechSpeed) => {
    if (!currentWord) return;
    speakWord(currentWord.word, language.speechCode, rate);
  };

  const startVoiceRecognition = () => {
    if (!speechSupported || isListening || !currentWord) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    try {
      const recognition = new SpeechRec();
      recognition.lang = language.speechCode;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setRecognizedTranscript('');
        setMatchResult(null);
        setScorePercentage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        setRecognizedTranscript(transcript);
        evaluatePronunciation(transcript, currentWord);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech recognition failed to start:', e);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  const evaluatePronunciation = (userSpoken: string, target: VocabularyWord) => {
    const targetClean = target.word.trim().toLowerCase();
    const phoneticClean = target.phonetic.trim().toLowerCase();

    // Direct character or word match
    if (userSpoken === targetClean || userSpoken.includes(targetClean)) {
      setMatchResult('perfect');
      setScorePercentage(100);
      confetti({ particleCount: 40, spread: 50 });
      onWordMastered(target.id);
      return;
    }

    // Levenshtein similarity / partial match
    const distance = getLevenshteinDistance(userSpoken, targetClean);
    const maxLen = Math.max(userSpoken.length, targetClean.length);
    const similarity = maxLen === 0 ? 1 : 1 - distance / maxLen;
    const score = Math.round(similarity * 100);

    if (score >= 70 || userSpoken.includes(targetClean[0])) {
      setMatchResult('close');
      setScorePercentage(Math.max(score, 75));
    } else {
      setMatchResult('miss');
      setScorePercentage(Math.max(score, 35));
    }
  };

  // Simple string distance
  const getLevenshteinDistance = (a: string, b: string) => {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  if (!currentWord) {
    return (
      <div className="max-w-md mx-auto py-12 text-center text-slate-500">
        <p>No words available in this list.</p>
        <button
          onClick={onBackToDashboard}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          id="btn-pronounce-back"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">
            Word {currentIndex + 1} of {words.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              id="btn-pronounce-prev"
              onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 rounded bg-slate-100 disabled:opacity-30 hover:bg-slate-200 text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-pronounce-next"
              onClick={() => setCurrentIndex((p) => Math.min(words.length - 1, p + 1))}
              disabled={currentIndex === words.length - 1}
              className="p-1.5 rounded bg-slate-100 disabled:opacity-30 hover:bg-slate-200 text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Pronunciation Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-6">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
            {currentWord.category}
          </span>
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 font-serif mt-3 mb-2">
            {currentWord.word}
          </h2>
          <p className="text-xl font-medium text-indigo-600 font-mono">{currentWord.phonetic}</p>
          <p className="text-sm text-slate-500 mt-1">{currentWord.meaning}</p>
        </div>

        {/* Tone Breakdown if Chinese */}
        {language.toneSupport && currentWord.toneBreakdown && (
          <div className="flex justify-center pt-1">
            <ToneVisualizer tones={currentWord.toneBreakdown} />
          </div>
        )}

        {/* Listen Buttons */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            id="btn-listen-normal"
            onClick={() => handlePlayReference(1.0)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
          >
            <Volume2 className="w-4 h-4 text-slate-600" />
            <span>Normal Speed (1.0x)</span>
          </button>
          <button
            id="btn-listen-slow"
            onClick={() => handlePlayReference(0.7)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
          >
            <Volume2 className="w-4 h-4 text-indigo-600" />
            <span>Slow Guide (0.7x)</span>
          </button>
        </div>

        {/* Speech Recognition Mic Interaction */}
        <div className="border-t border-slate-100 pt-6">
          <div className="max-w-sm mx-auto space-y-4">
            <div className="flex justify-center">
              <button
                id="btn-toggle-mic"
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={!speechSupported}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                } ${!speechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isListening ? 'Click to stop listening' : 'Click to start speaking'}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700">
                {isListening ? 'Listening... Speak clearly into your microphone' : 'Tap microphone & speak the word'}
              </p>
              {!speechSupported && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Speech recognition requires a Chromium browser (Chrome, Edge) or microphone permissions.
                </p>
              )}
            </div>

            {/* Recognized Feedback View */}
            {recognizedTranscript && (
              <div
                className={`p-4 rounded-xl border text-sm text-left transition-all ${
                  matchResult === 'perfect'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : matchResult === 'close'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs uppercase tracking-wide flex items-center gap-1">
                    {matchResult === 'perfect' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Native Accuracy
                      </>
                    ) : matchResult === 'close' ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-600" /> Great Effort!
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-500" /> Detected Speech
                      </>
                    )}
                  </span>
                  {scorePercentage !== null && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/70">
                      {scorePercentage}%
                    </span>
                  )}
                </div>
                <p className="text-base font-medium">You said: &ldquo;{recognizedTranscript}&rdquo;</p>
                {matchResult !== 'perfect' && (
                  <p className="text-xs text-slate-600 mt-1">
                    Target: <strong>{currentWord.word}</strong> ({currentWord.phonetic}). Try playing the slow guide above!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
