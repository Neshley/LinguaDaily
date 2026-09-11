import React from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Target,
  Award,
  TrendingUp,
  Brain,
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { UserStats, SkillMastery, VocabularyWord } from '../types';

interface SkillMasteryDashboardProps {
  stats: UserStats;
  words: VocabularyWord[];
  languageName: string;
}

export const SkillMasteryDashboard: React.FC<SkillMasteryDashboardProps> = ({
  stats,
  words,
  languageName,
}) => {
  const mastery: SkillMastery = stats.skillMastery || {
    vocabulary: 45,
    listening: 35,
    speaking: 40,
    reading: 30,
    writing: 25,
    grammar: 35,
  };

  const masteredWords = words.filter((w) => w.status === 'mastered').length;
  const learningWords = words.filter((w) => w.status === 'learning').length;
  const newWords = words.filter((w) => w.status === 'new').length;

  const skillItems = [
    {
      name: 'Vocabulary',
      icon: <Brain className="w-4 h-4 text-purple-500" />,
      score: mastery.vocabulary,
      color: 'bg-purple-500',
      description: 'Lexical depth & spaced repetition retention',
    },
    {
      name: 'Listening',
      icon: <Headphones className="w-4 h-4 text-sky-500" />,
      score: mastery.listening,
      color: 'bg-sky-500',
      description: 'Aural comprehension of native speeds & tone sandhi',
    },
    {
      name: 'Speaking',
      icon: <Mic className="w-4 h-4 text-emerald-500" />,
      score: mastery.speaking,
      color: 'bg-emerald-500',
      description: 'Tone contour accuracy, pronunciation & fluency',
    },
    {
      name: 'Reading',
      icon: <BookOpen className="w-4 h-4 text-amber-500" />,
      score: mastery.reading,
      color: 'bg-amber-500',
      description: 'Character recognition & graded story comprehension',
    },
    {
      name: 'Writing',
      icon: <PenTool className="w-4 h-4 text-rose-500" />,
      score: mastery.writing,
      color: 'bg-rose-500',
      description: 'Radical awareness, stroke orders & composition',
    },
    {
      name: 'Grammar',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      score: mastery.grammar,
      color: 'bg-indigo-500',
      description: 'Sentence blueprints, aspect particles & word order',
    },
  ];

  // Last 7 days history
  const historyMap = {
    ...(stats?.historyByDate || {}),
    ...(stats?.dailyHistory || {}),
  };
  const historyDates = Object.entries(historyMap)
    .slice(-7)
    .reverse();

  return (
    <div id="skill-mastery-dashboard" className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-2xl font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.streakDays} {stats.streakDays === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Current Active Streak
            </div>
          </div>
        </div>

        {/* Total XP */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.xp} XP
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Experience Earned
            </div>
          </div>
        </div>

        {/* Lessons Mastered */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.completedLessonIds?.length || 1}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Lessons Mastered
            </div>
          </div>
        </div>

        {/* Words Retained */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {words.length} Words
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Active Vocabulary
            </div>
          </div>
        </div>
      </div>

      {/* 6 Competencies Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{languageName} Proficiency Radar (6 Core Competencies)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Balanced mastery tracked across vocabulary, listening, speaking, reading, writing, and grammar.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
            CEFR / HSK Aligned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillItems.map((skill) => (
            <div
              key={skill.name}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {skill.icon}
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {skill.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {skill.score}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${skill.color}`}
                  style={{ width: `${skill.score}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                {skill.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocabulary Mastery Tier Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Spaced Repetition Memory Pipeline
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Mastered (Streak ≥ 3)
                </span>
                <span className="font-bold">{masteredWords}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(masteredWords / (words.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  In Learning Pipeline
                </span>
                <span className="font-bold">{learningWords}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${(learningWords / (words.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  New Unpracticed Words
                </span>
                <span className="font-bold">{newWords}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${(newWords / (words.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activity Log */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Practice Activity
          </h3>
          <div className="space-y-2">
            {historyDates.length === 0 ? (
              <p className="text-xs text-slate-400">Start practicing today to see your timeline!</p>
            ) : (
              historyDates.map(([date, count]) => (
                <div
                  key={date}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs"
                >
                  <span className="font-medium text-slate-600 dark:text-slate-400">{date}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {count} words reviewed
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
