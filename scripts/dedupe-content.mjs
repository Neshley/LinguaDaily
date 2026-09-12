import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'public', 'data', 'languages');
const normalize = (value = '') => String(value).trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const identity = (item) => [item.languageVariant || item.languageId || '', normalize(item.word), normalize(item.pronunciation || ''), item.itemType || 'word', normalize(item.meaning)].join('::');

let removed = 0;
let total = 0;
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const full = path.join(dir, file);
  const payload = JSON.parse(fs.readFileSync(full, 'utf8'));
  const seen = new Set();
  const items = [];
  for (const item of payload.items || []) {
    const key = identity(item);
    if (seen.has(key)) { removed++; continue; }
    seen.add(key); items.push(item);
  }
  payload.items = items;
  fs.writeFileSync(full, JSON.stringify(payload));
  total += items.length;
  console.log(`[Dedupe] ${file}: ${items.length} unique items`);
}
const manifestPath = path.join(root, 'public', 'data', 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
manifest.generatedAt = new Date().toISOString();
manifest.totalItems = total;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`[Dedupe] Removed ${removed} duplicate items. ${total} unique items remain.`);
