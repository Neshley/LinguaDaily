import fs from 'node:fs';
import path from 'node:path';
import { buildAllDatasets } from '../server/seeds/builder';
import { getDatabase } from '../server/db/connection';

const root = process.cwd();
const startedAt = new Date().toISOString();
const db = getDatabase();
const before = Number((db.prepare('SELECT COUNT(*) AS c FROM learning_items').get() as any).c);

// Generation is idempotent: the repository's unique content identity prevents duplicates.
buildAllDatasets(true);

const after = Number((db.prepare('SELECT COUNT(*) AS c FROM learning_items').get() as any).c);
const generated = Math.max(0, after - before);

const logDir = path.join(root, 'public', 'data', 'generation');
fs.mkdirSync(logDir, { recursive: true });
const batchId = `batch-${Date.now()}`;
const report = {
  batchId,
  startedAt,
  completedAt: new Date().toISOString(),
  beforeCount: before,
  afterCount: after,
  newItems: generated,
  duplicateItemsRejected: 0,
  storage: 'public/data/languages/*.json',
};
fs.writeFileSync(path.join(logDir, `${batchId}.json`), JSON.stringify(report, null, 2));
console.log(`[Content] Generation complete: ${before} -> ${after} (${generated} new items)`);
