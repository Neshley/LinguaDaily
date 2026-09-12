/**
 * SQLite Database Connection for Linguadaily
 * Powered by Node.js native DatabaseSync
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema';
import { generateIdentityKey } from './validator';

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.join(process.cwd(), 'server', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'linguadaily.db');
  console.log(`[Database] Initializing SQLite database at ${dbPath}`);

  dbInstance = new DatabaseSync(dbPath);

  // Performance optimizations and constraints
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA synchronous = NORMAL;');
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA cache_size = -64000;'); // 64MB cache

  // Initialize schema
  dbInstance.exec(SCHEMA_SQL);

  // Content persistence migration: every learning item gets a stable identity so
  // repeated generation can append safely without creating duplicates.
  const columns = dbInstance.prepare('PRAGMA table_info(learning_items)').all() as Array<{ name: string }>;
  if (!columns.some(c => c.name === 'content_identity')) {
    dbInstance.exec('ALTER TABLE learning_items ADD COLUMN content_identity TEXT');
  }

  const rows = dbInstance.prepare(
    "SELECT id, language_id, variety_id, item_type, native_text, pronunciation, translation FROM learning_items WHERE content_identity IS NULL OR content_identity = ''"
  ).all() as any[];
  const updateIdentity = dbInstance.prepare('UPDATE learning_items SET content_identity = ? WHERE id = ?');
  dbInstance.exec('BEGIN TRANSACTION;');
  try {
    for (const row of rows) {
      const identity = generateIdentityKey({
        languageId: row.language_id,
        languageVariant: row.variety_id,
        word: row.native_text,
        pronunciation: row.pronunciation || '',
        meaning: row.translation,
      });
      updateIdentity.run(identity, row.id);
    }
    dbInstance.exec('COMMIT;');
  } catch (error) {
    dbInstance.exec('ROLLBACK;');
    throw error;
  }

  // Unique identity is the final database-level duplicate guard.
  dbInstance.exec('CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_items_content_identity ON learning_items(content_identity) WHERE content_identity IS NOT NULL');

  // Preserve the trust tier already shipped in V3 static content when migrating
  // the existing seed database. Generated-pattern entries remain non-curated.
  const staticDir = path.join(process.cwd(), 'public', 'data', 'languages');
  if (fs.existsSync(staticDir)) {
    const markGenerated = dbInstance.prepare('UPDATE learning_items SET is_curated = 0 WHERE id = ?');
    for (const file of fs.readdirSync(staticDir).filter(f => f.endsWith('.json'))) {
      try {
        const payload = JSON.parse(fs.readFileSync(path.join(staticDir, file), 'utf8'));
        for (const item of payload.items || []) {
          if (item.contentQuality?.tier === 'generated-pattern') markGenerated.run(item.id);
        }
      } catch {}
    }
  }

  // Ensure default local user exists
  const checkUser = dbInstance.prepare('SELECT id FROM users WHERE id = ?');
  const user = checkUser.get('local-learner');
  if (!user) {
    const today = new Date().toISOString().split('T')[0];
    const insertUser = dbInstance.prepare('INSERT INTO users (id, last_active_date) VALUES (?, ?)');
    insertUser.run('local-learner', today);

    const insertSettings = dbInstance.prepare(`
      INSERT OR IGNORE INTO user_settings (
        user_id, target_words_per_day, speech_speed, auto_play_audio, 
        show_phonetic_by_default, sound_effects, preferred_writing_system, daily_lesson_goal
      ) VALUES (?, 10, 0.9, 1, 1, 1, 'simplified', 10)
    `);
    insertSettings.run('local-learner');
  }

  console.log('[Database] SQLite schema verified and ready.');
  return dbInstance;
}
