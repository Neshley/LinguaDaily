import React from 'react';
import {
  Flame,
  Zap,
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { LanguageVariant, UserStats, VocabularyWord } from '../types';
import { SkillMasteryDashboard } from '../components/SkillMasteryDashboard';

interface ProgressViewProps {
  activeVariant: LanguageVariant;
  stats: UserStats;
  words: VocabularyWord[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  activeVariant,
  stats,
  words,
}) => {
  const masteredCount = words.filter((w) => w.status === 'mastered').length;
  const learningCount = words.filter((w) => w.status === 'learning').length;
  const reviewCount = words.filter((w) => w.status === 'review').length;
  const totalPracticed = words.filter((w) => (w.reviewsCount || 0) > 0).length;

  // 7-day consistency calendar based on stats.dailyHistory
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count =
      (stats?.dailyHistory && stats.dailyHistory[key]) ??
      (stats?.historyByDate && stats.historyByDate[key]) ??
      0;
    return { date: key, label: dayLabel, count };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Learning Progress — {activeVariant.name}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Transparent metrics based purely on your actual practice history and SRS retention.
        </p>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Streak</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.streakDays} <span className="text-sm font-semibold text-slate-400">days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Consecutive daily study sessions
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalXp ?? stats.xp ?? 0} <span className="text-sm font-semibold text-slate-400">XP</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Earned through drills & quizzes
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mastered</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {masteredCount} <span className="text-sm font-semibold text-slate-400">/ {words.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Solidified in permanent memory
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pool</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {learningCount + reviewCount}{' '}
            <span className="text-sm font-semibold text-slate-400">words</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            In active SRS rotation
          </p>
        </div>
      </div>

      {/* 3. 7-Day Consistency Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Past 7 Days Consistency</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {totalPracticed} total active items
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {past7Days.map((d) => (
            <div
              key={d.date}
              className={`p-3 rounded-xl border text-center transition-all ${
                d.count > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                {d.label}
              </div>
              <div
                className={`text-base font-extrabold ${
                  d.count > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {d.count}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">practiced</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Skill Mastery Radar & Level Breakdown */}
      <SkillMasteryDashboard
        stats={stats}
        words={words}
        languageName={activeVariant.name}
      />
    </div>
  );
};
