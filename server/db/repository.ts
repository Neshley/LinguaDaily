import {
  ContentAuditReport,
  LearningItem,
  VocabularyQuery,
  VocabularyQueryResult,
} from '../types/vocabulary';
import { generateIdentityKey, normalizeString, validateLearningItem } from './validator';

export class VocabularyRepository {
  private itemsById = new Map<string, LearningItem>();
  private itemsByIdentity = new Map<string, string>(); // identityKey -> id
  private itemsByLanguage = new Map<string, string[]>(); // languageCode -> id[]

  // Statistics
  private duplicatesRejected = new Map<string, number>();
  private validationErrors = new Map<string, number>();

  constructor() {}

  /**
   * Insert or update an item idempotently.
   * Returns true if item was accepted and stored, false if rejected.
   */
  public insertOrUpdate(item: LearningItem): boolean {
    const lang = item.languageVariant || item.languageId;
    const validation = validateLearningItem(item);

    if (!validation.isValid) {
      const currentValErrors = this.validationErrors.get(lang) || 0;
      this.validationErrors.set(lang, currentValErrors + 1);
      return false;
    }

    const identityKey = generateIdentityKey(item);
    const existingId = this.itemsByIdentity.get(identityKey);

    // If an item with the exact identity exists with a DIFFERENT ID, it is a duplicate
    if (existingId && existingId !== item.id) {
      const currentDupes = this.duplicatesRejected.get(lang) || 0;
      this.duplicatesRejected.set(lang, currentDupes + 1);
      return false;
    }

    // Store item
    this.itemsById.set(item.id, item);
    this.itemsByIdentity.set(identityKey, item.id);

    // Track by language code and language variant
    const langKeys = [item.languageId, item.languageVariant].filter(Boolean);
    for (const key of langKeys) {
      if (!this.itemsByLanguage.has(key)) {
        this.itemsByLanguage.set(key, []);
      }
      const list = this.itemsByLanguage.get(key)!;
      if (!list.includes(item.id)) {
        list.push(item.id);
      }
    }

    return true;
  }

  /**
   * Bulk insert an array of items.
   */
  public bulkInsert(items: LearningItem[]): { accepted: number; rejected: number } {
    let accepted = 0;
    let rejected = 0;
    for (const it of items) {
      if (this.insertOrUpdate(it)) {
        accepted++;
      } else {
        rejected++;
      }
    }
    return { accepted, rejected };
  }

  /**
   * Retrieve item by ID
   */
  public getById(id: string): LearningItem | undefined {
    return this.itemsById.get(id);
  }

  /**
   * Count total items
   */
  public get totalCount(): number {
    return this.itemsById.size;
  }

  /**
   * Search and filter vocabulary with pagination
   */
  public query(query: VocabularyQuery): VocabularyQueryResult {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 30));

    // 1. Initial pool based on language
    let candidateIds: string[] = [];
    if (query.language) {
      candidateIds = this.itemsByLanguage.get(query.language) || [];
      // Fallback for 'zh' -> 'zh-cmn'
      if (candidateIds.length === 0 && query.language === 'zh') {
        candidateIds = this.itemsByLanguage.get('zh-cmn') || [];
      } else if (candidateIds.length === 0 && query.language === 'zh-cmn') {
        candidateIds = this.itemsByLanguage.get('zh') || [];
      }
    } else {
      candidateIds = Array.from(this.itemsById.keys());
    }

    const normalizedQuery = query.q ? normalizeString(query.q) : '';

    // 2. Filter candidate pool
    const matchedItems: LearningItem[] = [];
    const categoryCounts = new Map<string, number>();
    const difficultyCounts = new Map<string, number>();
    const frequencyCounts = new Map<string, number>();
    const itemTypeCounts = new Map<string, number>();

    for (const id of candidateIds) {
      const item = this.itemsById.get(id);
      if (!item) continue;

      // Filter: Category
      if (query.category && query.category !== 'All Categories' && item.category !== query.category) {
        continue;
      }

      // Filter: Difficulty
      if (query.difficulty && query.difficulty !== 'all' && item.difficulty !== query.difficulty) {
        continue;
      }

      // Filter: Frequency band
      if (query.frequencyBand && query.frequencyBand !== 'all' && item.frequencyBand !== query.frequencyBand) {
        continue;
      }

      // Filter: Item type
      if (query.itemType && query.itemType !== 'all' && item.itemType !== query.itemType) {
        continue;
      }

      // Filter: Text Search across word, pronunciation, meaning, secondaryMeanings, tags
      if (normalizedQuery) {
        const wordNorm = normalizeString(item.word);
        const pronNorm = normalizeString(item.pronunciation);
        const meaningNorm = normalizeString(item.meaning);
        const secMeaningsNorm = item.secondaryMeanings ? item.secondaryMeanings.map(normalizeString).join(' ') : '';
        const tagsNorm = item.tags ? item.tags.map(normalizeString).join(' ') : '';

        const isMatch =
          wordNorm.includes(normalizedQuery) ||
          pronNorm.includes(normalizedQuery) ||
          meaningNorm.includes(normalizedQuery) ||
          secMeaningsNorm.includes(normalizedQuery) ||
          tagsNorm.includes(normalizedQuery);

        if (!isMatch) continue;
      }

      matchedItems.push(item);

      // Aggregates
      categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
      difficultyCounts.set(item.difficulty, (difficultyCounts.get(item.difficulty) || 0) + 1);
      frequencyCounts.set(item.frequencyBand, (frequencyCounts.get(item.frequencyBand) || 0) + 1);
      itemTypeCounts.set(item.itemType, (itemTypeCounts.get(item.itemType) || 0) + 1);
    }

    // 3. Sort
    if (query.sortBy === 'frequency') {
      matchedItems.sort((a, b) => a.frequencyRank - b.frequencyRank);
    } else if (query.sortBy === 'difficulty') {
      matchedItems.sort((a, b) => a.difficultyScore - b.difficultyScore);
    } else if (query.sortBy === 'alphabetical') {
      matchedItems.sort((a, b) => a.word.localeCompare(b.word));
    } else if (query.sortBy === 'random') {
      // Deterministic shuffle for preview
      matchedItems.sort(() => Math.random() - 0.5);
    } else {
      // Default: High frequency first
      matchedItems.sort((a, b) => a.frequencyRank - b.frequencyRank);
    }

    // 4. Paginate
    const total = matchedItems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = matchedItems.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      filters: {
        categories: Array.from(categoryCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        difficulties: Array.from(difficultyCounts.entries())
          .map(([name, count]) => ({ name, count })),
        frequencyBands: Array.from(frequencyCounts.entries())
          .map(([name, count]) => ({ name, count })),
        itemTypes: Array.from(itemTypeCounts.entries())
          .map(([name, count]) => ({ name, count })),
      },
    };
  }

  /**
   * Get random sample of items
   */
  public getRandom(
    language: string,
    count: number = 10,
    category?: string,
    difficulty?: string
  ): LearningItem[] {
    const langIds = this.itemsByLanguage.get(language) || this.itemsByLanguage.get('zh-cmn') || [];
    let pool = langIds.map((id) => this.itemsById.get(id)!).filter(Boolean);

    if (category && category !== 'All Categories') {
      pool = pool.filter((i) => i.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      pool = pool.filter((i) => i.difficulty === difficulty);
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get curated recommendations based on intent
   */
  public getRecommendations(
    language: string,
    currentBand: string = 'high',
    strategy: string = 'expand_core',
    limit: number = 10
  ): LearningItem[] {
    const langIds = this.itemsByLanguage.get(language) || this.itemsByLanguage.get('zh-cmn') || [];
    const pool = langIds.map((id) => this.itemsById.get(id)!).filter(Boolean);

    const type = strategy || currentBand;
    switch (type) {
      case 'popular':
      case 'beginner':
        return pool
          .filter((i) => i.difficulty === 'beginner' || i.frequencyBand === 'high')
          .sort((a, b) => a.frequencyRank - b.frequencyRank)
          .slice(0, limit);

      case 'travel':
        return pool
          .filter(
            (i) =>
              i.category.toLowerCase().includes('travel') ||
              i.category.toLowerCase().includes('transport') ||
              i.category.toLowerCase().includes('direction')
          )
          .slice(0, limit);

      case 'food':
        return pool
          .filter((i) => i.category.toLowerCase().includes('food') || i.category.toLowerCase().includes('restaurant'))
          .slice(0, limit);

      case 'verbs':
        return pool
          .filter((i) => i.partOfSpeech.toLowerCase().includes('verb'))
          .sort((a, b) => a.frequencyRank - b.frequencyRank)
          .slice(0, limit);

      case 'phrases':
        return pool
          .filter((i) => i.itemType === 'phrase' || i.itemType === 'collocation' || i.itemType === 'question')
          .slice(0, limit);

      case 'expand_core':
        return pool
          .filter((i) => (currentBand === 'high' ? i.frequencyBand === 'medium' : i.frequencyBand === currentBand))
          .sort((a, b) => a.frequencyRank - b.frequencyRank)
          .slice(0, limit);

      default:
        return pool.sort((a, b) => a.frequencyRank - b.frequencyRank).slice(0, limit);
    }
  }

  /**
   * Produce comprehensive content audit report per language
   */
  public getAuditReports(): ContentAuditReport[] {
    const languages = ['zh-cmn', 'ja', 'es', 'fr', 'de', 'ko'];
    const reports: ContentAuditReport[] = [];

    for (const lang of languages) {
      const ids = this.itemsByLanguage.get(lang) || [];
      const items = ids.map((id) => this.itemsById.get(id)!).filter(Boolean);

      const uniqueWords = new Set(items.map((i) => normalizeString(i.word))).size;
      const phrases = items.filter((i) => i.itemType !== 'word').length;
      const withExamples = items.filter((i) => i.examples && i.examples.length > 0).length;
      const withPronunciation = items.filter((i) => Boolean(i.pronunciation)).length;
      const withLanguageSpecific = items.filter((i) => Boolean(i.languageSpecific)).length;

      reports.push({
        language: lang,
        totalItems: items.length,
        uniqueWords,
        phrases,
        withExamples,
        withPronunciation,
        withLanguageSpecific,
        duplicatesRejected: this.duplicatesRejected.get(lang) || 0,
        validationErrors: this.validationErrors.get(lang) || 0,
      });
    }

    return reports;
  }
}

// Global singleton instance for the server runtime
export const globalVocabularyRepo = new VocabularyRepository();
