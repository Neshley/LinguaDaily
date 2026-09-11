import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'public', 'data', 'manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error('Missing public/data/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let total = 0;
for (const lang of manifest.languages ?? []) {
  const file = path.join(root, 'public', 'data', 'languages', `${lang.id}.json`);
  if (!fs.existsSync(file)) throw new Error(`Missing content file: ${file}`);
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const count = Array.isArray(payload.items) ? payload.items.length : 0;
  if (!count) throw new Error(`Content file is empty: ${lang.id}`);
  if (!payload.language?.id) throw new Error(`Invalid language metadata: ${lang.id}`);
  total += count;
  console.log(`✓ ${lang.id}: ${count.toLocaleString()} items`);
}
if (Number(manifest.totalItems) !== total) {
  throw new Error(`Manifest total ${manifest.totalItems} does not match content total ${total}`);
}
console.log(`✓ Content ready: ${total.toLocaleString()} learning items`);
