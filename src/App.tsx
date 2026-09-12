/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  DailyGoalSettings,
  LanguageFamilyId,
  MainNavigationTab,
  SupportedLanguageId,
  UserStats,
  VocabularyWord,
} from './types';
import {
  loadActiveLanguage,
  loadSavedSettings,
  loadSavedVocabulary,
  loadUserStats,
  saveActiveLanguage,
  saveSettings,
  saveUserStats,
  saveVocabulary,
  getTodayDateString,
} from './utils/storage';

import { findLanguageVariant, getLanguageMeta } from './data/languageFamilies';
import { matchesLanguageVariant } from './utils/language';
import { calculateNextReview, isDue } from './utils/srs';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeView } from './views/HomeView';
import { LearnView } from './views/LearnView';
import { PracticeView } from './views/PracticeView';
import { ReviewView } from './views/ReviewView';
import { ExploreView } from './views/ExploreView';
import { ProgressView } from './views/ProgressView';
import { WordBankManager } from './components/WordBankManager';
import { SettingsModal } from './components/SettingsModal';
import { LanguageVariantModal } from './components/LanguageVariantModal';

export default function App() {
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguageId>(loadActiveLanguage);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(loadSavedVocabulary);
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [settings, setSettings] = useState<DailyGoalSettings>(loadSavedSettings);
  const [activeTab, setActiveTab] = useState<MainNavigationTab>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  // Sync active language to storage
  const handleSelectLanguage = (lang: SupportedLanguageId) => {
    setActiveLanguage(lang);
    saveActiveLanguage(lang);
  };

  const handleSelectVariant = (
    familyId: LanguageFamilyId,
    variantId: SupportedLanguageId,
    writingSystemId: string,
    pronunciationSystemId: string
  ) => {
    setActiveLanguage(variantId);
    saveActiveLanguage(variantId);
    if (writingSystemId) {
      handleUpdateSettings({ preferredWritingSystem: writingSystemId });
    }
  };

  // Sync settings
  const handleUpdateSettings = (newSettings: Partial<DailyGoalSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // Sync vocabulary
  const updateVocabularyState = (updatedList: VocabularyWord[]) => {
    setVocabulary(updatedList);
    saveVocabulary(updatedList);
  };

  // Filter words for current language or fallback to all words matching the language prefix
  const languageWords = useMemo(() =>
    vocabulary.filter((word) => matchesLanguageVariant(word, activeLanguage)),
    [vocabulary, activeLanguage]
  );

  const currentVariant = useMemo(() => {
    return findLanguageVariant(activeLanguage);
  }, [activeLanguage]);

  const currentLanguageMeta = useMemo(() => {
    return getLanguageMeta(activeLanguage);
  }, [activeLanguage]);

  // Record practice using the single client-side SRS implementation.
  const handleRateWord = (wordId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const today = getTodayDateString();
    const updatedWords = vocabulary.map((word) => {
      if (word.id !== wordId) return word;
      const srs = calculateNextReview(word, rating);
      return {
        ...word,
        status: srs.status,
        streak: srs.streak,
        reviewsCount: (word.reviewsCount || 0) + 1,
        lastPracticed: today,
        nextReviewDate: srs.nextReviewDate,
      };
    });

    updateVocabularyState(updatedWords);

    setStats((prev) => {
      const isAlreadyPracticedToday = prev.todayPracticedWords?.includes(wordId) || false;
      const newTodayList = isAlreadyPracticedToday
        ? prev.todayPracticedWords || []
        : [...(prev.todayPracticedWords || []), wordId];
      const currentDayCount = (prev.dailyHistory?.[today] ?? prev.historyByDate?.[today]) || 0;
      const newDailyHistory = {
        ...(prev.historyByDate || {}),
        ...(prev.dailyHistory || {}),
        [today]: isAlreadyPracticedToday ? currentDayCount : currentDayCount + 1,
      };
      const xpEarned = rating === 'easy' ? 15 : rating === 'good' ? 10 : 5;
      const newXp = (prev.xp ?? prev.totalXp ?? 0) + xpEarned;
      const newStats: UserStats = {
        ...prev,
        xp: newXp,
        totalXp: newXp,
        totalWordsPracticed: (prev.totalWordsPracticed || 0) + (isAlreadyPracticedToday ? 0 : 1),
        totalWordsLearned: updatedWords.filter((w) => w.status !== 'new').length,
        todayPracticedIds: newTodayList,
        todayPracticedWords: newTodayList,
        historyByDate: newDailyHistory,
        dailyHistory: newDailyHistory,
        skillMastery: {
          ...prev.skillMastery,
          vocabulary: Math.min(100, (prev.skillMastery?.vocabulary || 45) + 1),
        },
      };
      saveUserStats(newStats);
      return newStats;
    });
  };

  const handleToggleBookmark = (wordId: string) => {
    let nextStatus = false;
    const updated = vocabulary.map((w) => {
      if (w.id === wordId) {
        nextStatus = !w.isBookmarked;
        return { ...w, isBookmarked: nextStatus };
      }
      return w;
    });
    updateVocabularyState(updated);
  };

  const handleAddCustomWord = (newWord: VocabularyWord) => {
    const updated = [newWord, ...vocabulary];
    updateVocabularyState(updated);
  };

  const handleDeleteWord = (wordId: string) => {
    const updated = vocabulary.filter((w) => w.id !== wordId);
    updateVocabularyState(updated);
  };

  const handleQuizComplete = (score: number, total: number) => {
    const earnedXp = score * 10;
    const today = getTodayDateString();

    setStats((prev) => {
      const newXp = (prev.xp ?? prev.totalXp ?? 0) + earnedXp;
      const newHistory = {
        ...(prev.historyByDate || {}),
        ...(prev.dailyHistory || {}),
        [today]: ((prev.historyByDate?.[today] ?? prev.dailyHistory?.[today]) || 0) + score,
      };

      const newStats: UserStats = {
        ...prev,
        xp: newXp,
        totalXp: newXp,
        historyByDate: newHistory,
        dailyHistory: newHistory,
        skillMastery: {
          ...prev.skillMastery,
          reading: Math.min(100, (prev.skillMastery?.reading || 30) + Math.round(((total > 0 ? score / total : 0)) * 5)),
          vocabulary: Math.min(100, (prev.skillMastery?.vocabulary || 45) + 2),
        },
      };
      saveUserStats(newStats);
      return newStats;
    });
  };

  const handleWordMastered = (wordId: string) => {
    const updatedWords = vocabulary.map((w) =>
      w.id === wordId ? { ...w, status: 'mastered' as const, streak: (w.streak || 0) + 1 } : w
    );
    updateVocabularyState(updatedWords);

    setStats((prev) => {
      const newXp = (prev.xp ?? prev.totalXp ?? 0) + 25;
      const newStats: UserStats = {
        ...prev,
        xp: newXp,
        totalXp: newXp,
        skillMastery: {
          ...prev.skillMastery,
          speaking: Math.min(100, (prev.skillMastery?.speaking || 40) + 3),
          listening: Math.min(100, (prev.skillMastery?.listening || 35) + 2),
        },
      };
      saveUserStats(newStats);
      return newStats;
    });
  };

  const handleSessionComplete = () => {
    const today = getTodayDateString();
    setStats((prev) => {
      const newXp = (prev.xp ?? prev.totalXp ?? 0) + 20;
      const currentToday = (prev.historyByDate?.[today] ?? prev.dailyHistory?.[today]) || 0;
      const newHistory = {
        ...(prev.historyByDate || {}),
        ...(prev.dailyHistory || {}),
        [today]: currentToday + 1,
      };
      const newStats: UserStats = {
        ...prev,
        xp: newXp,
        totalXp: newXp,
        historyByDate: newHistory,
        dailyHistory: newHistory,
      };
      saveUserStats(newStats);
      return newStats;
    });
  };

  const handleResetStats = () => {
    const today = getTodayDateString();
    const freshStats: UserStats = {
      streakDays: 1,
      lastActiveDate: today,
      totalWordsPracticed: 0,
      xp: 0,
      totalXp: 0,
      todayPracticedIds: [],
      todayPracticedWords: [],
      totalWordsLearned: 0,
      historyByDate: { [today]: 0 },
      dailyHistory: { [today]: 0 },
      completedLessonIds: [],
      skillMastery: {
        vocabulary: 20,
        listening: 15,
        speaking: 15,
        reading: 10,
        writing: 10,
        grammar: 15,
      },
    };
    setStats(freshStats);
    saveUserStats(freshStats);
    setIsSettingsOpen(false);
  };

  // Due for review count
  const now = Date.now();
  const dueReviewsCount = languageWords.filter((word) => isDue(word, now)).length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Header */}
      <Header
        activeLanguage={activeLanguage}
        onSelectLanguage={handleSelectLanguage}
        stats={stats}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        totalWordsInLanguage={languageWords.length}
      />

      {/* Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        reviewCount={dueReviewsCount}
        totalWords={languageWords.length}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8">
        {activeTab === 'home' && (
          <HomeView
            activeVariant={currentVariant}
            stats={stats}
            settings={settings}
            words={languageWords}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'learn' && (
          <LearnView
            activeVariant={currentVariant}
            words={languageWords}
            settings={settings}
            onNavigate={setActiveTab}
            onToggleBookmark={handleToggleBookmark}
            onAddWordToDeck={handleAddCustomWord}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            activeVariant={currentVariant}
            languageMeta={currentLanguageMeta}
            words={languageWords}
            settings={settings}
            onRateWord={handleRateWord}
            onToggleBookmark={handleToggleBookmark}
            onCompleteSession={handleSessionComplete}
            onCompleteQuiz={handleQuizComplete}
            onWordMastered={handleWordMastered}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'review' && (
          <ReviewView
            activeVariant={currentVariant}
            languageMeta={currentLanguageMeta}
            words={languageWords}
            settings={settings}
            onRateWord={handleRateWord}
            onToggleBookmark={handleToggleBookmark}
            onCompleteSession={handleSessionComplete}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            activeVariant={currentVariant}
            words={languageWords}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            activeVariant={currentVariant}
            stats={stats}
            words={languageWords}
          />
        )}

        {activeTab === 'wordbank' && (
          <WordBankManager
            words={languageWords}
            language={currentLanguageMeta}
            onAddWord={handleAddCustomWord}
            onDeleteWord={handleDeleteWord}
            onToggleBookmark={handleToggleBookmark}
            onBackToDashboard={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetStats={handleResetStats}
      />

      {/* Language Family & Variety Selection Modal */}
      <LanguageVariantModal
        isOpen={isLanguageModalOpen}
        currentLanguageId={activeLanguage}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectVariant={handleSelectVariant}
      />
    </div>
  );
}
