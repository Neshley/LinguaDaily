import { LearningItem } from '../types/vocabulary';

export interface RawLexicalEntry {
  w: string;
  m: string;
  p: string;
  pos: string;
  cat: string;
  diff: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced';
  rank: number;
  type: 'word' | 'phrase' | 'collocation' | 'question' | 'response';
  ex: { n: string; p?: string; t: string };
  spec?: any;
}

export function buildLearningItem(
  langId: string,
  langVariant: string,
  id: string,
  entry: RawLexicalEntry
): LearningItem {
  const diffScoreMap = {
    beginner: 15,
    elementary: 35,
    intermediate: 55,
    'upper-intermediate': 75,
    advanced: 92,
  };

  const freqBand =
    entry.rank <= 1000 ? 'high' : entry.rank <= 3500 ? 'medium' : 'low';

  return {
    id,
    languageId: langId,
    languageVariant: langVariant,
    word: entry.w,
    meaning: entry.m,
    partOfSpeech: entry.pos,
    category: entry.cat,
    difficulty: entry.diff,
    difficultyScore: diffScoreMap[entry.diff] || 30,
    frequencyRank: entry.rank,
    frequencyBand: freqBand,
    itemType: entry.type,
    pronunciation: entry.p,
    pronunciationSystem:
      langId === 'zh'
        ? 'pinyin'
        : langId === 'ja'
        ? 'hepburn'
        : langId === 'ko'
        ? 'revised-romanization'
        : 'ipa',
    examples: [
      {
        native: entry.ex.n,
        pronunciation: entry.ex.p,
        translation: entry.ex.t,
      },
    ],
    languageSpecific: entry.spec,
    tags: [entry.cat.toLowerCase(), entry.pos.toLowerCase(), entry.type],
  };
}
