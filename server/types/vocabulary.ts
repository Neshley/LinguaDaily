export type LanguageDifficulty =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper-intermediate'
  | 'advanced';

export type FrequencyBand = 'high' | 'medium' | 'low';

export type ItemType =
  | 'word'
  | 'phrase'
  | 'collocation'
  | 'question'
  | 'response'
  | 'idiom'
  | 'sentence';

export interface ExampleSentence {
  native: string;
  pronunciation?: string;
  translation: string;
  context?: string;
}

export interface MandarinSpecificMeta {
  simplified: string;
  traditional?: string;
  pinyin: string;
  tones: number[];
  toneSandhi?: string;
  measureWord?: string;
  hskLevel?: string;
  characterComponents?: string;
}

export interface JapaneseSpecificMeta {
  kanji?: string;
  hiragana: string;
  katakana?: string;
  romaji: string;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  politenessLevel?: 'plain' | 'polite' | 'honorific' | 'humble';
  pitchAccent?: string;
}

export interface KoreanSpecificMeta {
  hangul: string;
  revisedRomanization: string;
  speechLevel?: 'informal-low' | 'informal-polite' | 'formal-polite';
  topikLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface SpanishSpecificMeta {
  gender?: 'masculine' | 'feminine';
  article?: 'el' | 'la' | 'los' | 'las' | 'un' | 'una';
  plural?: string;
  verbType?: '-ar' | '-er' | '-ir' | 'irregular';
  regionalVariant?: 'Universal' | 'Spain' | 'Latin America';
}

export interface FrenchSpecificMeta {
  gender?: 'masculine' | 'feminine';
  article?: 'le' | 'la' | "l'" | 'les' | 'un' | 'une';
  plural?: string;
  liaisonHint?: boolean;
  verbGroup?: 1 | 2 | 3;
}

export interface GermanSpecificMeta {
  gender?: 'masculine' | 'feminine' | 'neuter';
  article?: 'der' | 'die' | 'das';
  plural?: string;
  verbType?: 'weak' | 'strong' | 'separable';
  separablePrefix?: string;
  caseGoverned?: 'accusative' | 'dative' | 'genitive';
}

export type LanguageSpecificMeta =
  | { type: 'mandarin'; data: MandarinSpecificMeta }
  | { type: 'cantonese'; data: Record<string, any> }
  | { type: 'japanese'; data: JapaneseSpecificMeta }
  | { type: 'korean'; data: KoreanSpecificMeta }
  | { type: 'spanish'; data: SpanishSpecificMeta }
  | { type: 'french'; data: FrenchSpecificMeta }
  | { type: 'german'; data: GermanSpecificMeta }
  | { type: 'generic'; data: Record<string, any> };

export interface LearningItem {
  id: string;
  languageId: string;
  languageVariant: string;
  word: string;
  meaning: string;
  secondaryMeanings?: string[];
  definition?: string;
  partOfSpeech: string;
  category: string;
  subcategory?: string;
  difficulty: LanguageDifficulty;
  difficultyScore: number; // 1 - 100
  frequencyRank: number; // 1 - 10000+
  frequencyBand: FrequencyBand;
  itemType: ItemType;
  pronunciation?: string;
  pronunciationSystem?: string;
  examples: ExampleSentence[];
  languageSpecific?: LanguageSpecificMeta;
  tags?: string[];
  usageNotes?: string;
  culturalNotes?: string;
  culturalNote?: string;
  memoryTip?: string;
  audioUrl?: string;
  contentQuality?: ContentQuality;

  // Dynamic user progress attributes
  isBookmarked?: boolean;
  status?: 'new' | 'learning' | 'review' | 'mastered';
  streak?: number;
  reviewsCount?: number;
  lastPracticed?: string;
  isCustom?: boolean;
  isCurated?: boolean;
}

export type ContentQualityTier = 'seed-curated' | 'generated-pattern';

export interface ContentQuality {
  tier: ContentQualityTier;
  status: 'seed-review-required' | 'needs-review';
  score: number;
  trustedForCoreLearning: boolean;
  source: string;
}

export interface VocabularyQuery {
  language?: string;
  languageVariant?: string;
  category?: string;
  difficulty?: string;
  frequencyBand?: string;
  itemType?: string;
  q?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'frequency' | 'difficulty' | 'alphabetical' | 'random' | 'frequencyRank' | 'word';
  sortDirection?: 'asc' | 'desc';
  bookmarkedOnly?: boolean;
  statusFilter?: string;
}

export interface VocabularyQueryResult {
  items: LearningItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  filters: {
    categories: { name: string; count: number }[];
    difficulties: { name: string; count: number }[];
    frequencyBands: { name: string; count: number }[];
    itemTypes: { name: string; count: number }[];
  };
}

export interface ContentAuditReport {
  language: string;
  totalItems: number;
  uniqueWords: number;
  phrases: number;
  withExamples: number;
  withPronunciation: number;
  withLanguageSpecific: number;
  duplicatesRejected: number;
  validationErrors: number;
}
