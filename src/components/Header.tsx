import React from 'react';
import { Flame, Sparkles, Settings as SettingsIcon, Volume2, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { DailyGoalSettings, SupportedLanguageId, UserStats } from '../types';

interface HeaderProps {
  activeLanguage: SupportedLanguageId;
  onSelectLanguage: (id: SupportedLanguageId) => void;
  stats: UserStats;
  settings: DailyGoalSettings;
  onUpdateSettings: (newSettings: Partial<DailyGoalSettings>) => void;
  onOpenSettings: () => void;
  onOpenLanguageModal?: () => void;
  totalWordsInLanguage: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeLanguage,
  onSelectLanguage,
  stats,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenLanguageModal,
  totalWordsInLanguage,
}) => {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.id === activeLanguage) || SUPPORTED_LANGUAGES[0];
  const todayPracticedCount = (stats?.todayPracticedIds?.length ?? stats?.todayPracticedWords?.length) || 0;
  const progressPercent = Math.min(100, Math.round((todayPracticedCount / (settings.targetWordsPerDay || 10)) * 100));

  const toggleSpeechSpeed = () => {
    const nextSpeed = settings.speechSpeed === 0.75 ? 1.0 : 0.75;
    onUpdateSettings({ speechSpeed: nextSpeed });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Language Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white flex items-center justify-center font-bold shadow-xs">
              <span className="text-base tracking-tight font-serif">文</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">LinguaDaily</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-mono">
                  Sinitic & Global
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Intelligent Multi-Language Mastery</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Language / Variant Selector Button */}
          <button
            id="open-language-modal-header-btn"
            onClick={onOpenLanguageModal}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 cursor-pointer text-left shadow-xs group"
            title="Switch Language Family, Variety, or Writing System"
          >
            <span className="text-xl leading-none">{currentLang.flag}</span>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 transition-colors">
                {currentLang.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                {currentLang.nativeName} • {totalWordsInLanguage} words
              </div>
            </div>
            <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 ml-1 transition-colors" />
          </button>
        </div>

        {/* Right Stats & Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Indicator */}
          <div
            id="streak-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800"
            title={`${stats.streakDays} day practice streak`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span className="text-xs font-bold font-mono">{stats.streakDays}</span>
            <span className="text-[11px] font-medium hidden sm:inline">days</span>
          </div>

          {/* Daily Words Goal Pill */}
          <div
            id="daily-goal-pill"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            title={`Today: ${todayPracticedCount} / ${settings.targetWordsPerDay} words studied`}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium">
              {todayPracticedCount}/{settings.targetWordsPerDay}
            </span>
          </div>

          {/* XP Badge */}
          <div
            id="xp-badge"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700"
            title={`${stats.xp} Experience Points`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold font-mono">{stats.xp}</span>
            <span className="text-[10px] font-semibold uppercase">XP</span>
          </div>

          {/* Audio Speed Toggle */}
          <button
            id="btn-toggle-speed"
            onClick={toggleSpeechSpeed}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              settings.speechSpeed === 0.75
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle pronunciation speed between normal (1.0x) and slow (0.75x)"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="font-mono">{settings.speechSpeed}x</span>
          </button>

          {/* Settings Button */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Practice Preferences & Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
