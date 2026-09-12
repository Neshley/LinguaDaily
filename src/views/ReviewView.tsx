import React, { useState } from 'react';
import {
  RotateCw,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';
import {
  DailyGoalSettings,
  LanguageMeta,
  LanguageVariant,
  MainNavigationTab,
  VocabularyWord,
} from '../types';
import { FlashcardPractice } from '../components/FlashcardPractice';

interface ReviewViewProps {
  activeVariant: LanguageVariant;
  languageMeta: LanguageMeta;
  words: VocabularyWord[];
  settings: DailyGoalSettings;
  onRateWord: (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  onToggleBookmark: (wordId: string) => void;
  onCompleteSession: () => void;
  onNavigate: (tab: MainNavigationTab) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  activeVariant,
  languageMeta,
  words,
  settings,
  onRateWord,
  onToggleBookmark,
  onCompleteSession,
}) => {
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  // Group words into SRS buckets
  const newWords = words.filter((w) => w.status === 'new');
  const learningWords = words.filter((w) => w.status === 'learning');
  const reviewWords = words.filter((w) => w.status === 'review');
  const masteredWords = words.filter((w) => w.status === 'mastered');

  // Only include learning/review cards whose scheduled review time has arrived.
  // New cards are introduced in small batches.
  const now = Date.now();
  const scheduledDue = [...reviewWords, ...learningWords].filter((w) =>
    !w.nextReviewDate || new Date(w.nextReviewDate).getTime() <= now
  );
  const dueQueue = [...scheduledDue, ...newWords.slice(0, 5)];

  if (isSessionActive) {
    return (
      <div className="space-y-4 pb-20 md:pb-8">
        <FlashcardPractice
          words={dueQueue.length > 0 ? dueQueue : words}
          language={languageMeta}
          settings={settings}
          onRateWord={onRateWord}
          onToggleBookmark={onToggleBookmark}
          onCompleteSession={() => {
            onCompleteSession();
            setIsSessionActive(false);
          }}
          onBackToDashboard={() => setIsSessionActive(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Review Center Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Spaced Repetition System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            SRS Review Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scheduled reviews that bring vocabulary back at practical intervals based on your recall rating.
          </p>
        </div>

        <button
          onClick={() => setIsSessionActive(true)}
          disabled={words.length === 0}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Start Review Session ({dueQueue.length} Due)</span>
        </button>
      </div>

      {/* 2. SRS Mastery Buckets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {newWords.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Not yet introduced to memory loop
          </div>
        </div>

        {/* Learning */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Learning</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {learningWords.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Actively being drilled (1-2 streak)
          </div>
        </div>

        {/* Review */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Review</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {reviewWords.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Long-term retention (3-4 streak)
          </div>
        </div>

        {/* Mastered */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Mastered</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {masteredWords.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Solidified in permanent memory (5+ streak)
          </div>
        </div>
      </div>

      {/* 3. Rating Feedback Principles */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>How Review Ratings Work</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
            <div className="font-bold text-rose-700 dark:text-rose-300 mb-1">Again (&lt; 1 min)</div>
            <p className="text-slate-600 dark:text-slate-300">
              Failed recall. Word resets to "learning" and is reshown in the same session.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
            <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">Hard (1 day)</div>
            <p className="text-slate-600 dark:text-slate-300">
              Recalled with hesitation. Scheduled for quick review tomorrow.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
            <div className="font-bold text-blue-700 dark:text-blue-300 mb-1">Good (3 days)</div>
            <p className="text-slate-600 dark:text-slate-300">
              Comfortable recall. Extends the interval safely into long-term retention.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
            <div className="font-bold text-emerald-700 dark:text-emerald-300 mb-1">Easy (7 days)</div>
            <p className="text-slate-600 dark:text-slate-300">
              Effortless recall. Progresses word rapidly toward "mastered" status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
