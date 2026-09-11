import { LearningItem } from '../../types/vocabulary';
import { generateLanguageLibrary } from '../generateAllLanguages';

export function extractMandarinTones(pinyin: string): number[] {
  const words = pinyin.split(/\s+/);
  const tones: number[] = [];
  const toneMarks: Record<string, number> = {
    ā: 1, ē: 1, ī: 1, ō: 1, ū: 1, ǖ: 1,
    á: 2, é: 2, í: 2, ó: 2, ú: 2, ǘ: 2,
    ǎ: 3, ě: 3, ǐ: 3, ǒ: 3, ǔ: 3, ǚ: 3,
    à: 4, è: 4, ì: 4, ò: 4, ù: 4, ǜ: 4,
  };

  for (const w of words) {
    let tone = 0;
    for (const char of w) {
      if (toneMarks[char]) {
        tone = toneMarks[char];
        break;
      }
    }
    tones.push(tone);
  }
  return tones.length > 0 ? tones : [1];
}

export function generateMandarinDataset(): LearningItem[] {
  const verbs = [
    { w: '吃', p: 'chī', m: 'to eat' },
    { w: '喝', p: 'hē', m: 'to drink' },
    { w: '看', p: 'kàn', m: 'to see / look / read' },
    { w: '听', p: 'tīng', m: 'to listen / hear' },
    { w: '说', p: 'shuō', m: 'to speak / say' },
    { w: '读', p: 'dú', m: 'to read / study' },
    { w: '写', p: 'xiě', m: 'to write' },
    { w: '买', p: 'mǎi', m: 'to buy' },
    { w: '卖', p: 'mài', m: 'to sell' },
    { w: '走', p: 'zǒu', m: 'to walk / leave' },
    { w: '跑', p: 'pǎo', m: 'to run' },
    { w: '来', p: 'lái', m: 'to come' },
    { w: '去', p: 'qù', m: 'to go' },
    { w: '坐', p: 'zuò', m: 'to sit / take (vehicle)' },
    { w: '开', p: 'kāi', m: 'to open / drive' },
    { w: '关', p: 'guān', m: 'to close / turn off' },
    { w: '住', p: 'zhù', m: 'to live / reside' },
    { w: '找', p: 'zhǎo', m: 'to seek / look for' },
    { w: '等', p: 'děng', m: 'to wait' },
    { w: '问', p: 'wèn', m: 'to ask' },
    { w: '教', p: 'jiāo', m: 'to teach' },
    { w: '学', p: 'xué', m: 'to learn / study' },
    { w: '做', p: 'zuò', m: 'to do / make' },
    { w: '给', p: 'gěi', m: 'to give' },
    { w: '穿', p: 'chuān', m: 'to wear / put on' },
    { w: '洗', p: 'xǐ', m: 'to wash' },
    { w: '玩', p: 'wán', m: 'to play / enjoy' },
    { w: '懂', p: 'dǒng', m: 'to understand' },
    { w: '帮', p: 'bāng', m: 'to help' },
    { w: '想', p: 'xiǎng', m: 'to think / want / miss' },
    { w: '要', p: 'yào', m: 'to want / need' },
    { w: '用', p: 'yòng', m: 'to use' },
    { w: '见', p: 'jiàn', m: 'to meet / see' },
    { w: '带', p: 'dài', m: 'to bring / carry' },
    { w: '换', p: 'huàn', m: 'to change / exchange' },
    { w: '点', p: 'diǎn', m: 'to order (food)' },
    { w: '收', p: 'shōu', m: 'to receive / collect' },
    { w: '发', p: 'fā', m: 'to send / dispatch' },
    { w: '查', p: 'chá', m: 'to search / look up' },
    { w: '练习', p: 'liànxí', m: 'to practice / exercise' },
    { w: '准备', p: 'zhǔnbèi', m: 'to prepare' },
    { w: '介绍', p: 'jièshào', m: 'to introduce' },
    { w: '推荐', p: 'tuījiàn', m: 'to recommend' },
    { w: '商量', p: 'shāngliang', m: 'to discuss' },
    { w: '考虑', p: 'kǎolǜ', m: 'to consider' },
    { w: '决定', p: 'juédìng', m: 'to decide' },
    { w: '安排', p: 'ānpái', m: 'to arrange' },
    { w: '预订', p: 'yùdìng', m: 'to book / reserve' },
    { w: '扫码', p: 'sǎomǎ', m: 'to scan QR code' },
    { w: '支付', p: 'zhīfù', m: 'to pay' },
    { w: '打折', p: 'dǎzhé', m: 'to give discount' },
    { w: '退房', p: 'tuìfáng', m: 'to check out (hotel)' },
    { w: '入住', p: 'rùzhù', m: 'to check in (hotel)' },
    { w: '拍照', p: 'pāizhào', m: 'to take photo' },
    { w: '唱歌', p: 'chànggē', m: 'to sing song' },
    { w: '跳舞', p: 'tiàowǔ', m: 'to dance' },
    { w: '锻炼', p: 'duànliàn', m: 'to exercise body' },
    { w: '打扫', p: 'dǎsǎo', m: 'to clean up' },
    { w: '收拾', p: 'shōushi', m: 'to tidy up' },
    { w: '借', p: 'jiè', m: 'to borrow / lend' },
    { w: '还', p: 'huán', m: 'to return (object)' },
    { w: '存', p: 'cún', m: 'to deposit / save' },
    { w: '取', p: 'qǔ', m: 'to withdraw / take' },
    { w: '挂号', p: 'guàhào', m: 'to register (hospital)' },
    { w: '点赞', p: 'diǎnzàn', m: 'to like (social media)' },
  ];

  const nouns = [
    { w: '米饭', p: 'mǐfàn', m: 'steamed rice', c: 'Food, Cooking & Dining' },
    { w: '面条', p: 'miàntiáo', m: 'noodles', c: 'Food, Cooking & Dining' },
    { w: '饺子', p: 'jiǎozi', m: 'dumplings', c: 'Food, Cooking & Dining' },
    { w: '包子', p: 'bāozi', m: 'steamed buns', c: 'Food, Cooking & Dining' },
    { w: '火锅', p: 'huǒguō', m: 'hotpot', c: 'Food, Cooking & Dining' },
    { w: '烤鸭', p: 'kǎoyā', m: 'roast duck', c: 'Food, Cooking & Dining' },
    { w: '牛肉', p: 'niúròu', m: 'beef', c: 'Food, Cooking & Dining' },
    { w: '猪肉', p: 'zhūròu', m: 'pork', c: 'Food, Cooking & Dining' },
    { w: '鸡肉', p: 'jīròu', m: 'chicken', c: 'Food, Cooking & Dining' },
    { w: '清蒸鱼', p: 'qīngzhēng yú', m: 'steamed fish', c: 'Food, Cooking & Dining' },
    { w: '豆腐', p: 'dòufu', m: 'tofu', c: 'Food, Cooking & Dining' },
    { w: '新鲜青菜', p: 'xīnxiān qīngcài', m: 'fresh greens', c: 'Food, Cooking & Dining' },
    { w: '西红柿', p: 'xīhóngshì', m: 'tomato', c: 'Food, Cooking & Dining' },
    { w: '鸡蛋', p: 'jīdàn', m: 'eggs', c: 'Food, Cooking & Dining' },
    { w: '龙井茶', p: 'Lóngjǐng chá', m: 'Longjing tea', c: 'Food, Cooking & Dining' },
    { w: '黑咖啡', p: 'hēi kāfēi', m: 'black coffee', c: 'Food, Cooking & Dining' },
    { w: '温开水', p: 'wēn kāishuǐ', m: 'warm water', c: 'Food, Cooking & Dining' },
    { w: '新鲜水果', p: 'xīnxiān shuǐguǒ', m: 'fresh fruit', c: 'Food, Cooking & Dining' },
    { w: '红富士苹果', p: 'Hóngfùshì píngguǒ', m: 'Fuji apple', c: 'Food, Cooking & Dining' },
    { w: '冰镇西瓜', p: 'bīngzhèn xīguā', m: 'chilled watermelon', c: 'Food, Cooking & Dining' },
    { w: '高铁车票', p: 'gāotiě chēpiào', m: 'high-speed rail ticket', c: 'Travel, Transport & Directions' },
    { w: '飞机机票', p: 'fēijī jīpiào', m: 'flight ticket', c: 'Travel, Transport & Directions' },
    { w: '地铁卡', p: 'dìtiěkǎ', m: 'metro card', c: 'Travel, Transport & Directions' },
    { w: '出租车', p: 'chūzūchē', m: 'taxi', c: 'Travel, Transport & Directions' },
    { w: '行李箱', p: 'xínglixiāng', m: 'suitcase / luggage', c: 'Travel, Transport & Directions' },
    { w: '护照证件', p: 'hùzhào zhèngjiàn', m: 'passport document', c: 'Travel, Transport & Directions' },
    { w: '故宫门票', p: 'Gùgōng ménpiào', m: 'Forbidden City ticket', c: 'Travel, Transport & Directions' },
    { w: '豪华酒店', p: 'háohuá jiǔdiàn', m: 'luxury hotel', c: 'Travel, Transport & Directions' },
    { w: '特色民宿', p: 'tèsè mínsù', m: 'boutique guesthouse', c: 'Travel, Transport & Directions' },
    { w: '导航地图', p: 'dǎoháng dìtú', m: 'navigation map', c: 'Travel, Transport & Directions' },
    { w: '羽绒外套', p: 'yǔróng wàitào', m: 'down jacket', c: 'Clothing & Fashion' },
    { w: '纯棉衬衫', p: 'chúnmián chènshān', m: 'cotton shirt', c: 'Clothing & Fashion' },
    { w: '运动鞋', p: 'yùndòngxié', m: 'sneakers / sports shoes', c: 'Clothing & Fashion' },
    { w: '太阳墨镜', p: 'tàiyáng mòjìng', m: 'sunglasses', c: 'Clothing & Fashion' },
    { w: '真皮钱包', p: 'zhēnpí qiánbāo', m: 'leather wallet', c: 'Shopping, Money & Finance' },
    { w: '现金纸币', p: 'xiànjīn zhǐbì', m: 'cash paper notes', c: 'Shopping, Money & Finance' },
    { w: '银行信用卡', p: 'yínháng xìnyòngkǎ', m: 'bank credit card', c: 'Shopping, Money & Finance' },
    { w: '正规发票', p: 'zhèngguī fāpiào', m: 'official tax invoice', c: 'Shopping, Money & Finance' },
    { w: '优惠折扣券', p: 'yōuhuì zhékòujuàn', m: 'discount coupon', c: 'Shopping, Money & Finance' },
    { w: '微信零钱', p: 'Wēixìn língqián', m: 'WeChat change wallet', c: 'Shopping, Money & Finance' },
    { w: '智能手机', p: 'zhìnéng shǒujī', m: 'smart phone', c: 'Technology, Computers & Software' },
    { w: '笔记本电脑', p: 'bǐjìběn diànnǎo', m: 'laptop computer', c: 'Technology, Computers & Software' },
    { w: '无线耳机', p: 'wúxiàn ěrjī', m: 'wireless earphones', c: 'Technology, Computers & Software' },
    { w: '移动电源', p: 'yídòng diànyuán', m: 'power bank', c: 'Technology, Computers & Software' },
    { w: '办公桌椅', p: 'bàngōng zhuōyǐ', m: 'office desk and chair', c: 'Work, Office & Business' },
    { w: '工作邮件', p: 'gōngzuò yóujiàn', m: 'work email', c: 'Work, Office & Business' },
    { w: '业务合同', p: 'yèwù hétong', m: 'business contract', c: 'Work, Office & Business' },
    { w: '年度报告', p: 'niándù bàogào', m: 'annual report', c: 'Work, Office & Business' },
    { w: '项目方案', p: 'xiàngmù fāng’àn', m: 'project plan', c: 'Work, Office & Business' },
    { w: '紧急会议', p: 'jǐnjí huìyì', m: 'urgent meeting', c: 'Work, Office & Business' },
    { w: '中文教材', p: 'Zhōngwén jiàocái', m: 'Chinese textbook', c: 'School, Study & Education' },
    { w: '课堂笔记', p: 'kètáng bǐjì', m: 'class notes', c: 'School, Study & Education' },
    { w: '考试成绩', p: 'kǎoshì chéngjì', m: 'exam score', c: 'School, Study & Education' },
    { w: '奖学金', p: 'jiǎngxuéjīn', m: 'scholarship', c: 'School, Study & Education' },
    { w: '感冒药丸', p: 'gǎnmào yàowán', m: 'cold medicine tablets', c: 'Health, Body & Wellness' },
    { w: '医用口罩', p: 'yīyòng kǒuzhào', m: 'surgical face mask', c: 'Health, Body & Wellness' },
    { w: '体温计', p: 'tǐwēnjì', m: 'thermometer', c: 'Health, Body & Wellness' },
    { w: '维生素片', p: 'wéishēngsù piàn', m: 'vitamin tablets', c: 'Health, Body & Wellness' },
    { w: '经典电影', p: 'jīngdiǎn diànyǐng', m: 'classic cinema movie', c: 'Entertainment, Music & Cinema' },
    { w: '流行音乐', p: 'liúxíng yīnyuè', m: 'pop music song', c: 'Entertainment, Music & Cinema' },
  ];

  const adjectives = [
    { w: '美味', p: 'měiwèi', m: 'delicious', c: 'Food, Cooking & Dining' },
    { w: '方便', p: 'fāngbiàn', m: 'convenient', c: 'Daily Life' },
    { w: '舒服', p: 'shūfu', m: 'comfortable', c: 'Daily Life' },
    { w: '干净', p: 'gānjìng', m: 'clean', c: 'Home & Living' },
    { w: '便宜', p: 'piányi', m: 'cheap / affordable', c: 'Shopping & Money' },
    { w: '贵', p: 'guì', m: 'expensive', c: 'Shopping & Money' },
    { w: '漂亮', p: 'piàoliang', m: 'beautiful', c: 'Daily Life' },
    { w: '热情', p: 'rèqíng', m: 'warm / hospitable', c: 'People & Family' },
    { w: '认真', p: 'rènzhēn', m: 'conscientious / earnest', c: 'Work & Study' },
    { w: '幽默', p: 'yōumò', m: 'humorous', c: 'People & Family' },
  ];

  const phrases = [
    { w: '早上好', p: 'zǎoshang hǎo', m: 'Good morning', c: 'Greetings & Introductions', exN: '早上好，吃过早饭了吗？', exP: 'Zǎoshang hǎo, chī guò zǎofàn le ma?', exT: 'Good morning, have you had breakfast?' },
    { w: '辛苦了', p: 'xīnkǔ le', m: 'Thank you for your hard work', c: 'Work, Office & Business', exN: '今天大家都很给力，辛苦了！', exP: 'Jīntiān dàjiā dōu hěn gěilì, xīnkǔ le!', exT: 'Everyone did great today, thanks for your hard work!' },
    { w: '没关系', p: 'méi guānxi', m: 'No problem / It does not matter', c: 'Politeness & Apologies', exN: '不要紧，没关系的。', exP: 'Bùyàojǐn, méi guānxi de.', exT: 'Do not worry, it is completely fine.' },
    { w: '随时联系', p: 'suíshí liánxì', m: 'Keep in touch anytime', c: 'Communication', exN: '有什么需要随时联系我。', exP: 'Yǒu shénme xūyào suíshí liánxì wǒ.', exT: 'Feel free to contact me anytime you need anything.' },
    { w: '一路平安', p: 'yīlù píng’ān', m: 'Have a safe journey', c: 'Travel, Tourism & Hotels', exN: '明天启程，祝你一路平安！', exP: 'Míngtiān qǐchéng, zhù nǐ yīlù píng’ān!', exT: 'Departing tomorrow, wishing you a safe journey!' },
  ];

  const questions = [
    { w: '这是什么？', p: 'Zhè shì shénme?', m: 'What is this?', exN: '请问这个是什么特色小吃？', exP: 'Qǐngwèn zhège shì shénme tèsè xiǎochī?', exT: 'Excuse me, what specialty snack is this?' },
    { w: '洗手间在哪里？', p: 'Xǐshǒujiān zài nǎlǐ?', m: 'Where is the restroom?', exN: '劳驾，请问洗手间在哪里？', exP: 'Láojià, qǐngwèn xǐshǒujiān zài nǎlǐ?', exT: 'Excuse me, where is the restroom?' },
    { w: '这个多少钱？', p: 'Zhège duōshao qián?', m: 'How much does this cost?', exN: '老板，这盒茶叶多少钱？', exP: 'Lǎobǎn, zhè hé cháyè duōshao qián?', exT: 'Shopkeeper, how much is this box of tea?' },
    { w: '怎么走？', p: 'Zěnme zǒu?', m: 'How to get there?', exN: '去最近的地铁站怎么走？', exP: 'Qù zuì jìn de dìtiě zhàn zěnme zǒu?', exT: 'How do I get to the nearest subway station?' },
  ];

  const responses = [
    { w: '好的', p: 'hǎo de', m: 'Okay / Sure', exN: '好的，我马上安排。', exP: 'Hǎo de, wǒ mǎshàng ānpái.', exT: 'Okay, I will arrange it right away.' },
    { w: '没问题', p: 'méi wèntí', m: 'No problem', exN: '没问题，交给我吧！', exP: 'Méi wèntí, jiāo gěi wǒ ba!', exT: 'No problem, leave it to me!' },
    { w: '当然可以', p: 'dāngrán kěyǐ', m: 'Of course you can', exN: '当然可以，请随意看。', exP: 'Dāngrán kěyǐ, qǐng suíyì kàn.', exT: 'Of course you can, please feel free to look.' },
    { w: '算了吧', p: 'suàn le ba', m: 'Let it be / Never mind', exN: '既然下雨了，算了吧，改天再去。', exP: 'Jìrán xiàyǔ le, suàn le ba, gǎitiān zài qù.', exT: 'Since it is raining, let it be, let us go another day.' },
  ];

  return generateLanguageLibrary('zh', 'zh-cmn', {
    verbs,
    nouns,
    adjectives,
    phrases,
    questions,
    responses,
    buildExample: (v, n) => {
      const pinyin = `${v.p} ${n.p}`;
      return {
        n: `他经常在周末${v.w}${n.w}。`,
        p: `Tā jīngcháng zài zhōumò ${pinyin}.`,
        t: `He often ${v.m}s ${n.m} on weekends.`,
      };
    },
  });
}
