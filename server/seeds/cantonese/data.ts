import { LearningItem } from '../../types/vocabulary';
import { generateLanguageLibrary } from '../generateAllLanguages';

export function generateCantoneseDataset(): LearningItem[] {
  const verbs = [
    { w: '食', p: 'sik6', m: 'to eat', spec: { type: 'cantonese', data: { jyutping: 'sik6', tones: [6] } } },
    { w: '飲', p: 'jam2', m: 'to drink', spec: { type: 'cantonese', data: { jyutping: 'jam2', tones: [2] } } },
    { w: '睇', p: 'tai2', m: 'to see / look / watch', spec: { type: 'cantonese', data: { jyutping: 'tai2', tones: [2] } } },
    { w: '聽', p: 'teng1', m: 'to listen / hear', spec: { type: 'cantonese', data: { jyutping: 'teng1', tones: [1] } } },
    { w: '講', p: 'gong2', m: 'to speak / say', spec: { type: 'cantonese', data: { jyutping: 'gong2', tones: [2] } } },
    { w: '讀', p: 'duk6', m: 'to read / study', spec: { type: 'cantonese', data: { jyutping: 'duk6', tones: [6] } } },
    { w: '寫', p: 'se2', m: 'to write', spec: { type: 'cantonese', data: { jyutping: 'se2', tones: [2] } } },
    { w: '買', p: 'maai5', m: 'to buy', spec: { type: 'cantonese', data: { jyutping: 'maai5', tones: [5] } } },
    { w: '賣', p: 'maai6', m: 'to sell', spec: { type: 'cantonese', data: { jyutping: 'maai6', tones: [6] } } },
    { w: '行', p: 'haang4', m: 'to walk', spec: { type: 'cantonese', data: { jyutping: 'haang4', tones: [4] } } },
    { w: '走', p: 'zau2', m: 'to leave / run', spec: { type: 'cantonese', data: { jyutping: 'zau2', tones: [2] } } },
    { w: '嚟', p: 'lai4', m: 'to come', spec: { type: 'cantonese', data: { jyutping: 'lai4', tones: [4] } } },
    { w: '去', p: 'heoi3', m: 'to go', spec: { type: 'cantonese', data: { jyutping: 'heoi3', tones: [3] } } },
    { w: '坐', p: 'co5', m: 'to sit / take vehicle', spec: { type: 'cantonese', data: { jyutping: 'co5', tones: [5] } } },
    { w: '開', p: 'hoi1', m: 'to open / drive', spec: { type: 'cantonese', data: { jyutping: 'hoi1', tones: [1] } } },
    { w: '閂', p: 'saan1', m: 'to close / shut', spec: { type: 'cantonese', data: { jyutping: 'saan1', tones: [1] } } },
    { w: '住', p: 'zyu6', m: 'to live / reside', spec: { type: 'cantonese', data: { jyutping: 'zyu6', tones: [6] } } },
    { w: '搵', p: 'wan2', m: 'to search / find / look for', spec: { type: 'cantonese', data: { jyutping: 'wan2', tones: [2] } } },
    { w: '等', p: 'dang2', m: 'to wait', spec: { type: 'cantonese', data: { jyutping: 'dang2', tones: [2] } } },
    { w: '問', p: 'man6', m: 'to ask', spec: { type: 'cantonese', data: { jyutping: 'man6', tones: [6] } } },
    { w: '教', p: 'gaau3', m: 'to teach', spec: { type: 'cantonese', data: { jyutping: 'gaau3', tones: [3] } } },
    { w: '學', p: 'hok6', m: 'to learn', spec: { type: 'cantonese', data: { jyutping: 'hok6', tones: [6] } } },
    { w: '做', p: 'zou6', m: 'to do / make', spec: { type: 'cantonese', data: { jyutping: 'zou6', tones: [6] } } },
    { w: '畀', p: 'bei2', m: 'to give', spec: { type: 'cantonese', data: { jyutping: 'bei2', tones: [2] } } },
    { w: '著', p: 'zoek3', m: 'to wear', spec: { type: 'cantonese', data: { jyutping: 'zoek3', tones: [3] } } },
    { w: '洗', p: 'sai2', m: 'to wash', spec: { type: 'cantonese', data: { jyutping: 'sai2', tones: [2] } } },
    { w: '玩', p: 'waan2', m: 'to play', spec: { type: 'cantonese', data: { jyutping: 'waan2', tones: [2] } } },
    { w: '識', p: 'sik1', m: 'to know / understand', spec: { type: 'cantonese', data: { jyutping: 'sik1', tones: [1] } } },
    { w: '幫', p: 'bong1', m: 'to help', spec: { type: 'cantonese', data: { jyutping: 'bong1', tones: [1] } } },
    { w: '諗', p: 'nam2', m: 'to think', spec: { type: 'cantonese', data: { jyutping: 'nam2', tones: [2] } } },
    { w: '要', p: 'jiu3', m: 'to want / need', spec: { type: 'cantonese', data: { jyutping: 'jiu3', tones: [3] } } },
    { w: '用', p: 'jung6', m: 'to use', spec: { type: 'cantonese', data: { jyutping: 'jung6', tones: [6] } } },
    { w: '見', p: 'gin3', m: 'to see / meet', spec: { type: 'cantonese', data: { jyutping: 'gin3', tones: [3] } } },
    { w: '帶', p: 'daai3', m: 'to bring / carry', spec: { type: 'cantonese', data: { jyutping: 'daai3', tones: [3] } } },
    { w: '換', p: 'wun6', m: 'to change / exchange', spec: { type: 'cantonese', data: { jyutping: 'wun6', tones: [6] } } },
    { w: '叫', p: 'giu3', m: 'to call / order', spec: { type: 'cantonese', data: { jyutping: 'giu3', tones: [3] } } },
    { w: '收', p: 'sau1', m: 'to receive', spec: { type: 'cantonese', data: { jyutping: 'sau1', tones: [1] } } },
    { w: '寄', p: 'gei3', m: 'to send / mail', spec: { type: 'cantonese', data: { jyutping: 'gei3', tones: [3] } } },
    { w: '查', p: 'caa4', m: 'to check / look up', spec: { type: 'cantonese', data: { jyutping: 'caa4', tones: [4] } } },
    { w: '練習', p: 'lin6 zaap6', m: 'to practice', spec: { type: 'cantonese', data: { jyutping: 'lin6 zaap6', tones: [6, 6] } } },
  ];

  const nouns = [
    { w: '點心', p: 'dim2 sam1', m: 'dim sum', c: 'Food, Cooking & Dining' },
    { w: '蝦餃', p: 'haa1 gaau2', m: 'har gow prawn dumplings', c: 'Food, Cooking & Dining' },
    { w: '燒賣', p: 'siu1 maai2', m: 'siu mai dumplings', c: 'Food, Cooking & Dining' },
    { w: '叉燒包', p: 'caa1 siu1 baau1', m: 'cha siu buns', c: 'Food, Cooking & Dining' },
    { w: '蛋撻', p: 'daan6 taat1', m: 'egg tarts', c: 'Food, Cooking & Dining' },
    { w: '港式奶茶', p: 'naai5 caa4', m: 'Hong Kong milk tea', c: 'Food, Cooking & Dining' },
    { w: '凍檸茶', p: 'dung3 ning4 caa4', m: 'iced lemon tea', c: 'Food, Cooking & Dining' },
    { w: '雲吞麵', p: 'wan4 tan1 min6', m: 'wonton noodles', c: 'Food, Cooking & Dining' },
    { w: '煲仔飯', p: 'bou1 zai2 faan6', m: 'claypot rice', c: 'Food, Cooking & Dining' },
    { w: '地鐵', p: 'dei6 tit3', m: 'MTR subway train', c: 'Travel, Transport & Directions' },
    { w: '的士', p: 'dik1 si2', m: 'taxi', c: 'Travel, Transport & Directions' },
    { w: '機場', p: 'gei1 coeng4', m: 'airport', c: 'Travel, Transport & Directions' },
    { w: '八達通', p: 'baat3 daat6 tung1', m: 'Octopus smart card', c: 'Shopping, Money & Finance' },
    { w: '銀包', p: 'ngan4 baau1', m: 'wallet', c: 'Shopping, Money & Finance' },
    { w: '現金', p: 'jin6 gam1', m: 'cash money', c: 'Shopping, Money & Finance' },
    { w: '信用卡', p: 'seon3 jung6 kaat1', m: 'credit card', c: 'Shopping, Money & Finance' },
    { w: '智能電話', p: 'din6 waa2', m: 'smartphone', c: 'Technology, Computers & Software' },
    { w: '手提電腦', p: 'din6 nou5', m: 'laptop computer', c: 'Technology, Computers & Software' },
    { w: '耳筒', p: 'ji5 tung2', m: 'earphones', c: 'Technology, Computers & Software' },
    { w: '廣東歌', p: 'Gwong2 dung1 go1', m: 'Cantopop song', c: 'Entertainment, Music & Cinema' },
  ];

  const adjectives = [
    { w: '好食', p: 'hou2 sik6', m: 'delicious (food)', c: 'Food, Cooking & Dining' },
    { w: '好飲', p: 'hou2 jam2', m: 'delicious (drink)', c: 'Food, Cooking & Dining' },
    { w: '方便', p: 'fong1 bin6', m: 'convenient', c: 'Daily Life & Routine' },
    { w: '乾淨', p: 'gon1 zeng6', m: 'clean', c: 'Home, Living & Interior' },
    { w: '平', p: 'peng4', m: 'cheap / inexpensive', c: 'Shopping, Money & Finance' },
    { w: '貴', p: 'gwai3', m: 'expensive', c: 'Shopping, Money & Finance' },
    { w: '靚', p: 'leng3', m: 'pretty / beautiful / high quality', c: 'Daily Life & Routine' },
  ];

  const phrases = [
    { w: '早晨', p: 'zou2 san4', m: 'Good morning', c: 'Greetings & Introductions', exN: '早晨！今日想食啲咩呀？', exP: 'zou2 san4! gam1 jat6 soeng2 sik6 di1 me1 aa3?', exT: 'Good morning! What do you want to eat today?' },
    { w: '唔該', p: 'm4 goi1', m: 'Thank you (service) / Excuse me', c: 'Politeness, Gratitude & Apologies', exN: '唔該，借借呀。', exP: 'm4 goi1, ze3 ze3 aa3.', exT: 'Excuse me, please let me pass.' },
    { w: '多謝', p: 'do1 ze6', m: 'Thank you (gift/compliment)', c: 'Politeness, Gratitude & Apologies', exN: '多謝你嘅禮物！', exP: 'do1 ze6 nei5 ge3 lai5 mat6!', exT: 'Thank you for your gift!' },
    { w: '唔緊要', p: 'm4 gan2 jiu3', m: 'Never mind / No problem', c: 'Politeness, Gratitude & Apologies', exN: '冇事嘅，唔緊要啦。', exP: 'mou5 si6 ge3, m4 gan2 jiu3 laa1.', exT: 'Nothing happened, it does not matter.' },
    { w: '拜拜', p: 'baai1 baai3', m: 'Bye-bye', c: 'Greetings & Introductions', exN: '聽日再見，拜拜！', exP: 'ting1 jat6 zoi3 gin3, baai1 baai3!', exT: 'See you tomorrow, bye-bye!' },
  ];

  const questions = [
    { w: '呢個係咩嚟㗎？', p: 'ni1 go3 hai6 me1 lai4 gaa3?', m: 'What is this?', exN: '請問呢個係咩嚟㗎？', exP: 'ceng2 man6 ni1 go3 hai6 me1 lai4 gaa3?', exT: 'Excuse me, what is this?' },
    { w: '洗手間喺邊度？', p: 'sai2 sau2 gaan1 hai2 bin1 dou6?', m: 'Where is the restroom?', exN: '唔該，請問洗手間喺邊度呀？', exP: 'm4 goi1, ceng2 man6 sai2 sau2 gaan1 hai2 bin1 dou6 aa3?', exT: 'Excuse me, may I ask where the restroom is?' },
    { w: '幾多錢呀？', p: 'gei2 do1 cin2 aa3?', m: 'How much is it?', exN: '老細，呢個幾多錢呀？', exP: 'lou5 sai3, ni1 go3 gei2 do1 cin2 aa3?', exT: 'Boss, how much is this?' },
  ];

  const responses = [
    { w: '好呀', p: 'hou2 aa3', m: 'Great / Sure', exN: '好呀，冇問題！', exP: 'hou2 aa3, mou5 man6 tai4!', exT: 'Great, no problem!' },
    { w: '冇問題', p: 'mou5 man6 tai4', m: 'No problem', exN: '交畀我，冇問題。', exP: 'gaau1 bei2 ngo5, mou5 man6 tai4.', exT: 'Leave it to me, no problem.' },
    { w: '得啦', p: 'dak1 laa1', m: 'Alright / Done', exN: '得啦，我搞掂喇。', exP: 'dak1 laa1, ngo5 gaau2 dim3 laa3.', exT: 'Done, I have sorted it out.' },
  ];

  return generateLanguageLibrary('zh', 'zh-yue', {
    verbs,
    nouns,
    adjectives,
    phrases,
    questions,
    responses,
    buildExample: (v, n) => {
      return {
        n: `我平時好鍾意${v.w}${n.w}。`,
        p: `Ngo5 ping4 si4 hou2 zung1 ji3 ${v.p} ${n.p}.`,
        t: `I usually really like to ${v.m} ${n.m}.`,
      };
    },
  });
}
