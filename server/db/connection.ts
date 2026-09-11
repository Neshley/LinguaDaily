/**
 * SQLite Database Connection for Linguadaily
 * Powered by Node.js native DatabaseSync
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema';

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
