import { LearningItem } from '../types/vocabulary';
import { generateMandarinDataset } from './mandarin/data';
import { generateJapaneseDataset } from './japanese/data';
import { generateSpanishDataset } from './spanish/data';
import { generateFrenchDataset } from './french/data';
import { generateGermanDataset } from './german/data';
import { generateKoreanDataset } from './korean/data';
import { generateCantoneseDataset } from './cantonese/data';
import { globalVocabularyRepo } from '../db/repository';

export function buildAllDatasets(): Record<string, LearningItem[]> {
  console.log('Building all language datasets...');

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
    console.log(`Language [${lang}]: generated ${items.length} items`);
    const result = globalVocabularyRepo.bulkInsert(items);
    console.log(`Language [${lang}]: seeded into repo - accepted: ${result.accepted}, rejected: ${result.rejected}`);
  }

  console.log(`Global Vocabulary Repository total items: ${globalVocabularyRepo.totalCount}`);
  return datasets;
}
