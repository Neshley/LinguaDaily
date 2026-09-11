import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'public', 'data', 'languages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const report = { generatedAt: new Date().toISOString(), languages: [], total: 0, core: 0, generated: 0, issues: [] };

for (const file of files) {
  const payload = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  const items = payload.items || [];
  const seen = new Set();
  let core = 0, generated = 0;
  for (const item of items) {
    const key = `${item.languageVariant}|${item.word}|${item.pronunciation}|${item.meaning}`;
    if (seen.has(key)) report.issues.push(`${file}: duplicate identity ${item.id}`);
    seen.add(key);
    if (!item.contentQuality) report.issues.push(`${file}: missing contentQuality ${item.id}`);
    if (item.contentQuality?.tier === 'generated-pattern') generated++; else core++;
    if (!item.word || !item.meaning || !item.pronunciation || !item.examples?.length) {
      report.issues.push(`${file}: incomplete item ${item.id}`);
    }
  }
  report.languages.push({ id: payload.language?.id, total: items.length, core, generated });
  report.total += items.length; report.core += core; report.generated += generated;
}

fs.writeFileSync(path.join(root, 'public', 'data', 'quality-report.json'), JSON.stringify(report, null, 2));
console.log(`Quality audit: ${report.total} total; ${report.core} seed-curated; ${report.generated} generated-pattern; ${report.issues.length} structural issues`);
if (report.issues.length) { for (const issue of report.issues.slice(0, 20)) console.log(`! ${issue}`); process.exit(1); }
