import {
  LanguageFamily,
  LanguageMeta,
  LanguageVariant,
  SupportedLanguageId,
  ToneDefinition,
} from '../types';

// ==================== MANDARIN TONES ====================
export const MANDARIN_TONES: ToneDefinition[] = [
  {
    id: 1,
    number: 1,
    name: '1st Tone (High Flat · 阴平)',
    contour: '5 → 5',
    description: 'High, steady, level pitch — like singing a sustained high note.',
    colorClass: {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    sampleWord: { word: '妈', romanization: 'mā', meaning: 'Mother' },
  },
  {
    id: 2,
    number: 2,
    name: '2nd Tone (Rising · 阳平)',
    contour: '3 → 5',
    description: 'Starts mid-pitch and glides upward smoothly, like asking an intrigued "What?"',
    colorClass: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    sampleWord: { word: '麻', romanization: 'má', meaning: 'Hemp' },
  },
  {
    id: 3,
    number: 3,
    name: '3rd Tone (Dipping & Rising · 上声)',
    contour: '2 → 1 → 4',
    description: 'Dips down to chest resonance then curves up, like an emphatic "Well..."',
    colorClass: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    sampleWord: { word: '马', romanization: 'mǎ', meaning: 'Horse' },
  },
  {
    id: 4,
    number: 4,
    name: '4th Tone (Sharp Falling · 去声)',
    contour: '5 → 1',
    description: 'Drops sharply and decisively from high to low, like a command "Stop!"',
    colorClass: {
      text: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    sampleWord: { word: '骂', romanization: 'mà', meaning: 'To scold' },
  },
  {
    id: 0,
    number: 0,
    name: 'Neutral Tone (Light & Brief · 轻声)',
    contour: 'Pitch depends on preceding tone',
    description: 'Pronounced softly, shortly, and without tension.',
    colorClass: {
      text: 'text-slate-500',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
    },
    sampleWord: { word: '吗', romanization: 'ma', meaning: 'Question particle' },
  },
];

// ==================== CANTONESE TONES ====================
export const CANTONESE_TONES: ToneDefinition[] = [
  {
    id: 1,
    number: 1,
    name: 'Tone 1 (High Level · 阴平)',
    contour: '5 → 5',
    description: 'High, level, clear pitch at the top of the vocal register.',
    colorClass: {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    sampleWord: { word: '分', romanization: 'fan1', meaning: 'To divide' },
  },
  {
    id: 2,
    number: 2,
    name: 'Tone 2 (High Rising · 阴上)',
    contour: '3 → 5',
    description: 'Starts mid-range and rises sharply to high pitch.',
    colorClass: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    sampleWord: { word: '粉', romanization: 'fan2', meaning: 'Noodles / Powder' },
  },
  {
    id: 3,
    number: 3,
    name: 'Tone 3 (Mid Level · 阴去)',
    contour: '3 → 3',
    description: 'Steady, flat pitch held firmly in the middle vocal range.',
    colorClass: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    sampleWord: { word: '訓', romanization: 'fan3', meaning: 'To sleep' },
  },
  {
    id: 4,
    number: 4,
    name: 'Tone 4 (Low Falling · 阳平)',
    contour: '2 → 1',
    description: 'Deep, low, slightly dropping pitch with chest resonance.',
    colorClass: {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
    },
    sampleWord: { word: '焚', romanization: 'fan4', meaning: 'To burn' },
  },
  {
    id: 5,
    number: 5,
    name: 'Tone 5 (Low Rising · 阳上)',
    contour: '2 → 3',
    description: 'Starts low and ascends gently toward the middle register.',
    colorClass: {
      text: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
    sampleWord: { word: '奮', romanization: 'fan5', meaning: 'To exert' },
  },
  {
    id: 6,
    number: 6,
    name: 'Tone 6 (Low Level · 阳去)',
    contour: '2 → 2',
    description: 'Low, steady, restrained pitch held low without dropping further.',
    colorClass: {
      text: 'text-slate-600',
      bg: 'bg-slate-100',
      border: 'border-slate-300',
    },
    sampleWord: { word: '份', romanization: 'fan6', meaning: 'Portion / Share' },
  },
];

export const MANDARIN_TONE_COLORS: Record<number, { text: string; bg: string; border: string; name: string; contour: string; description: string }> = {
  1: {
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    name: '1st Tone (High Flat)',
    contour: '5 → 5',
    description: 'High, level, steady pitch like singing a high note',
  },
  2: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    name: '2nd Tone (Rising)',
    contour: '3 → 5',
    description: 'Starts mid and rises quickly, like asking "What?"',
  },
  3: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    name: '3rd Tone (Dipping & Rising)',
    contour: '2 → 1 → 4',
    description: 'Dips low then rises up, like an emphatic "Well..."',
  },
  4: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    name: '4th Tone (Falling)',
    contour: '5 → 1',
    description: 'Sharp drop from high to low, like a command "No!"',
  },
  0: {
    text: 'text-slate-500',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    name: 'Neutral Tone',
    contour: 'Light & Short',
    description: 'Pronounced softly and quickly without distinct contour',
  },
};

export const CANTONESE_TONE_COLORS: Record<number, { text: string; bg: string; border: string; name: string; contour: string; description: string }> = {
  1: {
    text: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    name: 'Tone 1 (陰平 High Level)',
    contour: '55',
    description: 'High, level pitch held steady at the top register',
  },
  2: {
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    name: 'Tone 2 (陰上 High Rising)',
    contour: '25',
    description: 'Rises sharply from low-mid to high pitch',
  },
  3: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    name: 'Tone 3 (陰去 Mid Level)',
    contour: '33',
    description: 'Firm, even pitch in the middle vocal range',
  },
  4: {
    text: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    name: 'Tone 4 (陽平 Low Falling)',
    contour: '21',
    description: 'Deep, low, slightly dropping pitch with chest resonance',
  },
  5: {
    text: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    name: 'Tone 5 (陽上 Low Rising)',
    contour: '23',
    description: 'Starts low and ascends gently toward the mid register',
  },
  6: {
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    name: 'Tone 6 (陽去 Low Level)',
    contour: '22',
    description: 'Steady, flat pitch held restrained in the lower register',
  },
};

// ==================== LANGUAGE FAMILIES ====================
export const LANGUAGE_FAMILIES: LanguageFamily[] = [
  {
    id: 'sinitic',
    name: 'Sinitic (Chinese Family)',
    nativeName: '汉语族',
    description: 'A major language family comprising tonal varieties with rich character scripts and shared heritage.',
    icon: '文',
    varieties: [
      {
        id: 'zh-cmn',
        familyId: 'sinitic',
        name: 'Mandarin Chinese',
        nativeName: '普通话 / 國語',
        flag: '🇨🇳',
        speechCode: 'zh-CN',
        fallbackSpeechCodes: ['zh', 'zh-TW'],
        capabilities: {
          supportsTones: true,
          supportsCharacterWriting: true,
          supportsMultipleScripts: true,
          supportsRomanization: true,
          supportsStrokeOrder: true,
          supportsPronunciationAssessment: true,
          supportsGender: false,
          supportsConjugation: false,
        },
        writingSystems: [
          {
            id: 'simplified',
            name: 'Simplified Hanzi',
            nativeName: '简体中文',
            scriptType: 'hanzi-simplified',
            sampleChar: '学',
            description: 'Standard in Mainland China, Singapore, and international exams (HSK).',
          },
          {
            id: 'traditional',
            name: 'Traditional Hanzi',
            nativeName: '繁體中文',
            scriptType: 'hanzi-traditional',
            sampleChar: '學',
            description: 'Standard in Taiwan, Hong Kong, Macau, and historical literature.',
          },
        ],
        defaultWritingSystemId: 'simplified',
        pronunciationSystems: [
          {
            id: 'pinyin',
            name: 'Hanyu Pinyin',
            type: 'tonal',
            tones: MANDARIN_TONES,
            description: 'Official romanization system featuring four lexical tones plus neutral tone.',
          },
        ],
        defaultPronunciationSystemId: 'pinyin',
        regionalVariants: [
          { id: 'mainland', name: 'Mainland Standard (Putonghua)', flag: '🇨🇳', notes: 'Beijing-accented phonology, official nationwide standard.' },
          { id: 'taiwan', name: 'Taiwan Mandarin (Guoyu)', flag: '🇹🇼', notes: 'Traditional characters, gentle retroflex articulation, Zhuyin heritage.' },
          { id: 'singapore', name: 'Singapore Mandarin (Huayu)', flag: '🇸🇬', notes: 'Simplified characters, unique Southeast Asian vocabulary loanwords.' },
        ],
        proficiencyFramework: {
          id: 'hsk',
          name: 'HSK (Hanyu Shuiping Kaoshi)',
          levels: ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'],
        },
        description: 'The official lingua franca of China, Taiwan, and Singapore, spoken by over 1.1 billion people worldwide.',
      },
      {
        id: 'zh-yue',
        familyId: 'sinitic',
        name: 'Cantonese',
        nativeName: '粵語 / 廣東話',
        flag: '🇭🇰',
        speechCode: 'zh-HK',
        fallbackSpeechCodes: ['yue-HK', 'zh-TW'],
        capabilities: {
          supportsTones: true,
          supportsCharacterWriting: true,
          supportsMultipleScripts: true,
          supportsRomanization: true,
          supportsStrokeOrder: true,
          supportsPronunciationAssessment: true,
          supportsGender: false,
          supportsConjugation: false,
        },
        writingSystems: [
          {
            id: 'traditional',
            name: 'Traditional Hanzi & Written Cantonese',
            nativeName: '繁體字 (粵文)',
            scriptType: 'hanzi-traditional',
            sampleChar: '食',
            description: 'Features specialized colloquial characters (乜, 冇, 喺, 唔, 點) widely used in Hong Kong media.',
          },
          {
            id: 'simplified',
            name: 'Simplified Hanzi',
            nativeName: '簡體字',
            scriptType: 'hanzi-simplified',
            sampleChar: '食',
            description: 'Used in Guangdong, Guangxi, and mainland publications.',
          },
        ],
        defaultWritingSystemId: 'traditional',
        pronunciationSystems: [
          {
            id: 'jyutping',
            name: 'Jyutping (LSHK)',
            type: 'tonal',
            tones: CANTONESE_TONES,
            description: 'Linguistic Society of Hong Kong standard romanization with 6 distinct tone contours.',
          },
        ],
        defaultPronunciationSystemId: 'jyutping',
        regionalVariants: [
          { id: 'hk', name: 'Hong Kong Cantonese', flag: '🇭🇰', notes: 'Includes colloquial English loanwords, lively modern slang, and cinema idioms.' },
          { id: 'guangdong', name: 'Guangzhou / Guangdong Cantonese', flag: '🇨🇳', notes: 'Traditional prestige dialect with authentic historical phrasing.' },
        ],
        proficiencyFramework: {
          id: 'cefr',
          name: 'Cantonese Proficiency Scale',
          levels: ['Beginner (A1)', 'Elementary (A2)', 'Intermediate (B1)', 'Upper (B2)'],
        },
        description: 'Vibrant southern variety renowned for its 6 rich tones, expressive slang, and global cultural footprint.',
      },
      {
        id: 'zh-wuu',
        familyId: 'sinitic',
        name: 'Shanghainese (Wu)',
        nativeName: '上海闲话 / 吴语',
        flag: '🏙️',
        speechCode: 'zh-CN',
        capabilities: {
          supportsTones: true,
          supportsCharacterWriting: true,
          supportsMultipleScripts: false,
          supportsRomanization: true,
          supportsStrokeOrder: true,
          supportsPronunciationAssessment: false,
          supportsGender: false,
          supportsConjugation: false,
        },
        writingSystems: [
          {
            id: 'simplified',
            name: 'Hanzi with Wu Romanization',
            nativeName: '汉字及注音',
            scriptType: 'hanzi-simplified',
            sampleChar: '侬',
            description: 'Distinctive vocabulary like 侬 (you), 伲 (we), 阿里搭 (where).',
          },
        ],
        defaultWritingSystemId: 'simplified',
        pronunciationSystems: [
          {
            id: 'shanghai-roman',
            name: 'Shanghainese Phonetic System',
            type: 'tonal',
            description: '5 tones with tone sandhi and distinctive voiced consonants.',
          },
        ],
        defaultPronunciationSystemId: 'shanghai-roman',
        regionalVariants: [
          { id: 'shanghai', name: 'Urban Shanghai', flag: '🏙️', notes: 'Modern metropolitan variety of the historic Yangtze River delta.' },
        ],
        proficiencyFramework: {
          id: 'custom',
          name: 'Conversational Levels',
          levels: ['Everyday Phrases', 'Market & Dining', 'Heritage Fluency'],
        },
        description: 'Major representative of Wu Chinese spoken across Shanghai, Suzhou, and the Yangtze Delta region.',
      },
      {
        id: 'zh-nan',
        familyId: 'sinitic',
        name: 'Hokkien (Southern Min)',
        nativeName: '闽南语 / 臺灣話',
        flag: '🏮',
        speechCode: 'zh-TW',
        capabilities: {
          supportsTones: true,
          supportsCharacterWriting: true,
          supportsMultipleScripts: true,
          supportsRomanization: true,
          supportsStrokeOrder: true,
          supportsPronunciationAssessment: false,
          supportsGender: false,
          supportsConjugation: false,
        },
        writingSystems: [
          {
            id: 'traditional',
            name: 'Traditional Hanzi & Peh-oe-ji',
            nativeName: '漢字與白話字',
            scriptType: 'hanzi-traditional',
            sampleChar: '茶',
            description: 'Ancient phonology retaining classical Chinese final consonants and tone categories.',
          },
        ],
        defaultWritingSystemId: 'traditional',
        pronunciationSystems: [
          {
            id: 'tai-lo',
            name: 'Tai-lo / Peh-oe-ji',
            type: 'tonal',
            description: '7-8 tones with extensive tone sandhi chains in connected speech.',
          },
        ],
        defaultPronunciationSystemId: 'tai-lo',
        regionalVariants: [
          { id: 'taiwan', name: 'Taiwanese Hokkien (Taigi)', flag: '🇹🇼', notes: 'Widely spoken across Taiwan with official broadcasting and literature.' },
          { id: 'fujian', name: 'Quanzhou / Xiamen Hokkien', flag: '🇨🇳', notes: 'Historic maritime cradle of the Southern Min diaspora.' },
        ],
        proficiencyFramework: {
          id: 'custom',
          name: 'Min Nan Proficiency',
          levels: ['Level 1 (Basic)', 'Level 2 (Conversational)', 'Level 3 (Fluent)'],
        },
        description: 'Historic maritime variety spoken across southern Fujian, Taiwan, Singapore, Malaysia, and the diaspora.',
      },
    ],
  },
  {
    id: 'japonic',
    name: 'Japonic Family',
    nativeName: '日語族',
    description: 'Agglutinative languages characterized by complex honorifics, pitch accent, and mixed writing scripts.',
    icon: '日',
    varieties: [
      {
        id: 'ja',
        familyId: 'japonic',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        speechCode: 'ja-JP',
        capabilities: {
          supportsTones: false,
          supportsCharacterWriting: true,
          supportsMultipleScripts: true,
          supportsRomanization: true,
          supportsStrokeOrder: true,
          supportsPronunciationAssessment: true,
          supportsGender: false,
          supportsConjugation: true,
          supportsPitchAccent: true,
          supportsHonorifics: true,
        },
        writingSystems: [
          {
            id: 'kanji-kana',
            name: 'Kanji, Hiragana & Katakana',
            nativeName: '漢字・平仮名・片仮名',
            scriptType: 'kanji-kana',
            sampleChar: '本',
            description: 'Tripartite script: Kanji for root ideas, Hiragana for grammar, Katakana for loanwords.',
          },
        ],
        defaultWritingSystemId: 'kanji-kana',
        pronunciationSystems: [
          {
            id: 'romaji',
            name: 'Hepburn Romaji & Furigana',
            type: 'pitch-accent',
            description: 'Standard Hepburn romanization with pitch-accent guides.',
          },
        ],
        defaultPronunciationSystemId: 'romaji',
        regionalVariants: [
          { id: 'tokyo', name: 'Standard Japanese (Tokyo)', flag: '🇯🇵', notes: 'National standard used in news, education, and business.' },
          { id: 'kansai', name: 'Kansai-ben (Osaka/Kyoto)', flag: '🎌', notes: 'Expressive rhythm and famous colloquial humor.' },
        ],
        proficiencyFramework: {
          id: 'jlpt',
          name: 'JLPT (Japanese-Language Proficiency Test)',
          levels: ['JLPT N5', 'JLPT N4', 'JLPT N3', 'JLPT N2', 'JLPT N1'],
        },
        description: 'Spoken by 125 million people, known for polite verb conjugations, pitch accent, and rich cultural nuances.',
      },
    ],
  },
  {
    id: 'koreanic',
    name: 'Koreanic Family',
    nativeName: '한국어족',
    description: 'Characterized by the scientific Hangul alphabet, agglutinative morphology, and speech politeness levels.',
    icon: '韓',
    varieties: [
      {
        id: 'ko',
        familyId: 'koreanic',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷',
        speechCode: 'ko-KR',
        capabilities: {
          supportsTones: false,
          supportsCharacterWriting: false,
          supportsMultipleScripts: false,
          supportsRomanization: true,
          supportsStrokeOrder: false,
          supportsPronunciationAssessment: true,
          supportsGender: false,
          supportsConjugation: true,
          supportsHonorifics: true,
        },
        writingSystems: [
          {
            id: 'hangul',
            name: 'Hangul Alphabet',
            nativeName: '한글',
            scriptType: 'hangul',
            sampleChar: '한',
            description: 'Engineered in 1443 by King Sejong; phonetic syllabic blocks representing articulatory features.',
          },
        ],
        defaultWritingSystemId: 'hangul',
        pronunciationSystems: [
          {
            id: 'revised-romanization',
            name: 'Revised Romanization of Korean',
            type: 'phonetic',
            description: 'Official South Korean transcription system.',
          },
        ],
        defaultPronunciationSystemId: 'revised-romanization',
        regionalVariants: [
          { id: 'seoul', name: 'Standard Seoul Korean', flag: '🇰🇷', notes: 'National standard used in media, K-dramas, and academia.' },
        ],
        proficiencyFramework: {
          id: 'topik',
          name: 'TOPIK (Test of Proficiency in Korean)',
          levels: ['TOPIK I (L1)', 'TOPIK I (L2)', 'TOPIK II (L3)', 'TOPIK II (L4)'],
        },
        description: 'Vibrant global language renowned for Hangul phonetics, K-culture, and nuanced honorific systems.',
      },
    ],
  },
  {
    id: 'romance',
    name: 'Romance Language Family',
    nativeName: 'Lenguas romances',
    description: 'Evolved from Vulgar Latin, featuring grammatical gender, inflectional verbs, and melodic cadences.',
    icon: 'Rom',
    varieties: [
      {
        id: 'es',
        familyId: 'romance',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        speechCode: 'es-ES',
        capabilities: {
          supportsTones: false,
          supportsCharacterWriting: false,
          supportsMultipleScripts: false,
          supportsRomanization: false,
          supportsStrokeOrder: false,
          supportsPronunciationAssessment: true,
          supportsGender: true,
          supportsConjugation: true,
        },
        writingSystems: [
          {
            id: 'latin-es',
            name: 'Spanish Alphabet',
            nativeName: 'Alfabeto Español',
            scriptType: 'latin',
            sampleChar: 'ñ',
            description: 'Standard Latin alphabet with accented vowels (á, é, í, ó, ú) and ñ.',
          },
        ],
        defaultWritingSystemId: 'latin-es',
        pronunciationSystems: [
          {
            id: 'phonetic-es',
            name: 'Standard Spanish Phonetics',
            type: 'phonetic',
            description: 'Consistent phonetic spelling with rolled /r/ and clear vowel purity.',
          },
        ],
        defaultPronunciationSystemId: 'phonetic-es',
        regionalVariants: [
          { id: 'castilian', name: 'Castilian (Spain)', flag: '🇪🇸', notes: 'Distinction between /s/ and /θ/ (ceceo/distinción), vosotros.' },
          { id: 'latam', name: 'Latin American Spanish', flag: '🇲🇽', notes: 'Seseo, ustedes plural pronoun, rich regional vocabulary.' },
        ],
        proficiencyFramework: {
          id: 'cefr',
          name: 'CEFR Framework',
          levels: ['CEFR A1', 'CEFR A2', 'CEFR B1', 'CEFR B2', 'CEFR C1'],
        },
        description: 'World language with over 500 million native speakers across Spain and Latin America.',
      },
      {
        id: 'fr',
        familyId: 'romance',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        speechCode: 'fr-FR',
        capabilities: {
          supportsTones: false,
          supportsCharacterWriting: false,
          supportsMultipleScripts: false,
          supportsRomanization: false,
          supportsStrokeOrder: false,
          supportsPronunciationAssessment: true,
          supportsGender: true,
          supportsConjugation: true,
        },
        writingSystems: [
          {
            id: 'latin-fr',
            name: 'French Alphabet',
            nativeName: 'Alphabet Français',
            scriptType: 'latin',
            sampleChar: 'é',
            description: 'Latin alphabet with accents (é, è, ê, ë, ç) and silent letters.',
          },
        ],
        defaultWritingSystemId: 'latin-fr',
        pronunciationSystems: [
          {
            id: 'phonetic-fr',
            name: 'French Phonetics & Liaisons',
            type: 'phonetic',
            description: 'Nasal vowels, uvular r, and liaison linking between consonant and vowel.',
          },
        ],
        defaultPronunciationSystemId: 'phonetic-fr',
        regionalVariants: [
          { id: 'standard-fr', name: 'Metropolitan French (Paris)', flag: '🇫🇷', notes: 'Official standard used in diplomacy and literature.' },
          { id: 'quebec', name: 'Quebec French', flag: '🇨🇦', notes: 'Distinct vowel shifts and preserved classic maritime terms.' },
        ],
        proficiencyFramework: {
          id: 'cefr',
          name: 'CEFR Framework (DELF/DALF)',
          levels: ['CEFR A1', 'CEFR A2', 'CEFR B1', 'CEFR B2', 'CEFR C1'],
        },
        description: 'Global language of culture, diplomacy, and cuisine spoken across Europe, Canada, and Africa.',
      },
    ],
  },
  {
    id: 'germanic',
    name: 'Germanic Family',
    nativeName: 'Germanische Sprachen',
    description: 'Features three grammatical genders, compound nouns, and strong verb ablaut series.',
    icon: 'Deu',
    varieties: [
      {
        id: 'de',
        familyId: 'germanic',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        speechCode: 'de-DE',
        capabilities: {
          supportsTones: false,
          supportsCharacterWriting: false,
          supportsMultipleScripts: false,
          supportsRomanization: false,
          supportsStrokeOrder: false,
          supportsPronunciationAssessment: true,
          supportsGender: true,
          supportsConjugation: true,
        },
        writingSystems: [
          {
            id: 'latin-de',
            name: 'German Alphabet',
            nativeName: 'Deutsches Alphabet',
            scriptType: 'latin',
            sampleChar: 'ß',
            description: 'Latin alphabet with umlauts (ä, ö, ü) and the sharp S (Eszett ß).',
          },
        ],
        defaultWritingSystemId: 'latin-de',
        pronunciationSystems: [
          {
            id: 'phonetic-de',
            name: 'Standard German Phonetics',
            type: 'phonetic',
            description: 'Glottal stops, ch-sounds (ich-Laut and ach-Laut), and final consonant devoicing.',
          },
        ],
        defaultPronunciationSystemId: 'phonetic-de',
        regionalVariants: [
          { id: 'standard-de', name: 'Hochdeutsch (Standard German)', flag: '🇩🇪', notes: 'Standard language taught in Germany, Austria, and Switzerland.' },
        ],
        proficiencyFramework: {
          id: 'cefr',
          name: 'CEFR Framework (Goethe-Zertifikat)',
          levels: ['CEFR A1', 'CEFR A2', 'CEFR B1', 'CEFR B2', 'CEFR C1'],
        },
        description: 'Most widely spoken mother tongue in the European Union, celebrated for philosophy and engineering.',
      },
    ],
  },
];

// Helper to flatten all language varieties for quick lookup
export const ALL_LANGUAGE_VARIANTS: LanguageVariant[] = LANGUAGE_FAMILIES.flatMap(
  (family) => family.varieties
);

// Backward compatibility: Map `LanguageMeta` from `ALL_LANGUAGE_VARIANTS`
export function getLanguageMeta(id: SupportedLanguageId): LanguageMeta {
  // Normalize legacy 'zh' to 'zh-cmn'
  const normalizedId = id === 'zh' ? 'zh-cmn' : id;
  const variant = ALL_LANGUAGE_VARIANTS.find((v) => v.id === normalizedId) || ALL_LANGUAGE_VARIANTS[0];

  return {
    id: variant.id,
    name: variant.name,
    nativeName: variant.nativeName,
    flag: variant.flag,
    speechCode: variant.speechCode,
    scriptName: variant.writingSystems[0]?.name || 'Standard Script',
    levels: variant.proficiencyFramework.levels,
    toneSupport: variant.capabilities.supportsTones,
    description: variant.description,
    capabilities: variant.capabilities,
    familyId: variant.familyId,
  };
}

export const SUPPORTED_LANGUAGES_META: LanguageMeta[] = ALL_LANGUAGE_VARIANTS.map((v) =>
  getLanguageMeta(v.id)
);

// Get tones for active language variant
export function getTonesForLanguage(variantId: SupportedLanguageId): ToneDefinition[] {
  const norm = variantId === 'zh' ? 'zh-cmn' : variantId;
  const variant = ALL_LANGUAGE_VARIANTS.find((v) => v.id === norm);
  if (!variant || !variant.capabilities.supportsTones) return [];

  const pronSys = variant.pronunciationSystems.find((p) => p.tones && p.tones.length > 0);
  return pronSys?.tones || [];
}

export function findLanguageVariant(id: SupportedLanguageId): LanguageVariant {
  const norm = id === 'zh' ? 'zh-cmn' : id;
  return ALL_LANGUAGE_VARIANTS.find((v) => v.id === norm) || ALL_LANGUAGE_VARIANTS[0];
}
