import { LearningItem } from '../types/vocabulary';
import { RawLexicalEntry, buildLearningItem } from './dataGenerator';
import { extractMandarinTones } from './mandarin/data';

// Helper to expand a language set to >= 3,000 items with rich authentic structures
export function generateLanguageLibrary(
  langId: string,
  langVariant: string,
  config: {
    targetCount?: number;
    verbs: Array<{ w: string; p: string; m: string; pos?: string; spec?: any }>;
    nouns: Array<{ w: string; p: string; m: string; c: string; pos?: string; spec?: any }>;
    adjectives: Array<{ w: string; p: string; m: string; c: string; spec?: any }>;
    phrases: Array<{ w: string; p: string; m: string; c: string; exN: string; exP: string; exT: string; spec?: any }>;
    questions: Array<{ w: string; p: string; m: string; exN: string; exP: string; exT: string; spec?: any }>;
    responses: Array<{ w: string; p: string; m: string; exN: string; exP: string; exT: string; spec?: any }>;
    buildExample: (verb: any, noun: any) => { n: string; p?: string; t: string };
  }
): LearningItem[] {
  const items: LearningItem[] = [];
  const targetCount = config.targetCount || (langVariant === 'zh-yue' ? 1050 : 3150);
  let rank = 1;

  const addItem = (
    w: string,
    m: string,
    p: string,
    pos: string,
    cat: string,
    diff: 'beginner' | 'elementary' | 'intermediate' | 'upper-intermediate' | 'advanced',
    type: 'word' | 'phrase' | 'collocation' | 'question' | 'response',
    ex: { n: string; p?: string; t: string },
    spec?: any
  ) => {
    // Populate default language-specific metadata if not provided
    let enrichedSpec = spec;
    if (!enrichedSpec) {
      if (langVariant === 'zh-cmn') {
        enrichedSpec = {
          type: 'mandarin',
          data: {
            simplified: w,
            traditional: w,
            pinyin: p,
            tones: extractMandarinTones(p),
            hskLevel: rank <= 500 ? 'HSK 1' : rank <= 1500 ? 'HSK 2' : 'HSK 3',
          },
        };
      } else if (langVariant === 'zh-yue') {
        enrichedSpec = {
          type: 'cantonese',
          data: {
            traditional: w,
            jyutping: p,
            tones: (p.match(/[1-6](?=\s|$)/g) || []).map(Number),
            spokenRegister: 'Colloquial',
          },
        };
      } else if (langId === 'ja') {
        enrichedSpec = {
          type: 'japanese',
          data: {
            kanji: w,
            hiragana: w,
            romaji: p,
            politenessLevel: 'neutral',
            jlptLevel: rank <= 800 ? 'N5' : rank <= 2000 ? 'N4' : 'N3',
          },
        };
      } else if (langId === 'ko') {
        enrichedSpec = {
          type: 'korean',
          data: {
            hangul: w,
            revisedRomanization: p,
            speechLevel: 'informal-polite',
            topikLevel: rank <= 1000 ? 'TOPIK I' : 'TOPIK II',
          },
        };
      } else if (langId === 'es') {
        enrichedSpec = {
          type: 'spanish',
          data: {
            gender: pos.toLowerCase() === 'noun' ? (w.endsWith('a') ? 'feminine' : 'masculine') : undefined,
            article: pos.toLowerCase() === 'noun' ? (w.endsWith('a') ? 'la' : 'el') : undefined,
            verbType: pos.toLowerCase() === 'verb' ? (w.endsWith('ar') ? '-ar' : w.endsWith('er') ? '-er' : '-ir') : undefined,
            regionalVariant: 'Universal',
          },
        };
      } else if (langId === 'fr') {
        enrichedSpec = {
          type: 'french',
          data: {
            gender: pos.toLowerCase() === 'noun' ? (w.endsWith('e') ? 'feminine' : 'masculine') : undefined,
            article: pos.toLowerCase() === 'noun' ? (w.endsWith('e') ? 'la' : 'le') : undefined,
            liaisonHint: ['a', 'e', 'i', 'o', 'u', 'h'].includes(w.toLowerCase()[0]),
          },
        };
      } else if (langId === 'de') {
        enrichedSpec = {
          type: 'german',
          data: {
            gender: pos.toLowerCase() === 'noun' ? 'neuter' : undefined,
            article: pos.toLowerCase() === 'noun' ? 'das' : undefined,
            separable: false,
          },
        };
      }
    }

    const id = `${langVariant}-${String(rank).padStart(5, '0')}`;
    const entry: RawLexicalEntry = {
      w,
      m,
      p,
      pos,
      cat,
      diff,
      rank: rank++,
      type,
      ex,
      spec: enrichedSpec,
    };
    const built = buildLearningItem(langId, langVariant, id, entry);
    built.contentQuality = {
      tier: 'seed-curated',
      status: 'seed-review-required',
      score: 80,
      trustedForCoreLearning: true,
      source: 'Linguadaily seed dataset',
    };
    items.push(built);
  };

  // 1. Add Verbs as standalone items
  for (const v of config.verbs) {
    addItem(
      v.w,
      v.m,
      v.p,
      v.pos || 'Verb',
      'High-Frequency Verbs',
      rank <= 200 ? 'beginner' : rank <= 800 ? 'elementary' : 'intermediate',
      'word',
      { n: `${v.w}.`, p: v.p, t: `${v.m}.` },
      v.spec
    );
  }

  // 2. Add Nouns as standalone items
  for (const n of config.nouns) {
    addItem(
      n.w,
      n.m,
      n.p,
      n.pos || 'Noun',
      n.c,
      rank <= 300 ? 'beginner' : rank <= 1200 ? 'elementary' : 'intermediate',
      'word',
      { n: `${n.w}.`, p: n.p, t: `${n.m}.` },
      n.spec
    );
  }

  // 3. Add Adjectives as standalone items
  for (const a of config.adjectives) {
    addItem(
      a.w,
      a.m,
      a.p,
      'Adjective',
      a.c,
      'elementary',
      'word',
      { n: `${a.w}.`, p: a.p, t: `${a.m}.` },
      a.spec
    );
  }

  // 4. Add Everyday Phrases
  for (const phr of config.phrases) {
    addItem(
      phr.w,
      phr.m,
      phr.p,
      'Expression',
      phr.c,
      'beginner',
      'phrase',
      { n: phr.exN, p: phr.exP, t: phr.exT },
      phr.spec
    );
  }

  // 5. Add Questions
  for (const q of config.questions) {
    addItem(
      q.w,
      q.m,
      q.p,
      'Question',
      'Common Questions & Inquiries',
      'beginner',
      'question',
      { n: q.exN, p: q.exP, t: q.exT },
      q.spec
    );
  }

  // 6. Add Responses
  for (const r of config.responses) {
    addItem(
      r.w,
      r.m,
      r.p,
      'Response',
      'Everyday Responses & Reactions',
      'beginner',
      'response',
      { n: r.exN, p: r.exP, t: r.exT },
      r.spec
    );
  }

  // 7. Do NOT synthesize verb+noun collocations.
  //
  // A mechanically combined verb + noun is not evidence of a natural
  // collocation. These candidates previously produced learner-facing errors
  // such as "學智能電話" ("to learn smartphone") and language-specific
  // grammar errors in Japanese/Korean. New collocations must be explicitly
  // authored/reviewed before they enter the trusted content library.

  return items;
}
