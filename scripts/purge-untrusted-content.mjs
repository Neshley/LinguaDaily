import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = process.cwd();
const dbPath = path.join(root, 'server', 'data', 'linguadaily.db');
const db = new DatabaseSync(dbPath);

const countBefore = Number(db.prepare('SELECT COUNT(*) AS c FROM learning_items').get().c);
const untrusted = Number(db.prepare('SELECT COUNT(*) AS c FROM learning_items WHERE is_curated = 0').get().c);

if (untrusted > 0) {
  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare(`DELETE FROM item_examples WHERE item_id IN (SELECT id FROM learning_items WHERE is_curated = 0)`).run();
    db.prepare(`DELETE FROM learning_items WHERE is_curated = 0`).run();
    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
}

const countAfter = Number(db.prepare('SELECT COUNT(*) AS c FROM learning_items').get().c);
console.log(`[Content] Removed ${countBefore - countAfter} untrusted generated-pattern items.`);
console.log(`[Content] Trusted learning library: ${countAfter} items.`);
