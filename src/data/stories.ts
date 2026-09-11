import { GradedStory } from '../types';

export const GRADED_STORIES: GradedStory[] = [
  // ==================== MANDARIN (HSK 1 / HSK 2) ====================
  {
    id: 'zh-story-1',
    languageVariantId: 'zh',
    title: '在北京的第一天',
    titleRomanization: 'Zài Běijīng de Dì-yī Tiān',
    titleTranslation: 'First Day in Beijing',
    level: 'HSK 1',
    topic: 'Travel & Arrival',
    audioText: '大卫今天第一次来北京。北京的天气很好，天空很蓝。大卫在咖啡店认识了一个中国朋友，叫李伟。他们一起喝茶聊天，非常高兴。',
    paragraphs: [
      [
        {
          native: '大卫今天第一次来北京。',
          romanization: 'Dàwèi jīntiān dì-yī cì lái Běijīng.',
          translation: 'Today David came to Beijing for the first time.',
        },
        {
          native: '北京的天气很好，天空很蓝。',
          romanization: 'Běijīng de tiānqì hěn hǎo, tiānkōng hěn lán.',
          translation: 'The weather in Beijing is very pleasant, and the sky is very blue.',
        },
      ],
      [
        {
          native: '大卫在咖啡店认识了一个中国朋友，叫李伟。',
          romanization: 'Dàwèi zài kāfēidiàn rènshí le yí gè Zhōngguó péngyou, jiào Lǐ Wěi.',
          translation: 'At a coffee shop, David met a Chinese friend named Li Wei.',
        },
        {
          native: '他们一起喝茶聊天，非常高兴。',
          romanization: 'Tāmen yìqǐ hē chá liáotiān, fēicháng gāoxìng.',
          translation: 'They drank tea and chatted together, feeling very happy.',
        },
      ],
    ],
    vocabularyHighlights: [
      { word: '第一次', romanization: 'dì-yī cì', meaning: 'The first time' },
      { word: '天气', romanization: 'tiān qì', meaning: 'Weather' },
      { word: '认识', romanization: 'rèn shi', meaning: 'To get to know / meet' },
      { word: '高兴', romanization: 'gāo xìng', meaning: 'Happy / Glad' },
    ],
    comprehensionQuestions: [
      {
        question: 'Who did David meet at the cafe in Beijing?',
        options: ['His teacher Wang', 'A Chinese friend named Li Wei', 'His coworker Anna', 'A barista from Shanghai'],
        correctIndex: 1,
        explanation: 'The story states David met a Chinese friend named Li Wei (叫李伟).',
      },
      {
        question: 'How was the weather described in Beijing?',
        options: ['Rainy and cold', 'Very hot and dry', 'Pleasant with blue skies', 'Foggy and windy'],
        correctIndex: 2,
        explanation: '"北京的天气很好，天空很蓝" translates to: The weather is very good, sky is very blue.',
      },
    ],
  },
  {
    id: 'zh-story-2',
    languageVariantId: 'zh',
    title: '小猫找朋友',
    titleRomanization: 'Xiǎomāo Zhǎo Péngyou',
    titleTranslation: 'The Little Cat Looks for Friends',
    level: 'HSK 1-2',
    topic: 'Animals & Friendship',
    audioText: '公园里有一只白色的小猫。它想找朋友玩。它看见了一只小狗，对小狗说：“你好！我们可以做朋友吗？”小狗高兴地摇摇尾巴说：“好啊，我们一起跑吧！”',
    paragraphs: [
      [
        {
          native: '公园里有一只白色的小猫。',
          romanization: 'Gōngyuán lǐ yǒu yì zhī báisè de xiǎomāo.',
          translation: 'In the park there is a little white cat.',
        },
        {
          native: '它想找朋友玩。',
          romanization: 'Tā xiǎng zhǎo péngyou wán.',
          translation: 'It wants to find friends to play with.',
        },
      ],
      [
        {
          native: '它看见了一只小狗，对小狗说：“你好！我们可以做朋友吗？”',
          romanization: 'Tā kànjiàn le yì zhī xiǎogǒu, duì xiǎogǒu shuō: "Nǐ hǎo! Wǒmen kěyǐ zuò péngyou ma?"',
          translation: 'It saw a puppy and said to it: "Hello! Can we be friends?"',
        },
        {
          native: '小狗高兴地说：“好啊，我们一起跑吧！”',
          romanization: 'Xiǎogǒu gāoxìng de shuō: "Hǎo a, wǒmen yìqǐ pǎo ba!"',
          translation: 'The puppy happily said: "Great, let\'s run together!"',
        },
      ],
    ],
    vocabularyHighlights: [
      { word: '公园', romanization: 'gōng yuán', meaning: 'Park' },
      { word: '可以', romanization: 'kě yǐ', meaning: 'Can / May' },
      { word: '一起', romanization: 'yì qǐ', meaning: 'Together' },
    ],
    comprehensionQuestions: [
      {
        question: 'Where does the story take place?',
        options: ['In a pet store', 'In a city park', 'At school', 'At home'],
        correctIndex: 1,
        explanation: 'The opening line specifies 公园里 (in the park).',
      },
    ],
  },

  // ==================== CANTONESE GRADED STORY ====================
  {
    id: 'yue-story-1',
    languageVariantId: 'zh-yue',
    title: '星期日去飲茶',
    titleRomanization: 'Sing1 kei4 jat6 heoi3 jam2 caa4',
    titleTranslation: 'Going to Yum Cha on Sunday',
    level: 'Beginner (A1)',
    topic: 'Hong Kong Food Culture',
    audioText: '今日係星期日，我同屋企人一齊去茶樓飲茶。茶樓好熱鬧。我哋點咗蝦餃、燒賣同叉燒包。普洱茶好香，大家食得好開心。',
    paragraphs: [
      [
        {
          native: '今日係星期日，我同屋企人一齊去茶樓飲茶。',
          romanization: 'Gam1 jat6 hai6 sing1 kei4 jat6, ngo5 tung4 uk1 kei2 jan4 jat1 cai4 heoi3 caa4 lau4 jam2 caa4.',
          translation: 'Today is Sunday, and I went to the tea restaurant with my family to drink tea.',
        },
        {
          native: '茶樓好熱鬧。',
          romanization: 'Caa4 lau4 hou2 jit6 naau6.',
          translation: 'The tea restaurant is bustling and lively.',
        },
      ],
      [
        {
          native: '我哋點咗蝦餃、燒賣同叉燒包。',
          romanization: 'Ngo5 dei6 dim2 zo2 haa1 gaau2, siu1 maai2 tung4 caa1 siu1 baau1.',
          translation: 'We ordered shrimp dumplings (har gow), siu mai, and barbecue pork buns.',
        },
        {
          native: '普洱茶好香，大家食得好開心。',
          romanization: 'Pou2 nei2 caa4 hou2 hoeng1, daai6 gaa1 sik6 dak1 hou2 hoi1 sam1.',
          translation: 'The Pu-erh tea is very fragrant, and everyone ate happily.',
        },
      ],
    ],
    vocabularyHighlights: [
      { word: '飲茶', romanization: 'jam2 caa4', meaning: 'To drink tea / Yum Cha dim sum' },
      { word: '屋企人', romanization: 'uk1 kei2 jan4', meaning: 'Family members' },
      { word: '蝦餃', romanization: 'haa1 gaau2', meaning: 'Shrimp dumplings (Har Gow)' },
      { word: '好開心', romanization: 'hou2 hoi1 sam1', meaning: 'Very happy' },
    ],
    comprehensionQuestions: [
      {
        question: 'Which dim sum dishes did the family order?',
        options: ['Spring rolls and fried rice', 'Shrimp dumplings, siu mai, and char siu bao', 'Egg tarts and beef noodles', 'Congee and turnip cake'],
        correctIndex: 1,
        explanation: 'They ordered 蝦餃 (har gow), 燒賣 (siu mai), and 叉燒包 (char siu bao).',
      },
    ],
  },
];

export function getStoriesForLanguage(variantId: string): GradedStory[] {
  const norm = variantId === 'zh-cmn' ? 'zh' : variantId;
  return GRADED_STORIES.filter((s) => s.languageVariantId === norm);
}
