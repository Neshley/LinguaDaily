import { GrammarPoint } from '../types';

export const GRAMMAR_DATA: GrammarPoint[] = [
  // ==================== MANDARIN CHINESE GRAMMAR ====================
  {
    id: 'zh-gram-1',
    languageVariantId: 'zh',
    title: 'Basic Sentence Word Order (SVO + Time/Place)',
    structure: 'Subject + Time/Place + Verb + Object',
    explanation: 'Unlike English, time expressions and location phrases always precede the main verb in Mandarin.',
    level: 'HSK 1',
    category: 'Sentence Structure',
    examples: [
      {
        native: '我明天去北京。',
        phonetic: 'Wǒ míngtiān qù Běijīng.',
        translation: 'I will go to Beijing tomorrow.',
      },
      {
        native: '他在家喝咖啡。',
        phonetic: 'Tā zài jiā hē kāfēi.',
        translation: 'He drinks coffee at home.',
      },
    ],
    commonMistakes: 'Putting the time at the very end of the sentence like in English ("我去看电影明天" is incorrect; say "我明天去看电影").',
  },
  {
    id: 'zh-gram-2',
    languageVariantId: 'zh',
    title: 'Yes/No Questions with 吗 (ma)',
    structure: 'Statement + 吗？',
    explanation: 'Simply append the neutral-tone question particle 吗 (ma) to the end of any declarative sentence to turn it into a yes/no question.',
    level: 'HSK 1',
    category: 'Questions',
    examples: [
      {
        native: '你是学生吗？',
        phonetic: 'Nǐ shì xuéshēng ma?',
        translation: 'Are you a student?',
      },
      {
        native: '你想喝茶吗？',
        phonetic: 'Nǐ xiǎng hē chá ma?',
        translation: 'Would you like to drink tea?',
      },
    ],
    commonMistakes: 'Do not use 吗 if the sentence already contains a question word like 什么 (what) or 谁 (who).',
  },
  {
    id: 'zh-gram-3',
    languageVariantId: 'zh',
    title: 'Negation with 不 (bù) vs 没 (méi)',
    structure: '不 + Verb/Adjective (habitual/future) | 没(有) + Verb (past/possession)',
    explanation: '不 is used for habitual actions, intentions, or present/future negations. 没 is used for completed past events or to negate possession (没有).',
    level: 'HSK 1',
    category: 'Negation',
    examples: [
      {
        native: '我不吃肉。',
        phonetic: 'Wǒ bù chī ròu.',
        translation: 'I do not eat meat (habitual).',
      },
      {
        native: '我昨天没去上班。',
        phonetic: 'Wǒ zuótiān méi qù shàngbān.',
        translation: 'I did not go to work yesterday (past event).',
      },
    ],
  },
  {
    id: 'zh-gram-4',
    languageVariantId: 'zh',
    title: 'Tone Sandhi: Rules for 不 (bù) and 一 (yī)',
    structure: '不 (4th tone) becomes 2nd tone (bú) before another 4th tone',
    explanation: 'When 不 precedes a 4th tone syllable (like 是 shì), it automatically changes to 2nd rising tone: 不是 (bú shì). Similarly, 一 (yī) changes to 4th tone (yì) before 1st/2nd/3rd tones, and 2nd tone (yí) before a 4th tone.',
    level: 'HSK 1',
    category: 'Phonology & Tones',
    examples: [
      {
        native: '不是 (bú shì)',
        phonetic: 'bú shì',
        translation: 'Is not / No',
      },
      {
        native: '一个人 (yí gè rén)',
        phonetic: 'yí gè rén',
        translation: 'One person (yī becomes 2nd tone before 4th tone gè)',
      },
    ],
  },

  // ==================== CANTONESE GRAMMAR ====================
  {
    id: 'yue-gram-1',
    languageVariantId: 'zh-yue',
    title: 'Cantonese Direct vs Indirect Object Inversion',
    structure: 'Subject + Verb + Direct Object + 畀 (bei2) + Indirect Object',
    explanation: 'In spoken Cantonese, the direct object often precedes the recipient, reversing the Mandarin "给 + Person + Thing" structure.',
    level: 'Beginner (A1)',
    category: 'Sentence Structure',
    examples: [
      {
        native: '畀本書我。',
        phonetic: 'Bei2 bun2 syu1 ngo5.',
        translation: 'Give the book to me.',
      },
      {
        native: '我買咗部電話畀佢。',
        phonetic: 'Ngo5 maai5 zo2 bou6 din6 waa2 bei2 keoi5.',
        translation: 'I bought a phone for him/her.',
      },
    ],
  },
  {
    id: 'yue-gram-2',
    languageVariantId: 'zh-yue',
    title: 'Colloquial Cantonese Question Particle 呀 (aa4) & 嗎 (maa3)',
    structure: 'Statement + 呀 (aa4) / 係唔係 (hai6 m4 hai6)?',
    explanation: 'Cantonese commonly forms questions using A-not-A construction (係唔係) or final sentence particle 呀 rather than Mandarin 吗.',
    level: 'Beginner (A1)',
    category: 'Questions',
    examples: [
      {
        native: '你係唔係香港人呀？',
        phonetic: 'Nei5 hai6 m4 hai6 Hoeng1 gong2 jan4 aa3?',
        translation: 'Are you from Hong Kong?',
      },
    ],
  },

  // ==================== JAPANESE GRAMMAR ====================
  {
    id: 'ja-gram-1',
    languageVariantId: 'ja',
    title: 'Topic Marker は (wa) vs Subject Marker が (ga)',
    structure: 'Noun + は (topic) | Noun + が (new information / identifier)',
    explanation: 'は marks what the sentence is broadly about, while が introduces specific focus, unidentified subjects, or desire/potential targets.',
    level: 'JLPT N5',
    category: 'Particles',
    examples: [
      {
        native: '私は学生です。',
        phonetic: 'Watashi wa gakusei desu.',
        translation: 'As for me, I am a student.',
      },
      {
        native: '雨が降っています。',
        phonetic: 'Ame ga futte imasu.',
        translation: 'Rain is falling (observed event).',
      },
    ],
  },

  // ==================== SPANISH GRAMMAR ====================
  {
    id: 'es-gram-1',
    languageVariantId: 'es',
    title: 'Ser vs Estar (The Two "To Be" Verbs)',
    structure: 'Ser (inherent identity/essence) | Estar (temporary states/locations)',
    explanation: 'Ser describes permanent qualities, origin, time, and occupation. Estar describes current physical states, feelings, and spatial location.',
    level: 'CEFR A1',
    category: 'Verbs',
    examples: [
      {
        native: 'Soy profesor de idiomas.',
        phonetic: 'Soy profesor de idiomas.',
        translation: 'I am a language teacher (identity/profession).',
      },
      {
        native: 'Estoy muy feliz hoy.',
        phonetic: 'Estoy muy feliz hoy.',
        translation: 'I am very happy today (temporary mood/state).',
      },
    ],
  },
];

export function getGrammarForLanguage(variantId: string): GrammarPoint[] {
  const norm = variantId === 'zh-cmn' ? 'zh' : variantId;
  return GRAMMAR_DATA.filter((g) => g.languageVariantId === norm);
}
