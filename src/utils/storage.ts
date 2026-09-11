import { DailyGoalSettings, SupportedLanguageId, UserStats, VocabularyWord } from '../types';
import { INITIAL_VOCABULARY } from '../data/vocabulary';

const STORAGE_KEYS = {
  VOCABULARY: 'linguadaily_vocabulary_v1',
  STATS: 'linguadaily_user_stats_v1',
  SETTINGS: 'linguadaily_settings_v1',
  ACTIVE_LANGUAGE: 'linguadaily_active_lang_v1',
};

export const DEFAULT_SETTINGS: DailyGoalSettings = {
  targetWordsPerDay: 10,
  speechSpeed: 0.9,
  autoPlayAudio: true,
  showPhoneticByDefault: true,
  soundEffects: true,
  preferredWritingSystem: 'simplified',
  dailyLessonGoal: 10,
};

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function loadSavedVocabulary(): VocabularyWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOCABULARY);
    if (!raw) {
      return INITIAL_VOCABULARY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure all initial words exist in the loaded data
      const idMap = new Set(parsed.map((w: VocabularyWord) => w.id));
      const merged = [...parsed];
      for (const initialWord of INITIAL_VOCABULARY) {
        if (!idMap.has(initialWord.id)) {
          merged.push(initialWord);
        }
      }
      return merged;
    }
  } catch (e) {
    console.error('Error loading vocabulary from localStorage:', e);
  }
  return INITIAL_VOCABULARY;
}

export function saveVocabulary(words: VocabularyWord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(words));
  } catch (e) {
    console.error('Error saving vocabulary to localStorage:', e);
  }
}

export function loadSavedSettings(): DailyGoalSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: DailyGoalSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export const VALID_LANGUAGE_IDS: SupportedLanguageId[] = [
  'zh',
  'zh-cmn',
  'zh-yue',
  'zh-wuu',
  'zh-nan',
  'ja',
  'es',
  'fr',
  'de',
  'ko',
];

export function loadActiveLanguage(): SupportedLanguageId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_LANGUAGE) as SupportedLanguageId;
    if (raw && VALID_LANGUAGE_IDS.includes(raw)) {
      return raw;
    }
  } catch (e) {
    console.error('Error loading active language:', e);
  }
  return 'zh'; // Default to Chinese (Mandarin)
}

export function saveActiveLanguage(lang: SupportedLanguageId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LANGUAGE, lang);
  } catch (e) {
    console.error('Error saving active language:', e);
  }
}

export function loadUserStats(): UserStats {
  const today = getTodayDateString();
  const defaultHistory = { [today]: 3 };
  const defaultStats: UserStats = {
    streakDays: 1,
    lastActiveDate: today,
    totalWordsPracticed: 3,
    xp: 60,
    totalXp: 60,
    todayPracticedIds: [],
    todayPracticedWords: [],
    historyByDate: defaultHistory,
    dailyHistory: defaultHistory,
    completedLessonIds: ['lesson-zh-1-1'],
    skillMastery: {
      vocabulary: 45,
      listening: 35,
      speaking: 40,
      reading: 30,
      writing: 25,
      grammar: 35,
    },
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      const parsed: any = JSON.parse(raw);
      // Check streak continuity
      const lastDate = parsed.lastActiveDate || today;
      const todayDate = new Date(today);
      const prevDate = new Date(lastDate);
      const diffDays = Math.round((todayDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));

      let newStreak = parsed.streakDays || 1;
      let todayPracticed = parsed.todayPracticedIds || parsed.todayPracticedWords || [];

      if (diffDays === 1) {
        todayPracticed = [];
      } else if (diffDays > 1) {
        newStreak = 1;
        todayPracticed = [];
      }

      const mergedHistory = {
        ...(parsed.historyByDate || {}),
        ...(parsed.dailyHistory || {}),
      };
      if (mergedHistory[today] === undefined) {
        mergedHistory[today] = 0;
      }

      const currentXp = parsed.totalXp ?? parsed.xp ?? 60;

      return {
        ...parsed,
        streakDays: newStreak,
        lastActiveDate: today,
        xp: currentXp,
        totalXp: currentXp,
        totalWordsPracticed: parsed.totalWordsPracticed || 0,
        totalWordsLearned: parsed.totalWordsLearned || 0,
        todayPracticedIds: diffDays === 0 ? todayPracticed : [],
        todayPracticedWords: diffDays === 0 ? todayPracticed : [],
        historyByDate: mergedHistory,
        dailyHistory: mergedHistory,
        completedLessonIds: parsed.completedLessonIds || ['lesson-zh-1-1'],
        skillMastery: parsed.skillMastery || defaultStats.skillMastery,
      };
    }
  } catch (e) {
    console.error('Error loading stats:', e);
  }

  return defaultStats;
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}
