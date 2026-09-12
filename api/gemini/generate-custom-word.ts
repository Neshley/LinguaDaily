import { enforceRateLimit, generateGeminiJson, isPlainObject, optionalString, readJson, requiredString, sendJson } from './_shared';

const LEVELS = new Set(['beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced']);
const CATEGORIES = new Set(['Daily Essentials', 'Food & Drink', 'Travel & Places', 'Social & Feelings', 'Work & Study', 'Time & Numbers', 'Culture & Customs']);

export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;
  try {
    const body = await readJson(request);
    const input = requiredString(body.input, 'input', 240);
    const targetLanguage = requiredString(body.targetLanguage, 'targetLanguage', 60);
    const variety = optionalString(body.variety, 'variety', 80);
    const writingSystem = optionalString(body.writingSystem, 'writingSystem', 80);
    const pronunciationSystem = optionalString(body.pronunciationSystem, 'pronunciationSystem', 80);
    const context = `${targetLanguage} ${variety} ${pronunciationSystem}`.toLowerCase();
    const isMandarin = targetLanguage === 'zh-cmn' || context.includes('mandarin');
    const isCantonese = targetLanguage === 'zh-yue' || context.includes('cantonese');
    const pronunciationInstruction = isCantonese ? 'Use standard Jyutping with tone numbers.' : isMandarin ? 'Use Hanyu Pinyin with tone marks.' : `Use the language's standard pronunciation/romanization system${pronunciationSystem ? ` (${pronunciationSystem})` : ''}.`;
    const prompt = `Create one accurate vocabulary card for a learner of ${targetLanguage}${variety ? ` (${variety})` : ''}.\nLearner input: "${input}"\nWriting system: ${writingSystem || 'standard'}\nPronunciation system: ${pronunciationSystem || 'standard'}\n${isCantonese ? 'CANTONESE ONLY: use authentic Cantonese characters and standard Jyutping with tone numbers. Never Mandarin pinyin or HSK labels.' : ''}\n${isMandarin ? 'MANDARIN ONLY: use Mandarin vocabulary and grammar. Never Cantonese-only vocabulary or Jyutping.' : ''}\nPronunciation requirement: ${pronunciationInstruction}\nReturn ONLY valid JSON matching this exact shape: {"word": string, "phonetic": string, "meaning": string, "partOfSpeech": string, "category": string, "level": string, "exampleSentence": {"native": string, "phonetic": string, "translation": string}, "memoryTip": string}`;
    const card = await generateGeminiJson(prompt);
    if (!isPlainObject(card)) return sendJson(502, { error: 'Gemini returned an invalid vocabulary card.', code: 'INVALID_CARD' });
    const word = typeof card.word === 'string' ? card.word.trim() : '';
    const phonetic = typeof card.phonetic === 'string' ? card.phonetic.trim() : '';
    const meaning = typeof card.meaning === 'string' ? card.meaning.trim() : '';
    const example = isPlainObject(card.exampleSentence) ? card.exampleSentence : {};
    if (!word || !meaning || !phonetic || typeof example.native !== 'string' || typeof example.translation !== 'string') {
      return sendJson(502, { error: 'Gemini returned an incomplete vocabulary card.', code: 'INVALID_CARD' });
    }
    const partOfSpeech = typeof card.partOfSpeech === 'string' ? card.partOfSpeech.slice(0, 80) : 'Expression';
    const category = typeof card.category === 'string' && CATEGORIES.has(card.category) ? card.category : 'Daily Essentials';
    const level = typeof card.level === 'string' && LEVELS.has(card.level) ? card.level : 'beginner';
    return sendJson(200, { success: true, card: {
      word: word.slice(0, 160), phonetic: phonetic.slice(0, 200), meaning: meaning.slice(0, 500),
      partOfSpeech, category, level,
      exampleSentence: { native: String(example.native).slice(0, 600), phonetic: typeof example.phonetic === 'string' ? example.phonetic.slice(0, 600) : '', translation: String(example.translation).slice(0, 600) },
      memoryTip: typeof card.memoryTip === 'string' ? card.memoryTip.slice(0, 500) : '',
    }});
  } catch (error: any) {
    console.error('AI generate-custom-word error:', error);
    const status = Number(error?.status) || 500;
    return sendJson(status >= 400 && status < 600 ? status : 500, { error: error?.message || 'AI card generation failed', code: error?.code || 'AI_ERROR', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
