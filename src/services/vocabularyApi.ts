import { LearningItem, VocabularyQueryResult, ContentAuditReport } from '../../server/types/vocabulary';
import { DailyGoalSettings, SupportedLanguageId, UserStats, VocabularyWord } from '../types';

/**
 * Vercel-safe content client.
 *
 * The language libraries are generated before deployment and shipped as static,
 * cacheable JSON files under /public/data/languages. This means Vercel never
 * needs a writable SQLite database or a long-running Node server just to serve
 * the vocabulary library.
 */
const cache = new Map<string, Promise<{ language: any; items: LearningItem[] }>>();

function contentLanguageId(language?: string) {
  if (!language) return undefined;
  if (language === 'zh-cmn' || language === 'zh-yue' || language === 'zh') return 'zh';
  return language;
}

async function loadLanguage(language: string): Promise<{ language: any; items: LearningItem[] }> {
  const id = contentLanguageId(language) || 'zh';
  let pending = cache.get(id);
  if (!pending) {
    pending = fetch(`/data/languages/${encodeURIComponent(id)}.json`, { cache: 'force-cache' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Content library ${id} could not be loaded (${res.status})`);
        return res.json();
      });
    cache.set(id, pending);
  }
  return pending;
}

function applyVariant(items: LearningItem[], variant?: string) {
  if (!variant || variant === 'all') return items;
  return items.filter(item => item.languageVariant === variant);
}

function buildFilters(items: LearningItem[]) {
  const count = (key: (i: LearningItem) => string) => {
    const map = new Map<string, number>();
    items.forEach(i => map.set(key(i), (map.get(key(i)) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, count: value }));
  };
  return {
    categories: count(i => i.category),
    difficulties: count(i => i.difficulty),
    frequencyBands: count(i => i.frequencyBand),
    itemTypes: count(i => i.itemType),
  };
}

export interface VocabularySearchParams {
  language?: string;
  languageVariant?: string;
  category?: string;
  difficulty?: string;
  frequencyBand?: string;
  itemType?: string;
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: 'frequency' | 'alphabetical' | 'difficulty' | 'random';
}

export async function searchVocabulary(params: VocabularySearchParams): Promise<VocabularyQueryResult> {
  const data = await loadLanguage(params.language || 'zh');
  let items = applyVariant(data.items, params.languageVariant);
  const query = (params.q || '').trim().toLocaleLowerCase();

  if (params.category && params.category !== 'All Categories') items = items.filter(i => i.category === params.category);
  if (params.difficulty && params.difficulty !== 'all') items = items.filter(i => i.difficulty === params.difficulty);
  if (params.frequencyBand && params.frequencyBand !== 'all') items = items.filter(i => i.frequencyBand === params.frequencyBand);
  if (params.itemType && params.itemType !== 'all') items = items.filter(i => i.itemType === params.itemType);
  if (query) {
    items = items.filter(i => [i.word, i.meaning, i.definition, i.pronunciation, ...(i.tags || [])]
      .filter(Boolean).some(v => String(v).toLocaleLowerCase().includes(query)));
  }

  const sortBy = params.sortBy || 'frequency';
  if (sortBy === 'alphabetical') items = [...items].sort((a, b) => a.word.localeCompare(b.word));
  else if (sortBy === 'difficulty') items = [...items].sort((a, b) => a.difficultyScore - b.difficultyScore);
  else if (sortBy === 'random') items = [...items].sort(() => Math.random() - 0.5);
  else items = [...items].sort((a, b) => a.frequencyRank - b.frequencyRank);

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const total = items.length;
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasMore: start + limit < total,
    filters: buildFilters(items),
  };
}

export async function fetchVocabularyCategories(language?: string): Promise<{ name: string; count: number }[]> {
  const data = await loadLanguage(language || 'zh');
  return buildFilters(data.items).categories;
}

export async function fetchRandomVocabulary(language: string, count = 20, category?: string, difficulty?: string): Promise<LearningItem[]> {
  const data = await loadLanguage(language);
  let pool = applyVariant(data.items, language === 'zh-cmn' || language === 'zh-yue' ? language : undefined);
  if (category && category !== 'All Categories') pool = pool.filter(i => i.category === category);
  if (difficulty && difficulty !== 'all') pool = pool.filter(i => i.difficulty === difficulty);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(100, Math.max(1, count)));
}

export async function fetchVocabularyRecommendations(language: string, currentBand = 'high', strategy = 'expand_core', limit = 10): Promise<LearningItem[]> {
  const data = await loadLanguage(language);
  let pool = data.items.filter(i => i.frequencyBand === currentBand || i.frequencyBand === 'high');
  if (strategy === 'conversational' || strategy === 'phrases') {
    pool = data.items.filter(i => ['phrase', 'question', 'response', 'collocation'].includes(i.itemType));
  } else if (strategy === 'beginner' || strategy === 'popular') {
    pool = data.items.filter(i => i.frequencyRank <= 500);
  }
  return [...pool].sort((a, b) => a.frequencyRank - b.frequencyRank).slice(0, limit);
}

// Review/progress writes remain best-effort. The app already keeps learner state locally,
// while these calls can be backed by Supabase later without changing the UI API.
export async function fetchDueReviews(_language: string, _limit = 20): Promise<LearningItem[]> { return []; }

export async function recordPracticeReviewRemote(payload: any): Promise<any> {
  try {
    const res = await fetch('/api/practice/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) return res.json();
  } catch {}
  return { success: true, xpEarned: payload?.activityType === 'pronunciation' ? 15 : 10 };
}

export async function toggleBookmarkRemote(itemId: string, bookmarked: boolean): Promise<any> {
  try {
    const res = await fetch('/api/user/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId, bookmarked }) });
    if (res.ok) return res.json();
  } catch {}
  return { success: true, itemId, isBookmarked: bookmarked };
}

export async function updateUserSettingsRemote(settings: Partial<DailyGoalSettings>): Promise<any> {
  try {
    const res = await fetch('/api/user/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    if (res.ok) return res.json();
  } catch {}
  return { success: true, settings };
}

export async function addCustomWordRemote(word: VocabularyWord): Promise<any> {
  try {
    const res = await fetch('/api/user/custom-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(word) });
    if (res.ok) return res.json();
  } catch {}
  return { success: true, item: word };
}

export async function deleteCustomWordRemote(id: string): Promise<any> {
  try {
    const res = await fetch(`/api/user/custom-items/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) return res.json();
  } catch {}
  return { success: true, id };
}

export async function syncClientWithBackend(payload: { vocabulary?: VocabularyWord[]; stats?: UserStats | null; settings?: DailyGoalSettings | null; activeLanguage?: string }): Promise<any> {
  try {
    const res = await fetch('/api/user/migrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) return res.json();
  } catch {}
  return { success: true, localOnly: true };
}

export async function fetchVocabularyStats(): Promise<{ totalCount: number; reports: ContentAuditReport[] }> {
  const res = await fetch('/data/manifest.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error('Content manifest could not be loaded');
  const manifest = await res.json();
  const reports: ContentAuditReport[] = [];
  for (const lang of manifest.languages || []) {
    const data = await loadLanguage(lang.id);
    reports.push({ language: lang.id, totalItems: data.items.length, uniqueWords: new Set(data.items.map((i: LearningItem) => i.word)).size, phrases: data.items.filter((i: LearningItem) => i.itemType !== 'word').length, withExamples: data.items.filter((i: LearningItem) => i.examples?.length).length, withPronunciation: data.items.filter((i: LearningItem) => i.pronunciation).length, withLanguageSpecific: data.items.filter((i: LearningItem) => i.languageSpecific).length, duplicatesRejected: 0, validationErrors: 0 });
  }
  return { totalCount: manifest.totalItems, reports };
}

export function learningItemToVocabularyWord(item: LearningItem, existingWord?: Partial<VocabularyWord>): VocabularyWord {
  const effectiveLang: SupportedLanguageId = (item.languageVariant === 'zh-cmn' ? 'zh-cmn' : item.languageVariant === 'zh-yue' ? 'zh-yue' : (item.languageVariant as SupportedLanguageId) || (item.languageId === 'zh' ? 'zh-cmn' : (item.languageId as SupportedLanguageId)) || 'zh-cmn');
  return {
    id: item.id,
    languageId: effectiveLang,
    variantId: (item.languageVariant as SupportedLanguageId) || effectiveLang,
    word: item.word,
    traditionalWord: (item.languageSpecific as any)?.traditional || (item.languageSpecific as any)?.data?.traditional || undefined,
    phonetic: item.pronunciation,
    meaning: item.meaning,
    partOfSpeech: item.itemType === 'collocation' ? 'Expression' : item.itemType === 'phrase' ? 'Phrase' : item.itemType === 'question' || item.itemType === 'response' ? 'Expression' : (item.partOfSpeech as any) || 'Expression',
    category: (item.category as any) || 'Daily Essentials',
    level: item.difficulty || 'beginner',
    exampleSentence: { native: item.examples?.[0]?.native || `${item.word}.`, phonetic: item.examples?.[0]?.pronunciation, translation: item.examples?.[0]?.translation || item.meaning },
    status: existingWord?.status || item.status || 'new',
    streak: existingWord?.streak || item.streak || 0,
    reviewsCount: existingWord?.reviewsCount || item.reviewsCount || 0,
    lastPracticed: existingWord?.lastPracticed || item.lastPracticed,
    isBookmarked: existingWord?.isBookmarked || item.isBookmarked || false,
    memoryTip: item.memoryTip,
    culturalNote: item.culturalNote || item.culturalNotes,
  };
}
