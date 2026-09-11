export type SupportedLanguageId = 'zh' | 'zh-cmn' | 'zh-yue' | 'zh-wuu' | 'zh-nan' | 'ja' | 'es' | 'fr' | 'de' | 'ko';

export type LanguageFamilyId = 'sinitic' | 'japonic' | 'koreanic' | 'romance' | 'germanic';

export interface LanguageCapabilities {
  supportsTones: boolean;
  supportsCharacterWriting: boolean;
  supportsMultipleScripts: boolean;
  supportsRomanization: boolean;
  supportsStrokeOrder: boolean;
  supportsPronunciationAssessment: boolean;
  supportsGender: boolean;
  supportsConjugation: boolean;
  supportsPitchAccent?: boolean;
  supportsHonorifics?: boolean;
}

export interface WritingSystem {
  id: string;
  name: string;
  nativeName: string;
  scriptType: 'hanzi-simplified' | 'hanzi-traditional' | 'kanji-kana' | 'hangul' | 'latin' | 'other';
  sampleChar: string;
  description: string;
}

export interface ToneDefinition {
  id: number | string;
  number: number;
  name: string;
  contour: string; // e.g. "5 → 5" or "3 → 5"
  description: string;
  colorClass: {
    text: string;
    bg: string;
    border: string;
  };
  sampleWord: {
    word: string;
    romanization: string;
    meaning: string;
  };
}

export interface PronunciationSystem {
  id: string;
  name: string;
  type: 'tonal' | 'pitch-accent' | 'phonetic';
  tones?: ToneDefinition[];
  description: string;
}

export interface RegionalVariant {
  id: string;
  name: string;
  flag: string;
  notes: string;
}

export interface ProficiencyFramework {
  id: 'hsk' | 'cefr' | 'jlpt' | 'topik' | 'actfl' | 'custom';
  name: string;
  levels: string[];
}

export interface LanguageVariant {
  id: SupportedLanguageId;
  familyId: LanguageFamilyId;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  fallbackSpeechCodes?: string[];
  capabilities: LanguageCapabilities;
  writingSystems: WritingSystem[];
  defaultWritingSystemId: string;
  pronunciationSystems: PronunciationSystem[];
  defaultPronunciationSystemId: string;
  regionalVariants: RegionalVariant[];
  proficiencyFramework: ProficiencyFramework;
  description: string;
}

export interface LanguageFamily {
  id: LanguageFamilyId;
  name: string;
  nativeName: string;
  description: string;
  icon: string;
  varieties: LanguageVariant[];
}

// Backward compatible LanguageMeta
export interface LanguageMeta {
  id: SupportedLanguageId;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  scriptName: string;
  levels: string[];
  toneSupport: boolean;
  description: string;
  capabilities?: LanguageCapabilities;
  familyId?: LanguageFamilyId;
}

export interface ToneInfo {
  syllable: string;
  tone: 1 | 2 | 3 | 4 | 5 | 6 | 0; // 0 is neutral, up to 6 for Cantonese
  toneName?: string;
}

export interface ExampleSentence {
  native: string;
  phonetic?: string;
  translation: string;
  breakdown?: { word: string; meaning: string }[];
}

export interface CharacterDetail {
  radicals?: string;
  strokeCount?: number;
  components?: string[];
  literalBreakdown?: string;
  strokeOrder?: string[];
}

export type MasteryStatus = 'new' | 'learning' | 'review' | 'mastered';

export interface VocabularyWord {
  id: string;
  languageId: SupportedLanguageId;
  familyId?: LanguageFamilyId;
  variantId?: SupportedLanguageId;
  word: string;
  traditionalWord?: string;
  phonetic: string; // romanization (Pinyin, Jyutping, Romaji, etc.)
  pronunciationSystemId?: string;
  toneBreakdown?: ToneInfo[];
  meaning: string;
  partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Greeting' | 'Phrase' | 'Adverb' | 'Expression' | 'Particle' | 'Measure Word';
  category: 'Daily Essentials' | 'Food & Drink' | 'Travel & Places' | 'Social & Feelings' | 'Work & Study' | 'Time & Numbers' | 'Culture & Customs';
  level: string;
  characterDetail?: CharacterDetail;
  exampleSentence: ExampleSentence;
  additionalSentences?: ExampleSentence[];
  memoryTip?: string;
  culturalNote?: string;
  regionalUsage?: string;
  isCustom?: boolean;
  // User mastery and SRS tracking
  status: MasteryStatus;
  streak: number;
  reviewsCount: number;
  lastPracticed?: string;
  nextReviewDate?: string;
  isBookmarked?: boolean;
}

export type MainNavigationTab =
  | 'home'
  | 'learn'
  | 'practice'
  | 'review'
  | 'explore'
  | 'progress'
  | 'wordbank';

// Backward compatibility alias for PracticeTab
export type PracticeTab =
  | 'daily'
  | 'home'
  | 'learn'
  | 'course'
  | 'flashcards'
  | 'quiz'
  | 'pronounce'
  | 'grammar'
  | 'stories'
  | 'analytics'
  | 'ai-tutor'
  | 'wordbank'
  | 'read'
  | 'write'
  | 'listen'
  | 'review'
  | 'explore'
  | 'progress';

export interface DailyGoalSettings {
  targetWordsPerDay: number;
  speechSpeed: number; // 0.75, 0.9, or 1.0
  autoPlayAudio: boolean;
  showPhoneticByDefault: boolean;
  soundEffects: boolean;
  preferredWritingSystem?: string; // 'simplified' | 'traditional'
  dailyLessonGoal: number; // in minutes
}

export interface SkillMastery {
  vocabulary: number; // 0-100
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  grammar: number;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  totalWordsPracticed: number;
  xp: number;
  todayPracticedIds: string[];
  historyByDate: Record<string, number>; // date "YYYY-MM-DD" -> count
  completedLessonIds?: string[];
  skillMastery?: SkillMastery;
  totalXp?: number;
  todayPracticedWords?: string[];
  dailyHistory?: Record<string, number>;
  totalWordsLearned?: number;
}

export interface QuizQuestion {
  id: string;
  word: VocabularyWord;
  type: 'meaning-to-word' | 'word-to-meaning' | 'tone-check' | 'listening';
  questionPrompt: string;
  audioText?: string;
  options: {
    id: string;
    text: string;
    subText?: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

export interface GeminiWordExplanation {
  etymologyOrMnemonic: string;
  culturalContext: string;
  tonesOrPronunciationTip: string;
  sentences: {
    native: string;
    romanization: string;
    translation: string;
  }[];
  synonymsOrRelated?: {
    word: string;
    translation: string;
  }[];
}

// Course and Lesson interfaces
export interface LessonExercise {
  id: string;
  type: 'multiple-choice' | 'tone-identify' | 'sentence-arrange' | 'listening-comprehension' | 'speaking-drill';
  prompt: string;
  audioText?: string;
  targetWord?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  tokens?: string[];
}

export interface LessonDialogueTurn {
  speaker: string;
  avatar?: string;
  native: string;
  romanization: string;
  translation: string;
  audioText?: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  vocabulary: VocabularyWord[];
  grammarPoints?: GrammarPoint[];
  dialogue?: LessonDialogueTurn[];
  exercises: LessonExercise[];
  culturalInsight?: string;
}

export interface CourseUnit {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  icon: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  languageVariantId: SupportedLanguageId;
  title: string;
  level: string;
  description: string;
  badge: string;
  units: CourseUnit[];
}

// Grammar and Reading interfaces
export interface GrammarPoint {
  id: string;
  languageVariantId: SupportedLanguageId;
  title: string;
  structure: string;
  explanation: string;
  level: string;
  category: string;
  examples: ExampleSentence[];
  commonMistakes?: string;
  culturalNuance?: string;
}

export interface StorySentence {
  native: string;
  romanization: string;
  translation: string;
}

export interface GradedStory {
  id: string;
  languageVariantId: SupportedLanguageId;
  title: string;
  titleRomanization: string;
  titleTranslation: string;
  level: string;
  topic: string;
  audioText: string;
  paragraphs: StorySentence[][];
  vocabularyHighlights: {
    word: string;
    romanization: string;
    meaning: string;
  }[];
  comprehensionQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface ActiveLanguageState {
  familyId: LanguageFamilyId;
  variantId: SupportedLanguageId;
  regionalVariantId?: string;
  writingSystemId: string;
  pronunciationSystemId: string;
}

