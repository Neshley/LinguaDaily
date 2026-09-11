import React from 'react';
import {
  Play,
  RotateCw,
  Award,
  Mic,
  Sparkles,
  BookOpen,
  Volume2,
  Bookmark,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DailyGoalSettings, LanguageMeta, PracticeTab, UserStats, VocabularyWord } from '../types';
import { ToneVisualizer } from './ToneVisualizer';
import { speakWord } from '../utils/speech';

interface DailyDashboardProps {
  language: LanguageMeta;
  words: VocabularyWord[];
  stats: UserStats;
  settings: DailyGoalSettings;
  onNavigateTab: (tab: PracticeTab) => void;
  onToggleBookmark: (wordId: string) => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  language,
  words,
  stats,
  settings,
  onNavigateTab,
  onToggleBookmark,
}) => {
  const todayCount = (stats?.todayPracticedIds?.length ?? stats?.todayPracticedWords?.length) || 0;
  const targetCount = settings.targetWordsPerDay || 10;
  const progressPercent = Math.min(100, Math.round((todayCount / targetCount) * 100));

  // Words due for review or learning
  const dueWords = words
    .filter((w) => w.status === 'review' || w.status === 'learning' || w.status === 'new')
    .slice(0, 6);

  const masteredCount = words.filter((w) => w.status === 'mastered').length;
  const learningCount = words.filter((w) => w.status === 'learning').length;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIdx = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const handlePlayWord = (text: string) => {
    speakWord(text, language.speechCode, settings.speechSpeed);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Hero Daily Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-300">
              <span className="text-base leading-none">{language.flag}</span>
              <span>{language.name} Mastery Session</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready for today&apos;s practice?
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Consistently reviewing 10 words each day builds native intuition and activates long-term memory retrieval pathways.
            </p>

            {/* Quick 7-Day Streak Trail */}
            <div className="flex items-center gap-2 pt-2">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === todayDayIdx;
                const isCompleted = idx <= todayDayIdx && todayCount > 0;
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{day}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                        isCompleted
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : isToday
                          ? 'ring-2 ring-indigo-400 bg-slate-800 text-indigo-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Flame className="w-3.5 h-3.5 fill-slate-950" /> : '•'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Progress Gauge & Start Button */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 text-center space-y-4 shrink-0 sm:min-w-[240px]">
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Today&apos;s Goal
              </div>
              <div className="text-3xl font-extrabold font-mono text-white">
                {todayCount} <span className="text-lg font-normal text-slate-400">/ {targetCount}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                {progressPercent}% completed
              </span>
            </div>

            <button
              id="btn-start-daily-session"
              onClick={() => onNavigateTab('flashcards')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all active:scale-98"
            >
              <Play className="w-4 h-4 fill-slate-900" />
              <span>Start Daily Practice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Practice Modes Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Practice Modules</h2>
          <span className="text-xs text-slate-500">Select an interactive drill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Course Curriculum */}
          <div
            id="tile-mode-courses"
            onClick={() => onNavigateTab('course')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Structured Course</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Step-by-step units with vocabulary, audio dialogues, tone drills, and comprehension checks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>Start Lessons</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Spaced Repetition Flashcards */}
          <div
            id="tile-mode-flashcards"
            onClick={() => onNavigateTab('flashcards')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <RotateCw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">SRS Flashcards</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart Leitner-spaced repetition with flip cards, audio, and character stroke notes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>{words.length} cards available</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Active Recall Quiz */}
          <div
            id="tile-mode-quiz"
            onClick={() => onNavigateTab('quiz')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Active Recall Quiz</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Multiple-choice tests, listening comprehension, and tone distinction challenges.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
              <span>Test Recall</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Pronunciation & Speech Drill */}
          <div
            id="tile-mode-pronounce"
            onClick={() => onNavigateTab('pronounce')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Speech &amp; Accent Drill</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Speak into your mic with real-time speech evaluation, slow audio guides, and score feedback.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span>Practice Speaking</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 5: Grammar & Structural Blueprints */}
          <div
            id="tile-mode-grammar"
            onClick={() => onNavigateTab('grammar')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Grammar Blueprints</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Formulaic patterns, particle usage, and word order formulas with audio examples.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold">
              <span>Study Grammar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 6: Graded Reading Lab */}
          <div
            id="tile-mode-stories"
            onClick={() => onNavigateTab('stories')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Graded Reading Lab</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Immersion short stories with toggleable phonetic guides, native audio, and quizzes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-700 font-semibold">
              <span>Read Stories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 7: AI Sentence Studio */}
          <div
            id="tile-mode-ai-tutor"
            onClick={() => onNavigateTab('ai-tutor')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">AI Sentence Studio</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Construct your own sentences in {language.name} and receive instant grammar &amp; natural nuance analysis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-semibold">
              <span>Write Sentences</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 8: Skill Radar & Analytics */}
          <div
            id="tile-mode-analytics"
            onClick={() => onNavigateTab('analytics')}
            className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Skill Radar &amp; Mastery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                6 core competencies: Vocabulary, Listening, Speaking, Reading, Writing, and Grammar.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-semibold">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Special Mandarin Four Tones Section for Chinese, or Language Spotlight */}
      {language.toneSupport ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Mastering Chinese Phonetics
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Interactive Four Tones Pitch Contour
              </h3>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Tones determine character meaning in Mandarin!
            </p>
          </div>
          <ToneVisualizer showInteractiveGuide={true} languageId={language.id} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {language.name} Deck Overview
            </h3>
            <p className="text-xs text-slate-500">
              Master script: {language.scriptName} • Levels: {language.levels.join(', ')}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('wordbank')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
          >
            Explore All Words
          </button>
        </div>
      )}

      {/* Due Today / Recommended Words Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recommended for Review</h3>
            <p className="text-xs text-slate-500">High-priority vocabulary from your deck</p>
          </div>
          <button
            onClick={() => onNavigateTab('wordbank')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Full Deck ({words.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dueWords.map((w) => (
            <div
              key={w.id}
              className="border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 bg-slate-50/50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 font-serif">{w.word}</span>
                  <span className="text-xs font-mono text-indigo-600 font-medium">{w.phonetic}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 truncate max-w-[170px]">{w.meaning}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePlayWord(w.word)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 border border-transparent hover:border-slate-200"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleBookmark(w.id)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-amber-500"
                  title="Bookmark"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${w.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deck Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-mono uppercase font-semibold">Total Vocabulary</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{words.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-mono uppercase font-semibold">Mastered</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{masteredCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-mono uppercase font-semibold">Active Learning</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">{learningCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-mono uppercase font-semibold">Total XP</span>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{stats.xp}</div>
        </div>
      </div>
    </div>
  );
};
