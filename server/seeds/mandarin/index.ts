import { LearningItem } from '../../types/vocabulary';
import { buildLearningItem, RawLexicalEntry } from '../dataGenerator';
import { MANDARIN_WORDS, MANDARIN_COLLOCATIONS, MANDARIN_PHRASES, MANDARIN_QUESTIONS } from './data';

export function getMandarinSeedItems(): LearningItem[] {
  const items: LearningItem[] = [];
  let rankCounter = 1;

  // 1. Base Words
  for (const entry of MANDARIN_WORDS) {
    const id = `zh-cmn-w-${String(rankCounter).padStart(4, '0')}`;
    items.push(buildLearningItem('zh', 'zh-cmn', id, { ...entry, rank: rankCounter++ }));
  }

  // 2. High-Utility Collocations
  for (const entry of MANDARIN_COLLOCATIONS) {
    const id = `zh-cmn-c-${String(rankCounter).padStart(4, '0')}`;
    items.push(buildLearningItem('zh', 'zh-cmn', id, { ...entry, rank: rankCounter++ }));
  }

  // 3. Situational Phrases & Responses
  for (const entry of MANDARIN_PHRASES) {
    const id = `zh-cmn-p-${String(rankCounter).padStart(4, '0')}`;
    items.push(buildLearningItem('zh', 'zh-cmn', id, { ...entry, rank: rankCounter++ }));
  }

  // 4. Common Questions & Inquiries
  for (const entry of MANDARIN_QUESTIONS) {
    const id = `zh-cmn-q-${String(rankCounter).padStart(4, '0')}`;
    items.push(buildLearningItem('zh', 'zh-cmn', id, { ...entry, rank: rankCounter++ }));
  }

  return items;
}
