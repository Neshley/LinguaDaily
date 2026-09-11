import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = process.cwd();
const dbPath = path.join(root, 'server', 'data', 'linguadaily.db');
const outDir = path.join(root, 'public', 'data', 'languages');
fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(dbPath)) throw new Error(`Seed database not found: ${dbPath}`);
const db = new DatabaseSync(dbPath, { readOnly: true });
const languages = db.prepare('SELECT * FROM languages ORDER BY name ASC').all();
const varieties = db.prepare('SELECT * FROM language_varieties ORDER BY name ASC').all();

const normalize = (row) => {
  const parse = (v, fallback) => { try { return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  return {
    id: row.id,
    languageId: row.language_id,
    languageVariant: row.variety_id,
    itemType: row.item_type,
    word: row.native_text,
    displayText: row.display_text,
    meaning: row.translation,
    definition: row.definition || undefined,
    pronunciation: row.pronunciation || undefined,
    romanization: row.romanization || undefined,
    pronunciationSystem: row.pronunciation_system || undefined,
    partOfSpeech: row.part_of_speech,
    category: row.category,
    subcategory: row.subcategory || undefined,
    difficulty: row.difficulty,
    difficultyScore: Number(row.difficulty_score || 0),
    frequencyRank: Number(row.frequency_rank || 9999),
    frequencyBand: row.frequency_band,
    languageSpecific: parse(row.language_specific, {}),
    memoryTip: row.memory_tip || undefined,
    culturalNote: row.cultural_note || undefined,
    tags: parse(row.tags, []),
    isCurated: Boolean(row.is_curated),
    examples: [],
  };
};

for (const language of languages) {
  const items = db.prepare('SELECT * FROM learning_items WHERE language_id = ? ORDER BY frequency_rank ASC, id ASC').all(language.id);
  const result = items.map(normalize);
  const exampleStmt = db.prepare('SELECT native_text, pronunciation, translation, audio_url, difficulty FROM item_examples WHERE item_id = ? ORDER BY id ASC');
  for (const item of result) {
    item.examples = exampleStmt.all(item.id).map(e => ({
      native: e.native_text,
      pronunciation: e.pronunciation || undefined,
      translation: e.translation,
      audioUrl: e.audio_url || undefined,
      difficulty: e.difficulty || undefined,
    }));
  }
  const payload = {
    language: {
      id: language.id,
      name: language.name,
      nativeName: language.native_name,
      familyId: language.family_id,
      defaultVarietyId: language.default_variety_id,
      capabilities: JSON.parse(language.capabilities || '{}'),
      varieties: varieties.filter(v => v.language_id === language.id).map(v => ({
        id: v.id,
        languageId: v.language_id,
        name: v.name,
        nativeName: v.native_name,
        region: v.region,
        defaultWritingSystem: v.default_writing_system,
        defaultPronunciationSystem: v.default_pronunciation_system,
        capabilities: JSON.parse(v.capabilities || '{}'),
      })),
    },
    items: result,
  };
  fs.writeFileSync(path.join(outDir, `${language.id}.json`), JSON.stringify(payload));
  console.log(`Exported ${language.id}: ${result.length} items`);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  totalItems: Number(db.prepare('SELECT COUNT(*) AS c FROM learning_items').get().c),
  languages: languages.map(l => ({ id: l.id, name: l.name, nativeName: l.native_name, defaultVarietyId: l.default_variety_id })),
};
fs.writeFileSync(path.join(root, 'public', 'data', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Total content: ${manifest.totalItems}`);
