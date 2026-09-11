import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Mic,
  Brain,
  Music,
  ChevronLeft,
} from 'lucide-react';
import {
  DailyGoalSettings,
  LanguageMeta,
  LanguageVariant,
  MainNavigationTab,
  VocabularyWord,
} from '../types';
import { FlashcardPractice } from '../components/FlashcardPractice';
import { QuizPractice } from '../components/QuizPractice';
import { PronunciationDrill } from '../components/PronunciationDrill';
import { AiSentenceStudio } from '../components/AiSentenceStudio';
import { ToneVisualizer } from '../components/ToneVisualizer';

type PracticeSubMode = 'hub' | 'flashcards' | 'quiz' | 'pronounce' | 'tones' | 'ai-studio';

interface PracticeViewProps {
  activeVariant: LanguageVariant;
  languageMeta: LanguageMeta;
  words: VocabularyWord[];
  settings: DailyGoalSettings;
  onRateWord: (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  onToggleBookmark: (wordId: string) => void;
  onCompleteSession: () => void;
  onCompleteQuiz: (score: number, total: number) => void;
  onWordMastered: (wordId: string) => void;
  onNavigate: (tab: MainNavigationTab) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  activeVariant,
  languageMeta,
  words,
  settings,
  onRateWord,
  onToggleBookmark,
  onCompleteSession,
  onCompleteQuiz,
  onWordMastered,
  onNavigate,
}) => {
  const [activeSubMode, setActiveSubMode] = useState<PracticeSubMode>('hub');

  // If inside an active practice session, render that session with a back-to-hub header
  if (activeSubMode === 'flashcards') {
    return (
      <div className="space-y-4 pb-20 md:pb-8">
        <button
          onClick={() => setActiveSubMode('hub')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Practice Hub</span>
        </button>
        <FlashcardPractice
          words={words}
          language={languageMeta}
          settings={settings}
          onRateWord={onRateWord}
          onToggleBookmark={onToggleBookmark}
          onCompleteSession={() => {
            onCompleteSession();
            setActiveSubMode('hub');
          }}
          onBackToDashboard={() => setActiveSubMode('hub')}
        />
      </div>
    );
  }

  if (activeSubMode === 'quiz') {
    return (
      <div className="space-y-4 pb-20 md:pb-8">
        <button
          onClick={() => setActiveSubMode('hub')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Practice Hub</span>
        </button>
        <QuizPractice
          words={words}
          language={languageMeta}
          onCompleteQuiz={(score, total) => {
            onCompleteQuiz(score, total);
            setActiveSubMode('hub');
          }}
          onBackToDashboard={() => setActiveSubMode('hub')}
        />
      </div>
    );
  }

  if (activeSubMode === 'pronounce') {
    return (
      <div className="space-y-4 pb-20 md:pb-8">
        <button
          onClick={() => setActiveSubMode('hub')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Practice Hub</span>
        </button>
        <PronunciationDrill
          words={words}
          language={languageMeta}
          settings={settings}
          onBackToDashboard={() => setActiveSubMode('hub')}
          onWordMastered={onWordMastered}
        />
      </div>
    );
  }

  if (activeSubMode === 'tones') {
    return (
      <div className="space-y-4 pb-20 md:pb-8">
        <button
          onClick={() => setActiveSubMode('hub')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Practice Hub</span>
        </button>
        <ToneVisualizer languageId={activeVariant.id} speechSpeed={settings.speechSpeed} />
      </div>
    );
  }

  if (activeSubMode === 'ai-studio') {
    return (
      <div className="space-y-4 pb-20 md:pb-8">
        <button
          onClick={() => setActiveSubMode('hub')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Practice Hub</span>
        </button>
        <AiSentenceStudio
          words={words}
          language={languageMeta}
          onBackToDashboard={() => setActiveSubMode('hub')}
        />
      </div>
    );
  }

  // Unified Practice Hub Landing
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Hub Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Practice Hub — {activeVariant.name}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Target different skills with specialized interactive practice modalities.
        </p>
      </div>

      {/* Practice Modalities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Flashcards */}
        <div
          onClick={() => setActiveSubMode('flashcards')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Spaced Flashcards
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Leitner-based SRS cards. Flip to reveal translations, native audio, and memory mnemonics.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Start Flashcard Deck →
          </span>
        </div>

        {/* Recall Quiz */}
        <div
          onClick={() => setActiveSubMode('quiz')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Recall Quiz
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Rapid multiple-choice testing. Match characters, meanings, and pronunciations under live scoring.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Take Quick Quiz →
          </span>
        </div>

        {/* Pronunciation Drill */}
        <div
          onClick={() => setActiveSubMode('pronounce')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Speech & Accent Drill
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Speak aloud into your microphone. Receive real-time speech recognition matching and tone feedback.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Practice Speaking →
          </span>
        </div>

        {/* Tone Contour Visualizer (if supports tones) */}
        {activeVariant.capabilities.supportsTones && (
          <div
            onClick={() => setActiveSubMode('tones')}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Tone Contours & Sandhi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Acoustic pitch curves for authentic tonal distinction and sandhi modification rules.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Inspect Pitch Charts →
            </span>
          </div>
        )}

        {/* AI Sentence Studio */}
        <div
          onClick={() => setActiveSubMode('ai-studio')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all cursor-pointer shadow-xs group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              AI Sentence Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Compose custom sentences with target vocabulary. Gemini evaluates syntax, naturalness, and nuance.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Open AI Studio →
          </span>
        </div>
      </div>
    </div>
  );
};
