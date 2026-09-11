import { LearningItem, VocabularyQueryResult, ContentAuditReport } from '../../server/types/vocabulary';
import { DailyGoalSettings, SupportedLanguageId, UserStats, VocabularyWord } from '../types';

export interface VocabularySearchParams {
  language?: string;
  category?: string;
  difficulty?: string;
  frequencyBand?: string;
  itemType?: string;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: 'frequency' | 'alphabetical' | 'difficulty' | 'random';
}

export async function searchVocabulary(
  params: VocabularySearchParams
): Promise<VocabularyQueryResult> {
  const query = new URLSearchParams();
  if (params.language) query.set('language', params.language);
  if (params.category && params.category !== 'All Categories') query.set('category', params.category);
  if (params.difficulty && params.difficulty !== 'all') query.set('difficulty', params.difficulty);
  if (params.frequencyBand && params.frequencyBand !== 'all') query.set('frequencyBand', params.frequencyBand);
  if (params.itemType && params.itemType !== 'all') query.set('itemType', params.itemType);
  if (params.q) query.set('search', params.q);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sortBy) query.set('sortBy', params.sortBy);

  const res = await fetch(`/api/vocabulary?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to query vocabulary: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchVocabularyCategories(
  language?: string
): Promise<{ name: string; count: number }[]> {
  const query = new URLSearchParams();
  if (language) query.set('language', language);
  const res = await fetch(`/api/vocabulary/categories?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.statusText}`);
  }
  const data = await res.json();
  return data.categories || [];
}

export async function fetchRandomVocabulary(
  language: string,
  count = 20,
  category?: string,
  difficulty?: string
): Promise<LearningItem[]> {
  const query = new URLSearchParams({ language, count: String(count) });
  if (category && category !== 'All Categories') query.set('category', category);
  if (difficulty && difficulty !== 'all') query.set('difficulty', difficulty);

  const res = await fetch(`/api/vocabulary/random?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch random vocabulary: ${res.statusText}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function fetchVocabularyRecommendations(
  language: string,
  currentBand = 'high',
  strategy = 'expand_core',
  limit = 10
): Promise<LearningItem[]> {
  const query = new URLSearchParams({
    language,
    currentBand,
    strategy,
    limit: String(limit),
  });

  const res = await fetch(`/api/vocabulary/recommendations?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function fetchDueReviews(language: string, limit = 20): Promise<LearningItem[]> {
  const query = new URLSearchParams({ language, limit: String(limit) });
  const res = await fetch(`/api/practice/due?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch due reviews: ${res.statusText}`);
  }
  const data = await res.json();
  return data.items || [];
}

export async function recordPracticeReviewRemote(payload: {
  itemId: string;
  languageId: string;
  activityType?: string;
  rating?: 'again' | 'hard' | 'good' | 'easy';
  score?: number;
}): Promise<any> {
  const res = await fetch('/api/practice/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to record review: ${res.statusText}`);
  }
  return res.json();
}

export async function toggleBookmarkRemote(itemId: string, bookmarked: boolean): Promise<any> {
  const res = await fetch('/api/user/bookmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, bookmarked }),
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle bookmark: ${res.statusText}`);
  }
  return res.json();
}

export async function updateUserSettingsRemote(settings: Partial<DailyGoalSettings>): Promise<any> {
  const res = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error(`Failed to update settings: ${res.statusText}`);
  }
  return res.json();
}

export async function addCustomWordRemote(word: VocabularyWord): Promise<any> {
  const res = await fetch('/api/user/custom-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(word),
  });
  if (!res.ok) {
    throw new Error(`Failed to add custom word: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteCustomWordRemote(id: string): Promise<any> {
  const res = await fetch(`/api/user/custom-items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete custom word: ${res.statusText}`);
  }
  return res.json();
}

export async function syncClientWithBackend(payload: {
  vocabulary?: VocabularyWord[];
  stats?: UserStats | null;
  settings?: DailyGoalSettings | null;
  activeLanguage?: string;
}): Promise<any> {
  const res = await fetch('/api/user/migrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to sync client with backend: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchVocabularyStats(): Promise<{
  totalCount: number;
  reports: ContentAuditReport[];
}> {
  const res = await fetch('/api/vocabulary/stats');
  if (!res.ok) {
    throw new Error(`Failed to fetch vocabulary stats: ${res.statusText}`);
  }
  return res.json();
}

export function learningItemToVocabularyWord(
  item: LearningItem,
  existingWord?: Partial<VocabularyWord>
): VocabularyWord {
  const effectiveLang: SupportedLanguageId = (
    item.languageVariant === 'zh-cmn'
      ? 'zh-cmn'
      : item.languageVariant === 'zh-yue'
      ? 'zh-yue'
      : (item.languageVariant as SupportedLanguageId) ||
        (item.languageId === 'zh' ? 'zh-cmn' : (item.languageId as SupportedLanguageId)) ||
        'zh-cmn'
  );

  return {
    id: item.id,
    languageId: effectiveLang,
    variantId: (item.languageVariant as SupportedLanguageId) || effectiveLang,
    word: item.word,
    traditionalWord: (item.languageSpecific as any)?.traditional || undefined,
    phonetic: item.pronunciation,
    meaning: item.meaning,
    partOfSpeech:
      item.itemType === 'collocation'
        ? 'Expression'
        : item.itemType === 'phrase'
        ? 'Phrase'
        : item.itemType === 'question' || item.itemType === 'response'
        ? 'Expression'
        : (item.partOfSpeech as any) || 'Expression',
    category: (item.category as any) || 'Daily Essentials',
    level: item.difficulty || 'beginner',
    exampleSentence: {
      native: item.examples?.[0]?.native || `${item.word}.`,
      phonetic: item.examples?.[0]?.pronunciation,
      translation: item.examples?.[0]?.translation || item.meaning,
    },
    status: existingWord?.status || item.status || 'new',
    streak: existingWord?.streak || item.streak || 0,
    reviewsCount: existingWord?.reviewsCount || item.reviewsCount || 0,
    lastPracticed: existingWord?.lastPracticed || item.lastPracticed,
    isBookmarked: existingWord?.isBookmarked || item.isBookmarked || false,
    memoryTip: item.memoryTip,
    culturalNote: item.culturalNote || item.culturalNotes,
  };
}
