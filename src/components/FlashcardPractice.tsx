import React, { useState, useEffect } from 'react';
import { aiApi } from '../services/aiApi';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  RotateCw,
  Bookmark,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  HelpCircle,
  Loader2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyGoalSettings, GeminiWordExplanation, LanguageMeta, VocabularyWord } from '../types';
import { speakWord } from '../utils/speech';
import { ToneVisualizer } from './ToneVisualizer';

interface FlashcardPracticeProps {
  words: VocabularyWord[];
  language: LanguageMeta;
  settings: DailyGoalSettings;
  onRateWord: (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  onToggleBookmark: (wordId: string) => void;
  onCompleteSession: () => void;
  onBackToDashboard: () => void;
}

export const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({
  words,
  language,
  settings,
  onRateWord,
  onToggleBookmark,
  onCompleteSession,
  onBackToDashboard,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showPhonetic, setShowPhonetic] = useState<boolean>(settings.showPhoneticByDefault);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<GeminiWordExplanation | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    setIsFlipped(false);
    setShowPhonetic(settings.showPhoneticByDefault);
    setAiExplanation(null);

    // Auto-play audio if configured
    if (settings.autoPlayAudio && currentWord) {
      handlePlayAudio(currentWord.word);
    }
  }, [currentIndex, currentWord]);

  const handlePlayAudio = async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    await speakWord(text, language.speechCode, settings.speechSpeed);
    setIsPlayingAudio(false);
  };

  const handleRate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentWord) return;
    onRateWord(currentWord.id, rating);

    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      onCompleteSession();
    }
  };

  const handleFetchAiDeepDive = async () => {
    if (!currentWord) return;
    setShowAiModal(true);
    if (aiExplanation) return; // already cached

    setIsAiLoading(true);
    try {
      const json = await aiApi.explainWord({
        word: currentWord.word,
        language: language.name,
        romanization: currentWord.phonetic,
        meaning: currentWord.meaning,
      });
      if (json.success && json.data) {
        setAiExplanation(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch AI explanation:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!currentWord || sessionCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Practice Session Complete!</h2>
        <p className="text-slate-600 mb-6 text-sm">
          You have reviewed {words.length} vocabulary {words.length === 1 ? 'word' : 'words'} in {language.name}.
          Spaced repetition will schedule your next review interval automatically.
        </p>
        <div className="flex justify-center gap-3">
          <button
            id="btn-restart-deck"
            onClick={() => {
              setCurrentIndex(0);
              setSessionCompleted(false);
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-medium transition-colors"
          >
            Review Again
          </button>
          <button
            id="btn-back-dashboard-done"
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / words.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <button
          id="btn-flashcard-back"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>

        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span>Card {currentIndex + 1} of {words.length}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="btn-toggle-bookmark"
            onClick={() => onToggleBookmark(currentWord.id)}
            className={`p-2 rounded-lg border transition-colors ${
              currentWord.isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
            }`}
            title="Bookmark this word"
          >
            <Bookmark className={`w-4 h-4 ${currentWord.isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
          <button
            id="btn-ai-deep-dive"
            onClick={handleFetchAiDeepDive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
            title="AI Mnemonic & Context Breakdown"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Deep Dive</span>
          </button>
        </div>
      </div>

      {/* The Flashcard */}
      <div
        id="flashcard-container"
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 min-h-[340px] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow cursor-pointer select-none"
      >
        {/* Card Header Info */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {currentWord.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium font-mono">
              {currentWord.level}
            </span>
            <span className="text-xs text-slate-400 italic">
              {currentWord.partOfSpeech}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-phonetic-hint"
              onClick={(e) => {
                e.stopPropagation();
                setShowPhonetic(!showPhonetic);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"
              title="Toggle reading hint"
            >
              {showPhonetic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="font-mono text-[11px]">{showPhonetic ? 'Hide' : 'Hint'}</span>
            </button>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <RotateCw className="w-3 h-3" /> Flip
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="py-6 text-center space-y-4">
          {/* Main Word Display */}
          <div className="space-y-2">
            <h3 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-serif">
              {currentWord.word}
            </h3>

            {/* Phonetic / Pinyin / Romaji reading */}
            <div className="min-h-[28px] flex items-center justify-center">
              {showPhonetic ? (
                <span className="text-base sm:text-lg font-medium text-indigo-600 font-mono tracking-wide">
                  {currentWord.phonetic}
                </span>
              ) : (
                <span className="text-xs text-slate-300 tracking-widest font-mono">••••••••</span>
              )}
            </div>
          </div>

          {/* Tone Breakdown (Chinese Special) */}
          {language.toneSupport && currentWord.toneBreakdown && (
            <div className="flex justify-center pt-1" onClick={(e) => e.stopPropagation()}>
              <ToneVisualizer tones={currentWord.toneBreakdown} />
            </div>
          )}

          {/* Audio Play Button */}
          <div className="pt-2">
            <button
              id="btn-play-card-audio"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAudio(currentWord.word);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>Pronounce ({settings.speechSpeed}x)</span>
            </button>
          </div>

          {/* Chinese Character Radical & Stroke Count Info */}
          {currentWord.characterDetail && (
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 max-w-md mx-auto border border-slate-100">
              <div className="flex items-center justify-center gap-4 text-[11px]">
                {currentWord.characterDetail.radicals && (
                  <span>
                    <strong className="text-slate-700">Radicals:</strong> {currentWord.characterDetail.radicals}
                  </span>
                )}
                {currentWord.characterDetail.strokeCount && (
                  <span>
                    <strong className="text-slate-700">Strokes:</strong> {currentWord.characterDetail.strokeCount}
                  </span>
                )}
              </div>
              {currentWord.characterDetail.literalBreakdown && (
                <p className="mt-1 text-slate-600 italic">{currentWord.characterDetail.literalBreakdown}</p>
              )}
            </div>
          )}

          {/* Back side content (Meaning & Example Sentence) */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="pt-4 border-t border-slate-100 space-y-3"
              >
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Definition</span>
                  <p className="text-xl font-bold text-slate-900">{currentWord.meaning}</p>
                </div>

                {/* Example Sentence */}
                {currentWord.exampleSentence && (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-slate-900">
                          {currentWord.exampleSentence.native}
                        </div>
                        {currentWord.exampleSentence.phonetic && (
                          <div className="text-xs text-indigo-700 font-mono">
                            {currentWord.exampleSentence.phonetic}
                          </div>
                        )}
                        <div className="text-xs text-slate-600">
                          {currentWord.exampleSentence.translation}
                        </div>
                      </div>
                      <button
                        id="btn-play-example-sentence"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(currentWord.exampleSentence.native);
                        }}
                        className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-700 transition-colors shrink-0"
                        title="Listen to sentence"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Memory Hook Tip */}
                {currentWord.memoryTip && (
                  <div className="text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-left flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{currentWord.memoryTip}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer instruction */}
        <div className="text-center border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-400">
            {isFlipped ? 'Rate your recall accuracy below' : 'Tap card or spacebar to reveal definition'}
          </p>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      <div className="mt-5">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <button
            id="btn-rate-again"
            onClick={() => handleRate('again')}
            className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all active:scale-95"
          >
            <span className="text-xs font-bold">Again</span>
            <span className="text-[10px] text-rose-500 font-mono mt-0.5">&lt; 1 day</span>
          </button>
          <button
            id="btn-rate-hard"
            onClick={() => handleRate('hard')}
            className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-all active:scale-95"
          >
            <span className="text-xs font-bold">Hard</span>
            <span className="text-[10px] text-amber-500 font-mono mt-0.5">1 day</span>
          </button>
          <button
            id="btn-rate-good"
            onClick={() => handleRate('good')}
            className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition-all active:scale-95"
          >
            <span className="text-xs font-bold">Good</span>
            <span className="text-[10px] text-indigo-500 font-mono mt-0.5">3 days</span>
          </button>
          <button
            id="btn-rate-easy"
            onClick={() => handleRate('easy')}
            className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all active:scale-95"
          >
            <span className="text-xs font-bold">Easy</span>
            <span className="text-[10px] text-emerald-500 font-mono mt-0.5">7 days</span>
          </button>
        </div>
      </div>

      {/* AI Deep Dive Modal / Drawer */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    AI Context &amp; Etymology: {currentWord.word}
                  </h3>
                </div>
                <button
                  id="btn-close-ai-modal"
                  onClick={() => setShowAiModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isAiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-xs text-slate-500">
                    Consulting linguistic database for memory hooks and conversational examples...
                  </p>
                </div>
              ) : aiExplanation ? (
                <div className="space-y-4 text-sm text-slate-700">
                  {/* Etymology / Mnemonic */}
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5">
                    <h4 className="font-semibold text-indigo-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Memory Hook &amp; Etymology
                    </h4>
                    <p className="text-xs leading-relaxed text-indigo-950">
                      {aiExplanation.etymologyOrMnemonic}
                    </p>
                  </div>

                  {/* Cultural Context */}
                  {aiExplanation.culturalContext && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                        Cultural Etiquette &amp; Usage
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {aiExplanation.culturalContext}
                      </p>
                    </div>
                  )}

                  {/* Pronunciation & Tone Tip */}
                  {aiExplanation.tonesOrPronunciationTip && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                      <h4 className="font-semibold text-amber-900 text-xs uppercase tracking-wider mb-1">
                        Pronunciation &amp; Pitch Guide
                      </h4>
                      <p className="text-xs leading-relaxed text-amber-950">
                        {aiExplanation.tonesOrPronunciationTip}
                      </p>
                    </div>
                  )}

                  {/* Generated Conversational Sentences */}
                  {aiExplanation.sentences && aiExplanation.sentences.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                        Real-World Sentences
                      </h4>
                      {aiExplanation.sentences.map((st, i) => (
                        <div key={i} className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900 text-sm">{st.native}</p>
                              {st.romanization && (
                                <p className="text-xs text-indigo-600 font-mono">{st.romanization}</p>
                              )}
                              <p className="text-xs text-slate-600">{st.translation}</p>
                            </div>
                            <button
                              onClick={() => handlePlayAudio(st.native)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 shrink-0"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Could not retrieve explanation at this time.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
