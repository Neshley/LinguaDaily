/**
 * SQLite-backed Vocabulary & Learning Content Repository
 * High-performance, persistent, with Spaced Repetition (SRS) engine and User Progress tracking.
 */

import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './connection';
import {
  ContentAuditReport,
  LearningItem,
  VocabularyQuery,
  VocabularyQueryResult,
} from '../types/vocabulary';
import { generateIdentityKey, validateLearningItem } from './validator';

export interface PracticeSubmission {
  itemId: string;
  languageId: string;
  activityType: 'flashcard' | 'quiz' | 'pronunciation' | 'sentence_studio' | 'tone';
  rating?: 'again' | 'hard' | 'good' | 'easy';
  score?: number;
  userId?: string;
}

export interface ClientMigrationPayload {
  vocabulary?: Array<{
    id: string;
    word: string;
    meaning: string;
    pronunciation?: string;
    partOfSpeech?: string;
    category?: string;
    languageId: string;
    isCustom?: boolean;
    isBookmarked?: boolean;
    status?: 'new' | 'learning' | 'review' | 'mastered';
    streak?: number;
    reviewsCount?: number;
    lastPracticed?: string;
  }>;
  stats?: {
    xp?: number;
    totalXp?: number;
    streakDays?: number;
    historyByDate?: Record<string, number>;
    dailyHistory?: Record<string, number>;
    skillMastery?: Record<string, number>;
  };
  settings?: Record<string, any>;
  activeLanguage?: string;
}

export class VocabularyRepository {
  private db: DatabaseSync;

  constructor() {
    this.db = getDatabase();
  }

  public get totalCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM learning_items').get() as { count: number };
    return row ? Number(row.count) : 0;
  }

  /**
   * Helper to build SQL condition for language / variety matching.
   * Accurately routes 'zh', 'zh-cmn', 'zh-yue', 'ja', 'es', 'fr', 'de', 'ko', etc.
   */
  public buildLanguageCondition(language: string, prefix: string = 'li'): { sql: string; params: any[] } {
    const colLang = prefix ? `${prefix}.language_id` : 'language_id';
    const colVar = prefix ? `${prefix}.variety_id` : 'variety_id';

    if (!language || language === 'all') {
      return { sql: '1=1', params: [] };
    }

    if (language === 'zh' || language === 'chinese') {
      return {
        sql: `(${colLang} = ? OR ${colVar} IN (?, ?))`,
        params: ['zh', 'zh-cmn', 'zh-yue'],
      };
    } else if (language === 'zh-cmn') {
      return {
        sql: `(${colVar} = ? OR (${colLang} = ? AND (${colVar} IS NULL OR ${colVar} = ?)))`,
        params: ['zh-cmn', 'zh', 'zh-cmn'],
      };
    } else if (language === 'zh-yue') {
      return {
        sql: `(${colVar} = ? OR (${colLang} = ? AND ${colVar} = ?))`,
        params: ['zh-yue', 'zh', 'zh-yue'],
      };
    } else {
      return {
        sql: `(${colLang} = ? OR ${colVar} = ?)`,
        params: [language, language],
      };
    }
  }

  /**
   * Insert or update a learning item and its examples idempotently
   */
  public insertOrUpdate(item: LearningItem): boolean {
    const validation = validateLearningItem(item);
    if (!validation.isValid) {
      return false;
    }

    const stmt = this.db.prepare(`
      INSERT INTO learning_items (
        id, language_id, variety_id, item_type, native_text, display_text,
        translation, definition, pronunciation, romanization, pronunciation_system,
        part_of_speech, category, subcategory, difficulty, difficulty_score,
        frequency_rank, frequency_band, language_specific, memory_tip, cultural_note,
        audio_url, tags, is_curated
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, 1
      )
      ON CONFLICT(id) DO UPDATE SET
        native_text = excluded.native_text,
        display_text = excluded.display_text,
        translation = excluded.translation,
        pronunciation = excluded.pronunciation,
        romanization = excluded.romanization,
        part_of_speech = excluded.part_of_speech,
        category = excluded.category,
        difficulty = excluded.difficulty,
        difficulty_score = excluded.difficulty_score,
        frequency_rank = excluded.frequency_rank,
        frequency_band = excluded.frequency_band,
        language_specific = excluded.language_specific
    `);

    stmt.run(
      item.id,
      item.languageId,
      item.languageVariant || item.languageId,
      item.itemType || 'word',
      item.word,
      item.word,
      item.meaning,
      item.definition || null,
      item.pronunciation || null,
      item.pronunciation || null,
      item.pronunciationSystem || null,
      item.partOfSpeech || 'Noun',
      item.category || 'General',
      item.subcategory || null,
      item.difficulty || 'beginner',
      item.difficultyScore || 10,
      item.frequencyRank || 9999,
      item.frequencyBand || 'medium',
      item.languageSpecific ? JSON.stringify(item.languageSpecific) : null,
      item.memoryTip || null,
      item.culturalNote || null,
      item.audioUrl || null,
      item.tags ? JSON.stringify(item.tags) : JSON.stringify([])
    );

    if (item.examples && item.examples.length > 0) {
      const exStmt = this.db.prepare(`
        INSERT OR REPLACE INTO item_examples (
          id, item_id, native_text, pronunciation, translation
        ) VALUES (?, ?, ?, ?, ?)
      `);
      item.examples.forEach((ex, idx) => {
        exStmt.run(
          `${item.id}-ex-${idx + 1}`,
          item.id,
          ex.native,
          ex.pronunciation || null,
          ex.translation
        );
      });
    }

    return true;
  }

  /**
   * Bulk insert items in a high-speed transaction
   */
  public bulkInsert(items: LearningItem[]): { accepted: number; rejected: number } {
    let accepted = 0;
    let rejected = 0;

    const itemStmt = this.db.prepare(`
      INSERT INTO learning_items (
        id, language_id, variety_id, item_type, native_text, display_text,
        translation, definition, pronunciation, romanization, pronunciation_system,
        part_of_speech, category, subcategory, difficulty, difficulty_score,
        frequency_rank, frequency_band, language_specific, memory_tip, cultural_note,
        audio_url, tags, is_curated
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, 1
      )
      ON CONFLICT(id) DO UPDATE SET
        native_text = excluded.native_text,
        display_text = excluded.display_text,
        translation = excluded.translation,
        pronunciation = excluded.pronunciation,
        romanization = excluded.romanization,
        part_of_speech = excluded.part_of_speech,
        category = excluded.category,
        difficulty = excluded.difficulty,
        difficulty_score = excluded.difficulty_score,
        frequency_rank = excluded.frequency_rank,
        frequency_band = excluded.frequency_band,
        language_specific = excluded.language_specific
    `);

    const exStmt = this.db.prepare(`
      INSERT OR REPLACE INTO item_examples (
        id, item_id, native_text, pronunciation, translation
      ) VALUES (?, ?, ?, ?, ?)
    `);

    this.db.exec('BEGIN TRANSACTION;');
    try {
      for (const item of items) {
        try {
          itemStmt.run(
            item.id,
            item.languageId,
            item.languageVariant || item.languageId,
            item.itemType || 'word',
            item.word,
            item.word,
            item.meaning,
            item.definition || null,
            item.pronunciation || null,
            item.pronunciation || null,
            item.pronunciationSystem || null,
            item.partOfSpeech || 'Noun',
            item.category || 'General',
            item.subcategory || null,
            item.difficulty || 'beginner',
            item.difficultyScore || 10,
            item.frequencyRank || 9999,
            item.frequencyBand || 'medium',
            item.languageSpecific ? JSON.stringify(item.languageSpecific) : null,
            item.memoryTip || null,
            item.culturalNote || null,
            item.audioUrl || null,
            item.tags ? JSON.stringify(item.tags) : JSON.stringify([])
          );

          if (item.examples && item.examples.length > 0) {
            item.examples.forEach((ex, idx) => {
              exStmt.run(
                `${item.id}-ex-${idx + 1}`,
                item.id,
                ex.native,
                ex.pronunciation || null,
                ex.translation
              );
            });
          }

          accepted++;
        } catch {
          rejected++;
        }
      }
      this.db.exec('COMMIT;');
    } catch (e) {
      this.db.exec('ROLLBACK;');
      throw e;
    }

    return { accepted, rejected };
  }

  /**
   * Get single item by ID with examples and user metadata
   */
  public getById(id: string, userId: string = 'local-learner'): LearningItem | null {
    const itemStmt = this.db.prepare(`
      SELECT li.*,
        CASE WHEN ub.item_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
        COALESCE(ulp.status, 'new') as user_status,
        COALESCE(ulp.streak, 0) as user_streak,
        COALESCE(ulp.reviews_count, 0) as user_reviews_count,
        ulp.last_practiced_date as user_last_practiced
      FROM learning_items li
      LEFT JOIN user_bookmarks ub ON ub.item_id = li.id AND ub.user_id = ?
      LEFT JOIN user_learning_progress ulp ON ulp.item_id = li.id AND ulp.user_id = ?
      WHERE li.id = ?
    `);

    const row: any = itemStmt.get(userId, userId, id);
    if (!row) {
      // Check custom items
      const customStmt = this.db.prepare('SELECT * FROM custom_learning_items WHERE id = ?');
      const cRow: any = customStmt.get(id);
      if (cRow) {
        return this.mapCustomRowToItem(cRow);
      }
      return null;
    }

    return this.mapRowToLearningItem(row);
  }

  /**
   * Query items with pagination, filtering, search, and user state
   */
  public query(params: VocabularyQuery, userId: string = 'local-learner'): VocabularyQueryResult {
    const {
      language,
      languageVariant,
      category,
      difficulty,
      frequencyBand,
      itemType,
      search,
      page = 1,
      limit = 20,
      sortBy = 'frequencyRank',
      sortDirection = 'asc',
      bookmarkedOnly,
      statusFilter,
    } = params;

    const conditions: string[] = ['1=1'];
    const sqlParams: any[] = [userId, userId];

    if (language) {
      const cond = this.buildLanguageCondition(language, 'li');
      conditions.push(cond.sql);
      sqlParams.push(...cond.params);
    }

    if (languageVariant && languageVariant !== 'all') {
      conditions.push('li.variety_id = ?');
      sqlParams.push(languageVariant);
    }

    if (category && category !== 'all') {
      conditions.push('li.category = ?');
      sqlParams.push(category);
    }

    if (difficulty && difficulty !== 'all') {
      conditions.push('li.difficulty = ?');
      sqlParams.push(difficulty);
    }

    if (frequencyBand && frequencyBand !== 'all') {
      conditions.push('li.frequency_band = ?');
      sqlParams.push(frequencyBand);
    }

    if (itemType && itemType !== 'all') {
      conditions.push('li.item_type = ?');
      sqlParams.push(itemType);
    }

    if (bookmarkedOnly) {
      conditions.push('ub.item_id IS NOT NULL');
    }

    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'new') {
        conditions.push('(ulp.status IS NULL OR ulp.status = "new")');
      } else {
        conditions.push('ulp.status = ?');
        sqlParams.push(statusFilter);
      }
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        '(LOWER(li.native_text) LIKE ? OR LOWER(li.translation) LIKE ? OR LOWER(COALESCE(li.pronunciation, "")) LIKE ? OR LOWER(COALESCE(li.tags, "")) LIKE ?)'
      );
      sqlParams.push(term, term, term, term);
    }

    const whereClause = conditions.join(' AND ');

    // Total matching count
    const countSql = `
      SELECT COUNT(*) as total
      FROM learning_items li
      LEFT JOIN user_bookmarks ub ON ub.item_id = li.id AND ub.user_id = ?
      LEFT JOIN user_learning_progress ulp ON ulp.item_id = li.id AND ulp.user_id = ?
      WHERE ${whereClause}
    `;
    const countRow: any = this.db.prepare(countSql).get(...sqlParams);
    const total = countRow ? Number(countRow.total) : 0;

    // Sorting
    let orderColumn = 'li.frequency_rank';
    if (sortBy === 'difficulty') orderColumn = 'li.difficulty_score';
    else if (sortBy === 'alphabetical' || (sortBy as string) === 'word') orderColumn = 'li.native_text';
    const orderDir = sortDirection === 'desc' ? 'DESC' : 'ASC';

    // Pagination
    const offset = Math.max(0, (page - 1) * limit);
    const querySqlParams = [...sqlParams, limit, offset];

    const dataSql = `
      SELECT li.*,
        CASE WHEN ub.item_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
        COALESCE(ulp.status, 'new') as user_status,
        COALESCE(ulp.streak, 0) as user_streak,
        COALESCE(ulp.reviews_count, 0) as user_reviews_count,
        ulp.last_practiced_date as user_last_practiced
      FROM learning_items li
      LEFT JOIN user_bookmarks ub ON ub.item_id = li.id AND ub.user_id = ?
      LEFT JOIN user_learning_progress ulp ON ulp.item_id = li.id AND ulp.user_id = ?
      WHERE ${whereClause}
      ORDER BY ${orderColumn} ${orderDir}
      LIMIT ? OFFSET ?
    `;

    const rows: any[] = this.db.prepare(dataSql).all(...querySqlParams);
    const items = rows.map((r) => this.mapRowToLearningItem(r));

    // Dynamic Filter Counts for fast drilldown
    const langCond = language ? this.buildLanguageCondition(language, '') : null;
    const filterSqlParams = langCond ? langCond.params : [];
    const filterLangWhere = langCond ? `WHERE ${langCond.sql}` : '';

    const catRows: any[] = this.db
      .prepare(
        `SELECT category as name, COUNT(*) as count FROM learning_items ${filterLangWhere} GROUP BY category ORDER BY count DESC`
      )
      .all(...filterSqlParams);

    const diffRows: any[] = this.db
      .prepare(
        `SELECT difficulty as name, COUNT(*) as count FROM learning_items ${filterLangWhere} GROUP BY difficulty ORDER BY count DESC`
      )
      .all(...filterSqlParams);

    const freqRows: any[] = this.db
      .prepare(
        `SELECT frequency_band as name, COUNT(*) as count FROM learning_items ${filterLangWhere} GROUP BY frequency_band ORDER BY count DESC`
      )
      .all(...filterSqlParams);

    const typeRows: any[] = this.db
      .prepare(
        `SELECT item_type as name, COUNT(*) as count FROM learning_items ${filterLangWhere} GROUP BY item_type ORDER BY count DESC`
      )
      .all(...filterSqlParams);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      filters: {
        categories: catRows.map((r) => ({ name: r.name, count: Number(r.count) })),
        difficulties: diffRows.map((r) => ({ name: r.name, count: Number(r.count) })),
        frequencyBands: freqRows.map((r) => ({ name: r.name, count: Number(r.count) })),
        itemTypes: typeRows.map((r) => ({ name: r.name, count: Number(r.count) })),
      },
    };
  }

  /**
   * Random sample for practice and quizzes
   */
  public getRandom(
    language: string,
    count: number = 10,
    category?: string,
    difficulty?: string,
    itemType?: string,
    userId: string = 'local-learner'
  ): LearningItem[] {
    const conditions: string[] = ['1=1'];
    const params: any[] = [userId, userId];

    if (language) {
      const cond = this.buildLanguageCondition(language, 'li');
      conditions.push(cond.sql);
      params.push(...cond.params);
    }

    if (category && category !== 'all') {
      conditions.push('li.category = ?');
      params.push(category);
    }
    if (difficulty && difficulty !== 'all') {
      conditions.push('li.difficulty = ?');
      params.push(difficulty);
    }
    if (itemType && itemType !== 'all') {
      conditions.push('li.item_type = ?');
      params.push(itemType);
    }

    params.push(count);

    const sql = `
      SELECT li.*,
        CASE WHEN ub.item_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
        COALESCE(ulp.status, 'new') as user_status,
        COALESCE(ulp.streak, 0) as user_streak,
        COALESCE(ulp.reviews_count, 0) as user_reviews_count,
        ulp.last_practiced_date as user_last_practiced
      FROM learning_items li
      LEFT JOIN user_bookmarks ub ON ub.item_id = li.id AND ub.user_id = ?
      LEFT JOIN user_learning_progress ulp ON ulp.item_id = li.id AND ulp.user_id = ?
      WHERE ${conditions.join(' AND ')}
      ORDER BY RANDOM()
      LIMIT ?
    `;

    const rows: any[] = this.db.prepare(sql).all(...params);
    return rows.map((r) => this.mapRowToLearningItem(r));
  }

  /**
   * Smart recommendations based on learning intent & frequency
   */
  public getRecommendations(
    language: string,
    currentBand: string = 'high',
    strategy: string = 'expand_core',
    limit: number = 10,
    userId: string = 'local-learner'
  ): LearningItem[] {
    const conditions: string[] = ['1=1'];
    const params: any[] = [userId, userId];

    if (language) {
      const cond = this.buildLanguageCondition(language, 'li');
      conditions.push(cond.sql);
      params.push(...cond.params);
    }

    if (strategy === 'popular' || strategy === 'beginner') {
      conditions.push('li.frequency_rank <= 500');
    } else if (strategy === 'conversational' || strategy === 'phrases') {
      conditions.push("li.item_type IN ('phrase', 'question', 'response', 'collocation')");
    } else if (strategy === 'expand_core') {
      conditions.push("li.frequency_band = 'medium' OR li.frequency_rank BETWEEN 200 AND 1000");
    }

    params.push(limit);

    const sql = `
      SELECT li.*,
        CASE WHEN ub.item_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
        COALESCE(ulp.status, 'new') as user_status,
        COALESCE(ulp.streak, 0) as user_streak,
        COALESCE(ulp.reviews_count, 0) as user_reviews_count,
        ulp.last_practiced_date as user_last_practiced
      FROM learning_items li
      LEFT JOIN user_bookmarks ub ON ub.item_id = li.id AND ub.user_id = ?
      LEFT JOIN user_learning_progress ulp ON ulp.item_id = li.id AND ulp.user_id = ?
      WHERE ${conditions.join(' AND ')}
      ORDER BY li.frequency_rank ASC
      LIMIT ?
    `;

    const rows: any[] = this.db.prepare(sql).all(...params);
    return rows.map((r) => this.mapRowToLearningItem(r));
  }

  /**
   * Get items due for Spaced Repetition (SRS) Review
   */
  public getDueReviews(
    language: string,
    limit: number = 20,
    userId: string = 'local-learner'
  ): LearningItem[] {
    const today = new Date().toISOString().split('T')[0];
    const langCond = this.buildLanguageCondition(language, 'li');
    const sql = `
      SELECT li.*,
        CASE WHEN ub.item_id IS NOT NULL THEN 1 ELSE 0 END as is_bookmarked,
        ulp.status as user_status,
        ulp.streak as user_streak,
        ulp.reviews_count as user_reviews_count,
        ulp.last_practiced_date as user_last_practiced
      FROM user_learning_progress ulp
      JOIN learning_items li ON li.id = ulp.item_id
      LEFT JOIN user_bookmarks ub ON ub.item_id = li.id AND ub.user_id = ?
      WHERE ulp.user_id = ? 
        AND ${langCond.sql}
        AND (ulp.next_review_date <= ? OR ulp.status = 'learning')
      ORDER BY ulp.next_review_date ASC, ulp.reviews_count ASC
      LIMIT ?
    `;

    const rows: any[] = this.db.prepare(sql).all(userId, userId, ...langCond.params, today, limit);
    return rows.map((r) => this.mapRowToLearningItem(r));
  }

  /**
   * Record practice event, calculate SRS intervals and verified XP
   */
  public recordPractice(submission: PracticeSubmission): {
    xpEarned: number;
    newTotalXp: number;
    status: string;
    streak: number;
    nextReviewDate: string;
  } {
    const userId = submission.userId || 'local-learner';
    const { itemId, languageId, activityType, rating = 'good', score } = submission;
    const today = new Date().toISOString().split('T')[0];

    // 1. Calculate XP
    let xpEarned = 10;
    if (activityType === 'quiz') {
      xpEarned = (score ?? 1) * 10;
    } else if (activityType === 'pronunciation') {
      xpEarned = 15;
    } else if (activityType === 'sentence_studio') {
      xpEarned = 20;
    } else {
      if (rating === 'easy') xpEarned = 15;
      else if (rating === 'good') xpEarned = 10;
      else if (rating === 'hard') xpEarned = 8;
      else if (rating === 'again') xpEarned = 5;
    }

    // 2. Fetch or initialize SRS record
    const getSrs = this.db.prepare(`
      SELECT * FROM user_learning_progress WHERE user_id = ? AND item_id = ?
    `);
    const currentSrs: any = getSrs.get(userId, itemId);

    let streak = currentSrs ? Number(currentSrs.streak) : 0;
    let reviewsCount = currentSrs ? Number(currentSrs.reviews_count) + 1 : 1;
    let easeFactor = currentSrs ? Number(currentSrs.ease_factor) : 2.5;
    let intervalDays = currentSrs ? Number(currentSrs.interval_days) : 0;
    let status = currentSrs ? currentSrs.status : 'new';

    if (rating === 'again') {
      streak = 0;
      status = 'learning';
      intervalDays = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'hard') {
      streak += 1;
      status = 'learning';
      intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (rating === 'good') {
      streak += 1;
      status = streak >= 3 ? 'mastered' : 'review';
      intervalDays = Math.max(1, Math.round((intervalDays || 1) * easeFactor));
    } else if (rating === 'easy') {
      streak += 2;
      status = 'mastered';
      intervalDays = Math.max(2, Math.round((intervalDays || 1) * easeFactor * 1.3));
      easeFactor += 0.15;
    }

    const nextReviewDateObj = new Date();
    nextReviewDateObj.setDate(nextReviewDateObj.getDate() + intervalDays);
    const nextReviewDate = nextReviewDateObj.toISOString().split('T')[0];

    // Save SRS state
    const upsertSrs = this.db.prepare(`
      INSERT INTO user_learning_progress (
        user_id, item_id, language_id, status, streak, reviews_count,
        ease_factor, interval_days, next_review_date, last_practiced_date, last_rating
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, item_id) DO UPDATE SET
        status = excluded.status,
        streak = excluded.streak,
        reviews_count = excluded.reviews_count,
        ease_factor = excluded.ease_factor,
        interval_days = excluded.interval_days,
        next_review_date = excluded.next_review_date,
        last_practiced_date = excluded.last_practiced_date,
        last_rating = excluded.last_rating
    `);
    upsertSrs.run(
      userId,
      itemId,
      languageId,
      status,
      streak,
      reviewsCount,
      easeFactor,
      intervalDays,
      nextReviewDate,
      today,
      rating
    );

    // 3. Log practice event
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logStmt = this.db.prepare(`
      INSERT INTO user_practice_logs (
        id, user_id, item_id, language_id, activity_type, rating, score, xp_earned
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    logStmt.run(logId, userId, itemId, languageId, activityType, rating, score || null, xpEarned);

    // 4. Update Language Progress & XP
    const getLangProg = this.db.prepare(`
      SELECT * FROM user_language_progress WHERE user_id = ? AND language_id = ?
    `);
    const currentLangProg: any = getLangProg.get(userId, languageId);

    let totalXp = currentLangProg ? Number(currentLangProg.total_xp) + xpEarned : xpEarned;
    let streakDays = currentLangProg ? Number(currentLangProg.streak_days) : 1;
    let dailyHistory: Record<string, number> = {};
    let skillMastery: Record<string, number> = {
      vocabulary: 45,
      listening: 35,
      speaking: 40,
      reading: 30,
      writing: 25,
      grammar: 35,
    };

    if (currentLangProg) {
      try {
        dailyHistory = JSON.parse(currentLangProg.daily_history);
      } catch {}
      try {
        skillMastery = JSON.parse(currentLangProg.skill_mastery);
      } catch {}

      if (currentLangProg.last_practiced_date !== today) {
        const lastDate = new Date(currentLangProg.last_practiced_date);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          streakDays += 1;
        } else if (diffDays > 1) {
          streakDays = 1;
        }
      }
    }

    dailyHistory[today] = (dailyHistory[today] || 0) + 1;
    skillMastery.vocabulary = Math.min(100, (skillMastery.vocabulary || 45) + 1);

    const upsertLangProg = this.db.prepare(`
      INSERT INTO user_language_progress (
        user_id, language_id, total_xp, streak_days, last_practiced_date, daily_history, skill_mastery
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, language_id) DO UPDATE SET
        total_xp = excluded.total_xp,
        streak_days = excluded.streak_days,
        last_practiced_date = excluded.last_practiced_date,
        daily_history = excluded.daily_history,
        skill_mastery = excluded.skill_mastery
    `);
    upsertLangProg.run(
      userId,
      languageId,
      totalXp,
      streakDays,
      today,
      JSON.stringify(dailyHistory),
      JSON.stringify(skillMastery)
    );

    return {
      xpEarned,
      newTotalXp: totalXp,
      status,
      streak,
      nextReviewDate,
    };
  }

  /**
   * Get overall user progress and statistics
   */
  public getUserProgress(userId: string = 'local-learner', languageId?: string): any {
    const today = new Date().toISOString().split('T')[0];

    // Language progress
    let langRow: any = null;
    if (languageId) {
      langRow = this.db
        .prepare('SELECT * FROM user_language_progress WHERE user_id = ? AND language_id = ?')
        .get(userId, languageId);
    }

    // Cumulative stats
    const totalXpRow: any = this.db
      .prepare('SELECT SUM(total_xp) as total_xp FROM user_language_progress WHERE user_id = ?')
      .get(userId);

    const masteredRow: any = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM user_learning_progress WHERE user_id = ? AND status = 'mastered'"
      )
      .get(userId);

    const learningRow: any = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM user_learning_progress WHERE user_id = ? AND status IN ('learning', 'review')"
      )
      .get(userId);

    const bookmarksRow: any = this.db
      .prepare('SELECT COUNT(*) as count FROM user_bookmarks WHERE user_id = ?')
      .get(userId);

    const todayPracticedRow: any = this.db
      .prepare(
        'SELECT COUNT(DISTINCT item_id) as count FROM user_practice_logs WHERE user_id = ? AND DATE(created_at) = ?'
      )
      .get(userId, today);

    let dailyHistory: Record<string, number> = { [today]: 3 };
    let skillMastery = {
      vocabulary: 45,
      listening: 35,
      speaking: 40,
      reading: 30,
      writing: 25,
      grammar: 35,
    };
    let streakDays = 1;

    if (langRow) {
      try {
        dailyHistory = JSON.parse(langRow.daily_history);
      } catch {}
      try {
        skillMastery = JSON.parse(langRow.skill_mastery);
      } catch {}
      streakDays = Number(langRow.streak_days) || 1;
    }

    return {
      userId,
      languageId: languageId || 'all',
      totalXp: Number(totalXpRow?.total_xp) || 60,
      streakDays,
      totalWordsLearned: (Number(masteredRow?.count) || 0) + (Number(learningRow?.count) || 0),
      masteredCount: Number(masteredRow?.count) || 0,
      learningCount: Number(learningRow?.count) || 0,
      bookmarkedCount: Number(bookmarksRow?.count) || 0,
      todayPracticedCount: Number(todayPracticedRow?.count) || 0,
      dailyHistory,
      skillMastery,
      lastActiveDate: today,
    };
  }

  /**
   * Toggle bookmark status
   */
  public toggleBookmark(
    itemId: string,
    bookmarked: boolean,
    userId: string = 'local-learner'
  ): boolean {
    if (bookmarked) {
      const stmt = this.db.prepare(
        'INSERT OR IGNORE INTO user_bookmarks (user_id, item_id) VALUES (?, ?)'
      );
      stmt.run(userId, itemId);
    } else {
      const stmt = this.db.prepare(
        'DELETE FROM user_bookmarks WHERE user_id = ? AND item_id = ?'
      );
      stmt.run(userId, itemId);
    }
    return true;
  }

  /**
   * Get user settings
   */
  public getUserSettings(userId: string = 'local-learner'): any {
    const row: any = this.db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    if (!row) {
      return {
        targetWordsPerDay: 10,
        speechSpeed: 0.9,
        autoPlayAudio: true,
        showPhoneticByDefault: true,
        soundEffects: true,
        preferredWritingSystem: 'simplified',
        dailyLessonGoal: 10,
      };
    }
    return {
      targetWordsPerDay: row.target_words_per_day,
      speechSpeed: row.speech_speed,
      autoPlayAudio: Boolean(row.auto_play_audio),
      showPhoneticByDefault: Boolean(row.show_phonetic_by_default),
      soundEffects: Boolean(row.sound_effects),
      preferredWritingSystem: row.preferred_writing_system,
      dailyLessonGoal: row.daily_lesson_goal,
    };
  }

  /**
   * Update user settings
   */
  public updateUserSettings(settings: any, userId: string = 'local-learner'): any {
    const stmt = this.db.prepare(`
      INSERT INTO user_settings (
        user_id, target_words_per_day, speech_speed, auto_play_audio,
        show_phonetic_by_default, sound_effects, preferred_writing_system, daily_lesson_goal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        target_words_per_day = excluded.target_words_per_day,
        speech_speed = excluded.speech_speed,
        auto_play_audio = excluded.auto_play_audio,
        show_phonetic_by_default = excluded.show_phonetic_by_default,
        sound_effects = excluded.sound_effects,
        preferred_writing_system = excluded.preferred_writing_system,
        daily_lesson_goal = excluded.daily_lesson_goal,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      userId,
      settings.targetWordsPerDay ?? 10,
      settings.speechSpeed ?? 0.9,
      settings.autoPlayAudio ? 1 : 0,
      settings.showPhoneticByDefault ? 1 : 0,
      settings.soundEffects ? 1 : 0,
      settings.preferredWritingSystem || 'simplified',
      settings.dailyLessonGoal ?? 10
    );

    return this.getUserSettings(userId);
  }

  /**
   * Add custom user vocabulary item
   */
  public addCustomItem(item: any, userId: string = 'local-learner'): any {
    const id = item.id || `custom-${Date.now()}`;
    const stmt = this.db.prepare(`
      INSERT INTO custom_learning_items (
        id, user_id, language_id, variety_id, item_type,
        native_text, translation, pronunciation, part_of_speech, category, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userId,
      item.languageId || 'zh',
      item.languageVariant || item.languageId || 'zh-cmn',
      item.itemType || 'word',
      item.word || item.nativeText,
      item.meaning || item.translation,
      item.pronunciation || null,
      item.partOfSpeech || 'Noun',
      item.category || 'Custom',
      item.notes || null
    );

    return { id, ...item, isCustom: true };
  }

  /**
   * Delete custom item
   */
  public deleteCustomItem(id: string, userId: string = 'local-learner'): boolean {
    const stmt = this.db.prepare(
      'DELETE FROM custom_learning_items WHERE id = ? AND user_id = ?'
    );
    stmt.run(id, userId);
    return true;
  }

  /**
   * Client LocalStorage Migration: Idempotently imports legacy client data
   */
  public migrateClientData(payload: ClientMigrationPayload, userId: string = 'local-learner'): {
    success: boolean;
    migratedBookmarks: number;
    migratedCustomItems: number;
    migratedProgress: number;
  } {
    let migratedBookmarks = 0;
    let migratedCustomItems = 0;
    let migratedProgress = 0;

    this.db.exec('BEGIN TRANSACTION;');
    try {
      // 1. Migrate settings
      if (payload.settings) {
        this.updateUserSettings(payload.settings, userId);
      }

      // 2. Migrate vocabulary state (custom items, bookmarks, SRS status)
      if (payload.vocabulary && Array.isArray(payload.vocabulary)) {
        for (const item of payload.vocabulary) {
          // Custom items
          if (item.isCustom) {
            const customStmt = this.db.prepare(`
              INSERT OR REPLACE INTO custom_learning_items (
                id, user_id, language_id, native_text, translation, pronunciation, part_of_speech, category
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            customStmt.run(
              item.id,
              userId,
              item.languageId || 'zh',
              item.word,
              item.meaning,
              item.pronunciation || null,
              item.partOfSpeech || 'Noun',
              item.category || 'Custom'
            );
            migratedCustomItems++;
          }

          // Bookmarks
          if (item.isBookmarked) {
            const bmStmt = this.db.prepare(`
              INSERT OR IGNORE INTO user_bookmarks (user_id, item_id) VALUES (?, ?)
            `);
            bmStmt.run(userId, item.id);
            migratedBookmarks++;
          }

          // SRS Progress
          if (item.status && item.status !== 'new') {
            const srsStmt = this.db.prepare(`
              INSERT INTO user_learning_progress (
                user_id, item_id, language_id, status, streak, reviews_count, next_review_date, last_practiced_date
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id, item_id) DO UPDATE SET
                status = excluded.status,
                streak = MAX(streak, excluded.streak),
                reviews_count = MAX(reviews_count, excluded.reviews_count)
            `);
            const today = new Date().toISOString().split('T')[0];
            srsStmt.run(
              userId,
              item.id,
              item.languageId || 'zh',
              item.status,
              item.streak || 1,
              item.reviewsCount || 1,
              today,
              item.lastPracticed || today
            );
            migratedProgress++;
          }
        }
      }

      // 3. Migrate XP and Streak
      if (payload.stats) {
        const lang = payload.activeLanguage || 'zh';
        const today = new Date().toISOString().split('T')[0];
        const xp = payload.stats.xp ?? payload.stats.totalXp ?? 60;
        const streak = payload.stats.streakDays ?? 1;
        const dailyHistory = payload.stats.dailyHistory || payload.stats.historyByDate || { [today]: 3 };
        const skillMastery = payload.stats.skillMastery || {
          vocabulary: 45,
          listening: 35,
          speaking: 40,
          reading: 30,
          writing: 25,
          grammar: 35,
        };

        const langStmt = this.db.prepare(`
          INSERT INTO user_language_progress (
            user_id, language_id, total_xp, streak_days, last_practiced_date, daily_history, skill_mastery
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, language_id) DO UPDATE SET
            total_xp = MAX(total_xp, excluded.total_xp),
            streak_days = MAX(streak_days, excluded.streak_days)
        `);
        langStmt.run(
          userId,
          lang,
          xp,
          streak,
          today,
          JSON.stringify(dailyHistory),
          JSON.stringify(skillMastery)
        );
      }

      this.db.exec('COMMIT;');
    } catch (e) {
      this.db.exec('ROLLBACK;');
      throw e;
    }

    return {
      success: true,
      migratedBookmarks,
      migratedCustomItems,
      migratedProgress,
    };
  }

  /**
   * Get distinct categories with item counts
   */
  public getCategories(language?: string): { name: string; count: number }[] {
    let sql = `
      SELECT category as name, COUNT(*) as count
      FROM learning_items
    `;
    const params: any[] = [];
    if (language) {
      const cond = this.buildLanguageCondition(language, '');
      sql += ` WHERE ${cond.sql}`;
      params.push(...cond.params);
    }
    sql += ` GROUP BY category ORDER BY count DESC`;

    const rows: any[] = this.db.prepare(sql).all(...params);
    return rows.map((r) => ({ name: r.name, count: Number(r.count) }));
  }

  /**
   * Library statistics and audit report with real database aggregations
   */
  public getAuditReports(): ContentAuditReport[] {
    const langStats: any[] = this.db
      .prepare(`
        SELECT 
          COALESCE(variety_id, language_id) as language,
          COUNT(*) as totalItems,
          COUNT(DISTINCT native_text) as uniqueWords,
          SUM(CASE WHEN item_type IN ('phrase', 'collocation', 'question', 'response', 'idiom') OR native_text LIKE '% %' THEN 1 ELSE 0 END) as phrases,
          SUM(CASE WHEN EXISTS (SELECT 1 FROM item_examples ie WHERE ie.item_id = learning_items.id) THEN 1 ELSE 0 END) as withExamples,
          SUM(CASE WHEN pronunciation IS NOT NULL AND pronunciation != '' THEN 1 ELSE 0 END) as withPronunciation,
          SUM(CASE WHEN language_specific IS NOT NULL AND language_specific != '{}' AND language_specific != '' THEN 1 ELSE 0 END) as withLanguageSpecific
        FROM learning_items
        GROUP BY COALESCE(variety_id, language_id)
        ORDER BY totalItems DESC
      `)
      .all();

    return langStats.map((row) => ({
      language: row.language,
      totalItems: Number(row.totalItems || 0),
      uniqueWords: Number(row.uniqueWords || 0),
      phrases: Number(row.phrases || 0),
      withExamples: Number(row.withExamples || 0),
      withPronunciation: Number(row.withPronunciation || 0),
      withLanguageSpecific: Number(row.withLanguageSpecific || 0),
      duplicatesRejected: 0,
      validationErrors: 0,
    }));
  }

  /**
   * Helper to map DB row to LearningItem
   */
  private mapRowToLearningItem(row: any): LearningItem {
    let languageSpecific: any = undefined;
    if (row.language_specific) {
      try {
        languageSpecific = JSON.parse(row.language_specific);
      } catch {}
    }

    let tags: string[] = [];
    if (row.tags) {
      try {
        tags = JSON.parse(row.tags);
      } catch {}
    }

    // Fetch examples
    const exRows: any[] = this.db
      .prepare('SELECT native_text, pronunciation, translation FROM item_examples WHERE item_id = ?')
      .all(row.id);

    const examples = exRows.map((ex) => ({
      native: ex.native_text,
      pronunciation: ex.pronunciation || undefined,
      translation: ex.translation,
    }));

    return {
      id: row.id,
      languageId: row.language_id,
      languageVariant: row.variety_id,
      word: row.native_text,
      meaning: row.translation,
      partOfSpeech: row.part_of_speech,
      category: row.category,
      subcategory: row.subcategory || undefined,
      difficulty: row.difficulty,
      difficultyScore: row.difficulty_score,
      frequencyRank: row.frequency_rank,
      frequencyBand: row.frequency_band,
      itemType: row.item_type,
      pronunciation: row.pronunciation || undefined,
      pronunciationSystem: row.pronunciation_system || undefined,
      definition: row.definition || undefined,
      memoryTip: row.memory_tip || undefined,
      culturalNote: row.cultural_note || undefined,
      audioUrl: row.audio_url || undefined,
      examples,
      languageSpecific,
      tags,
      isBookmarked: Boolean(row.is_bookmarked),
      status: row.user_status || 'new',
      streak: row.user_streak || 0,
      reviewsCount: row.user_reviews_count || 0,
      lastPracticed: row.user_last_practiced || undefined,
    };
  }

  /**
   * Helper for custom items
   */
  private mapCustomRowToItem(row: any): LearningItem {
    return {
      id: row.id,
      languageId: row.language_id,
      languageVariant: row.variety_id || row.language_id,
      word: row.native_text,
      meaning: row.translation,
      partOfSpeech: row.part_of_speech,
      category: row.category,
      difficulty: 'beginner',
      difficultyScore: 10,
      frequencyRank: 9999,
      frequencyBand: 'medium',
      itemType: (row.item_type as any) || 'word',
      pronunciation: row.pronunciation || undefined,
      examples: [],
      isCustom: true,
      status: 'learning',
      streak: 0,
      reviewsCount: 0,
    };
  }
}

export const globalVocabularyRepo = new VocabularyRepository();
