import { LearningItem, VocabularyQueryResult, ContentAuditReport } from '../../server/types/vocabulary';
import { SupportedLanguageId, VocabularyWord } from '../types';

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
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.sortBy) query.set('sortBy', params.sortBy);

  const res = await fetch(`/api/vocabulary?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to query vocabulary: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchRandomVocabulary(
  language: string,
  count = 10,
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
  return {
    id: item.id,
    languageId: (item.languageId as SupportedLanguageId) || 'zh',
    variantId: (item.languageVariant as SupportedLanguageId) || (item.languageId as SupportedLanguageId),
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
      native: item.examples[0]?.native || `${item.word}.`,
      phonetic: item.examples[0]?.pronunciation,
      translation: item.examples[0]?.translation || item.meaning,
    },
    status: existingWord?.status || 'new',
    streak: existingWord?.streak || 0,
    reviewsCount: existingWord?.reviewsCount || 0,
    lastPracticed: existingWord?.lastPracticed,
    nextReviewDate: existingWord?.nextReviewDate,
    isBookmarked: existingWord?.isBookmarked || false,
  };
}
