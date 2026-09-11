/**
 * Database Schema and Type Definitions for Linguadaily
 * Powered by SQLite in WAL mode
 */

export interface DbLanguage {
  id: string; // e.g. 'zh', 'ja', 'es', 'fr', 'de', 'ko'
  name: string;
  native_name: string;
  family_id: string;
  default_variety_id: string;
  capabilities: string; // JSON string
  created_at?: string;
}

export interface DbLanguageVariety {
  id: string; // e.g. 'zh-cmn', 'zh-yue', 'ja-jp'
  language_id: string;
  name: string;
  native_name: string;
  region: string;
  default_writing_system: string;
  default_pronunciation_system: string;
  capabilities: string; // JSON string
  created_at?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  display_order: number;
}

export interface DbLearningItem {
  id: string;
  language_id: string;
  variety_id: string;
  item_type: string; // 'word' | 'phrase' | 'collocation' | 'idiom' | 'question' | 'response' | 'sentence'
  native_text: string;
  display_text: string;
  translation: string;
  definition?: string;
  pronunciation?: string;
  romanization?: string;
  pronunciation_system?: string;
  part_of_speech: string;
  category: string;
  subcategory?: string;
  difficulty: string; // 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced'
  difficulty_score: number;
  frequency_rank: number;
  frequency_band: string; // 'high' | 'medium' | 'low' | 'advanced'
  language_specific?: string; // JSON string
  memory_tip?: string;
  cultural_note?: string;
  audio_url?: string;
  tags?: string; // JSON string (string[])
  is_curated: number; // 1 or 0
  created_at?: string;
}

export interface DbItemExample {
  id: string;
  item_id: string;
  native_text: string;
  pronunciation?: string;
  translation: string;
  audio_url?: string;
  difficulty?: string;
}

export interface DbItemRelation {
  source_item_id: string;
  target_item_id: string;
  relation_type: string; // 'synonym' | 'antonym' | 'collocation' | 'variant' | 'related'
}

export interface DbUser {
  id: string;
  created_at: string;
  last_active_date: string;
}

export interface DbUserLanguageProgress {
  user_id: string;
  language_id: string;
  variety_id?: string;
  total_xp: number;
  streak_days: number;
  last_practiced_date: string;
  daily_history: string; // JSON: { [date]: count }
  skill_mastery: string; // JSON: { vocabulary, listening, speaking, reading, writing, grammar }
}

export interface DbUserLearningProgress {
  user_id: string;
  item_id: string;
  language_id: string;
  status: string; // 'new' | 'learning' | 'review' | 'mastered'
  streak: number;
  reviews_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  last_practiced_date?: string;
  last_rating?: string;
}

export interface DbUserBookmark {
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface DbUserPracticeLog {
  id: string;
  user_id: string;
  item_id?: string;
  language_id: string;
  activity_type: string; // 'flashcard' | 'quiz' | 'pronunciation' | 'sentence_studio' | 'tone'
  rating?: string;
  score?: number;
  xp_earned: number;
  created_at: string;
}

export interface DbCustomLearningItem {
  id: string;
  user_id: string;
  language_id: string;
  variety_id?: string;
  item_type: string;
  native_text: string;
  translation: string;
  pronunciation?: string;
  part_of_speech: string;
  category: string;
  notes?: string;
  created_at: string;
}

export interface DbUserSettings {
  user_id: string;
  target_words_per_day: number;
  speech_speed: number;
  auto_play_audio: number; // 1 or 0
  show_phonetic_by_default: number; // 1 or 0
  sound_effects: number; // 1 or 0
  preferred_writing_system: string;
  daily_lesson_goal: number;
  updated_at: string;
}

export const SCHEMA_SQL = `
-- Languages & Varieties
CREATE TABLE IF NOT EXISTS languages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  family_id TEXT NOT NULL,
  default_variety_id TEXT NOT NULL,
  capabilities TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS language_varieties (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  region TEXT NOT NULL,
  default_writing_system TEXT NOT NULL,
  default_pronunciation_system TEXT NOT NULL,
  capabilities TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE
);

-- Global Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  display_order INTEGER DEFAULT 100
);

-- Core Learning Items (Scalable to 100,000+ items)
CREATE TABLE IF NOT EXISTS learning_items (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL,
  variety_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  native_text TEXT NOT NULL,
  display_text TEXT NOT NULL,
  translation TEXT NOT NULL,
  definition TEXT,
  pronunciation TEXT,
  romanization TEXT,
  pronunciation_system TEXT,
  part_of_speech TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  difficulty TEXT NOT NULL,
  difficulty_score INTEGER DEFAULT 10,
  frequency_rank INTEGER DEFAULT 9999,
  frequency_band TEXT NOT NULL,
  language_specific TEXT,
  memory_tip TEXT,
  cultural_note TEXT,
  audio_url TEXT,
  tags TEXT,
  is_curated INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries across 100,000+ items
CREATE INDEX IF NOT EXISTS idx_learning_items_lang ON learning_items(language_id, variety_id);
CREATE INDEX IF NOT EXISTS idx_learning_items_cat ON learning_items(language_id, category);
CREATE INDEX IF NOT EXISTS idx_learning_items_diff ON learning_items(language_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_items_freq ON learning_items(language_id, frequency_rank);
CREATE INDEX IF NOT EXISTS idx_learning_items_type ON learning_items(language_id, item_type);
CREATE INDEX IF NOT EXISTS idx_learning_items_native ON learning_items(language_id, native_text);

-- Item Examples
CREATE TABLE IF NOT EXISTS item_examples (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  native_text TEXT NOT NULL,
  pronunciation TEXT,
  translation TEXT NOT NULL,
  audio_url TEXT,
  difficulty TEXT,
  FOREIGN KEY (item_id) REFERENCES learning_items(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_examples_item ON item_examples(item_id);

-- Item Relations
CREATE TABLE IF NOT EXISTS item_relations (
  source_item_id TEXT NOT NULL,
  target_item_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  PRIMARY KEY (source_item_id, target_item_id, relation_type)
);

-- User Profiles (Default internal local-user)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active_date TEXT NOT NULL
);

-- User Language Aggregate Progress
CREATE TABLE IF NOT EXISTS user_language_progress (
  user_id TEXT NOT NULL,
  language_id TEXT NOT NULL,
  variety_id TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  last_practiced_date TEXT NOT NULL,
  daily_history TEXT NOT NULL,
  skill_mastery TEXT NOT NULL,
  PRIMARY KEY (user_id, language_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Learning Progress (SRS per item)
CREATE TABLE IF NOT EXISTS user_learning_progress (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  language_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  streak INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  next_review_date TEXT NOT NULL,
  last_practiced_date TEXT,
  last_rating TEXT,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_srs_due ON user_learning_progress(user_id, language_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_user_srs_status ON user_learning_progress(user_id, language_id, status);

-- User Bookmarks
CREATE TABLE IF NOT EXISTS user_bookmarks (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Practice Event Logs
CREATE TABLE IF NOT EXISTS user_practice_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id TEXT,
  language_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  rating TEXT,
  score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_practice_logs_user ON user_practice_logs(user_id, created_at);

-- Custom Learning Items (User-authored)
CREATE TABLE IF NOT EXISTS custom_learning_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  language_id TEXT NOT NULL,
  variety_id TEXT,
  item_type TEXT NOT NULL DEFAULT 'word',
  native_text TEXT NOT NULL,
  translation TEXT NOT NULL,
  pronunciation TEXT,
  part_of_speech TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  target_words_per_day INTEGER DEFAULT 10,
  speech_speed REAL DEFAULT 0.9,
  auto_play_audio INTEGER DEFAULT 1,
  show_phonetic_by_default INTEGER DEFAULT 1,
  sound_effects INTEGER DEFAULT 1,
  preferred_writing_system TEXT DEFAULT 'simplified',
  daily_lesson_goal INTEGER DEFAULT 10,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;
