import { LearningItem } from '../types/vocabulary';
import { generateMandarinDataset } from './mandarin/data';
import { generateJapaneseDataset } from './japanese/data';
import { generateSpanishDataset } from './spanish/data';
import { generateFrenchDataset } from './french/data';
import { generateGermanDataset } from './german/data';
import { generateKoreanDataset } from './korean/data';
import { generateCantoneseDataset } from './cantonese/data';
import { globalVocabularyRepo } from '../db/repository';
import { getDatabase } from '../db/connection';

export function seedLanguagesAndVarieties() {
  const db = getDatabase();

  const languages = [
    {
      id: 'zh',
      name: 'Chinese',
      native_name: '中文',
      family_id: 'sinitic',
      default_variety_id: 'zh-cmn',
      capabilities: JSON.stringify({
        hasVarieties: true,
        supportsTones: true,
        supportsCharacters: true,
        supportsStrokeOrder: true,
        supportsWritingPractice: true,
        phoneticLabel: 'Pinyin',
      }),
    },
    {
      id: 'ja',
      name: 'Japanese',
      native_name: '日本語',
      family_id: 'japonic',
      default_variety_id: 'ja-jp',
      capabilities: JSON.stringify({
        hasVarieties: false,
        supportsPitchAccent: true,
        supportsCharacters: true,
        supportsMultipleScripts: true,
        supportsHonorifics: true,
        phoneticLabel: 'Romaji / Kana',
      }),
    },
    {
      id: 'es',
      name: 'Spanish',
      native_name: 'Español',
      family_id: 'romance',
      default_variety_id: 'es-es',
      capabilities: JSON.stringify({
        hasVarieties: true,
        supportsGender: true,
        supportsConjugation: true,
        supportsRegionalVariation: true,
        phoneticLabel: 'Pronunciation',
      }),
    },
    {
      id: 'fr',
      name: 'French',
      native_name: 'Français',
      family_id: 'romance',
      default_variety_id: 'fr-fr',
      capabilities: JSON.stringify({
        hasVarieties: true,
        supportsGender: true,
        supportsConjugation: true,
        supportsContractions: true,
        phoneticLabel: 'Pronunciation',
      }),
    },
    {
      id: 'de',
      name: 'German',
      native_name: 'Deutsch',
      family_id: 'germanic',
      default_variety_id: 'de-de',
      capabilities: JSON.stringify({
        hasVarieties: false,
        supportsGender: true,
        supportsCases: true,
        supportsCompounds: true,
        supportsConjugation: true,
        phoneticLabel: 'Pronunciation',
      }),
    },
    {
      id: 'ko',
      name: 'Korean',
      native_name: '한국어',
      family_id: 'koreanic',
      default_variety_id: 'ko-kr',
      capabilities: JSON.stringify({
        hasVarieties: false,
        supportsSpeechLevels: true,
        supportsCharacters: true,
        supportsWritingPractice: true,
        phoneticLabel: 'Romanization',
      }),
    },
  ];

  const varieties = [
    {
      id: 'zh-cmn',
      language_id: 'zh',
      name: 'Mandarin Chinese',
      native_name: '普通话 / 國語',
      region: 'China, Taiwan, Singapore',
      default_writing_system: 'simplified',
      default_pronunciation_system: 'pinyin',
      capabilities: JSON.stringify({
        tones: 4,
        writingSystems: ['simplified', 'traditional'],
        pronunciationSystems: ['pinyin', 'bopomofo'],
        supportsTones: true,
        phoneticLabel: 'Pinyin',
      }),
    },
    {
      id: 'zh-yue',
      language_id: 'zh',
      name: 'Cantonese',
      native_name: '廣東話 / 粵語',
      region: 'Hong Kong, Guangdong, Macau',
      default_writing_system: 'traditional',
      default_pronunciation_system: 'jyutping',
      capabilities: JSON.stringify({
        tones: 6,
        writingSystems: ['traditional', 'simplified'],
        pronunciationSystems: ['jyutping'],
        supportsTones: true,
        phoneticLabel: 'Jyutping',
      }),
    },
    {
      id: 'ja-jp',
      language_id: 'ja',
      name: 'Standard Japanese',
      native_name: '共通語',
      region: 'Japan',
      default_writing_system: 'kanji',
      default_pronunciation_system: 'romaji',
      capabilities: JSON.stringify({
        writingSystems: ['kanji', 'hiragana', 'katakana'],
        pronunciationSystems: ['romaji'],
        supportsPitchAccent: true,
        phoneticLabel: 'Romaji / Kana',
      }),
    },
    {
      id: 'es-es',
      language_id: 'es',
      name: 'Castilian & Latin American Spanish',
      native_name: 'Español Estándar',
      region: 'Spain & Americas',
      default_writing_system: 'latin',
      default_pronunciation_system: 'phonetic',
      capabilities: JSON.stringify({
        supportsGender: true,
        supportsConjugation: true,
        phoneticLabel: 'Pronunciation',
      }),
    },
    {
      id: 'fr-fr',
      language_id: 'fr',
      name: 'Standard French',
      native_name: 'Français Standard',
      region: 'France & Francophonie',
      default_writing_system: 'latin',
      default_pronunciation_system: 'phonetic',
      capabilities: JSON.stringify({
        supportsGender: true,
        supportsConjugation: true,
        phoneticLabel: 'Pronunciation',
      }),
    },
    {
      id: 'de-de',
      language_id: 'de',
      name: 'Standard German',
      native_name: 'Hochdeutsch',
      region: 'Germany, Austria, Switzerland',
      default_writing_system: 'latin',
      default_pronunciation_system: 'phonetic',
      capabilities: JSON.stringify({
        supportsGender: true,
        supportsCases: true,
        supportsCompounds: true,
        phoneticLabel: 'Pronunciation',
      }),
    },
    {
      id: 'ko-kr',
      language_id: 'ko',
      name: 'Standard Korean',
      native_name: '표준어',
      region: 'South Korea',
      default_writing_system: 'hangul',
      default_pronunciation_system: 'revised_romanization',
      capabilities: JSON.stringify({
        supportsSpeechLevels: true,
        phoneticLabel: 'Romanization',
      }),
    },
  ];

  const langStmt = db.prepare(`
    INSERT INTO languages (id, name, native_name, family_id, default_variety_id, capabilities)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      native_name = excluded.native_name,
      default_variety_id = excluded.default_variety_id,
      capabilities = excluded.capabilities
  `);

  for (const l of languages) {
    langStmt.run(l.id, l.name, l.native_name, l.family_id, l.default_variety_id, l.capabilities);
  }

  const varStmt = db.prepare(`
    INSERT INTO language_varieties (id, language_id, name, native_name, region, default_writing_system, default_pronunciation_system, capabilities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      native_name = excluded.native_name,
      region = excluded.region,
      capabilities = excluded.capabilities
  `);

  for (const v of varieties) {
    varStmt.run(
      v.id,
      v.language_id,
      v.name,
      v.native_name,
      v.region,
      v.default_writing_system,
      v.default_pronunciation_system,
      v.capabilities
    );
  }
}

export function buildAllDatasets(force = false): Record<string, LearningItem[]> {
  console.log('[Seed] Seeding languages and varieties metadata...');
  seedLanguagesAndVarieties();

  // If items are already populated and force is not requested, skip re-generation
  if (!force && globalVocabularyRepo.totalCount > 15000) {
    console.log(`[Seed] Library already populated with ${globalVocabularyRepo.totalCount} items. Skipping initial build.`);
    return {};
  }

  console.log('[Seed] Building all language datasets (target: 18,000+ items)...');

  const datasets: Record<string, LearningItem[]> = {
    'zh-cmn': generateMandarinDataset(),
    ja: generateJapaneseDataset(),
    es: generateSpanishDataset(),
    fr: generateFrenchDataset(),
    de: generateGermanDataset(),
    ko: generateKoreanDataset(),
    'zh-yue': generateCantoneseDataset(),
  };

  for (const [lang, items] of Object.entries(datasets)) {
    console.log(`[Seed] Language [${lang}]: generated ${items.length} items`);
    const result = globalVocabularyRepo.bulkInsert(items);
    console.log(`[Seed] Language [${lang}]: seeded into repo - accepted: ${result.accepted}, rejected: ${result.rejected}`);
  }

  console.log(`[Seed] Global Vocabulary Repository total items: ${globalVocabularyRepo.totalCount}`);
  return datasets;
}
