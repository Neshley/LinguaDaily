import React from 'react';
import {
  Sparkles,
  RotateCw,
  Flame,
  CheckCircle2,
  ArrowRight,
  Volume2,
  Mic,
  Brain,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  DailyGoalSettings,
  LanguageVariant,
  MainNavigationTab,
  UserStats,
  VocabularyWord,
} from '../types';
import { playNativeSpeech } from '../utils/speech';

interface HomeViewProps {
  activeVariant: LanguageVariant;
  stats: UserStats;
  settings: DailyGoalSettings;
  words: VocabularyWord[];
  onNavigate: (tab: MainNavigationTab) => void;
  onSelectWordForPractice?: (word: VocabularyWord) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeVariant,
  stats,
  settings,
  words,
  onNavigate,
}) => {
  // Calculate today's progress & due reviews
  const todayKey = new Date().toISOString().split('T')[0];
  const todayPracticedCount =
    (stats?.dailyHistory && stats.dailyHistory[todayKey]) ??
    (stats?.historyByDate && stats.historyByDate[todayKey]) ??
    0;
  const goalTarget = settings.targetWordsPerDay || 10;
  const goalPercentage = Math.min(100, Math.round((todayPracticedCount / goalTarget) * 100));

  const dueForReview = words.filter((w) => {
    if (w.status === 'mastered') return false;
    if (w.status === 'learning' || w.status === 'review') return true;
    return false;
  });

  const recentWords = [...words]
    .filter((w) => w.lastPracticed)
    .sort((a, b) => {
      const timeA = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
      const timeB = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 4);

  const starterWord = words.find((w) => w.status === 'new') || words[0];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Banner & Current Language Context */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-3 backdrop-blur-xs">
              <span className="text-base">{activeVariant.flag}</span>
              <span>{activeVariant.name}</span>
              <span className="text-indigo-400">•</span>
              <span>{activeVariant.nativeName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Ready to practice, learner?
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Learn at your own pace. Explore vocabulary, train your pronunciation, or review what you're likely to forget.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-white/5 p-3 sm:p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 pr-3 border-r border-white/10">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold leading-tight">{stats.streakDays}</div>
                <div className="text-[11px] text-slate-400">Day Streak</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold leading-tight">{stats.totalXp ?? stats.xp ?? 0}</div>
                <div className="text-[11px] text-slate-400">Total XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Action: Continue Learning & Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Recommended Next Step
                </span>
              </div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                Daily Essentials
              </span>
            </div>

            {starterWord && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        {starterWord.word}
                      </span>
                      {starterWord.phonetic && (
                        <span className="text-base text-indigo-600 dark:text-indigo-400 font-medium">
                          {starterWord.phonetic}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {starterWord.meaning}
                    </p>
                  </div>
                  <button
                    onClick={() => playNativeSpeech(starterWord.word, activeVariant.speechCode, settings.speechSpeed)}
                    className="p-2.5 rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:text-indigo-600 shadow-xs transition-colors cursor-pointer"
                    title="Listen"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {starterWord.exampleSentence && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
                    <span className="italic text-slate-700 dark:text-slate-300">
                      "{starterWord.exampleSentence.native}"
                    </span>{' '}
                    — {starterWord.exampleSentence.translation}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('practice')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              <span>Practice This Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              Explore All Topics
            </button>
          </div>
        </div>

        {/* Today's Goal Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Goal</h2>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {todayPracticedCount} / {goalTarget} words
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              {goalPercentage >= 100
                ? "🎉 You've hit your daily practice target! Keep exploring or review due items."
                : `${goalTarget - todayPracticedCount} more words to hit today's practice target.`}
            </p>

            {/* Review Due Alert */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  SRS Review Queue
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-800/50 text-amber-800 dark:text-amber-300">
                  {dueForReview.length} Due
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                Items scheduled for recall today based on spaced repetition.
              </p>
              <button
                onClick={() => onNavigate('review')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Start Review Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Practice Modes Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Practice</h2>
          <button
            onClick={() => onNavigate('practice')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Modes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('practice')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Flashcards</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leitner memory recall</div>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Pronunciation</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Speech recognition drills</div>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-left shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">Recall Quiz</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multiple-choice testing</div>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 transition-all text-left shadow-xs group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">AI Sentence Studio</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grammar & natural phrasing</div>
          </button>
        </div>
      </div>

      {/* 4. Recent Words & Activity */}
      {recentWords.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Recently Practiced</span>
            </h2>
            <button
              onClick={() => onNavigate('wordbank')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Open Word Bank ({words.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recentWords.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {item.word}
                  </div>
                  {item.phonetic && (
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {item.phonetic}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                    {item.meaning}
                  </div>
                </div>

                <button
                  onClick={() => playNativeSpeech(item.word, activeVariant.speechCode, settings.speechSpeed)}
                  className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Pronounce"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
