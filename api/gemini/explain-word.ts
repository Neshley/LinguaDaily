import { enforceRateLimit, generateGeminiJson, isPlainObject, optionalString, readJson, requiredString, sendJson } from './_shared';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;
  try {
    const body = await readJson(request);
    const word = requiredString(body.word, 'word', 120);
    const language = requiredString(body.language, 'language', 60);
    const romanization = optionalString(body.romanization, 'romanization', 160);
    const meaning = optionalString(body.meaning, 'meaning', 300);
    const variety = optionalString(body.variety, 'variety', 80);
    const writingSystem = optionalString(body.writingSystem, 'writingSystem', 80);
    const context = `${language} ${variety}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || language === 'zh-yue';
    const isMandarin = context.includes('mandarin') || language === 'zh' || language === 'zh-cmn';
    const guide = isCantonese ? 'Use standard Cantonese Jyutping with tone numbers; never Mandarin pinyin.' : isMandarin ? 'Use Hanyu Pinyin with tone marks.' : 'Use accurate native romanization/phonetics.';
    const prompt = `You are a world-class language tutor for ${language}${variety ? ` (${variety})` : ''}.\nExplain the word "${word}" (${romanization}), meaning "${meaning}". Writing system: ${writingSystem || 'standard'}.\n${guide}\nReturn ONLY valid JSON matching this exact shape: {"etymologyOrMnemonic": string, "culturalContext": string, "tonesOrPronunciationTip": string, "sentences": [{"native": string, "romanization": string, "translation": string}], "synonymsOrRelated": [{"word": string, "translation": string}]}`;
    const data = await generateGeminiJson(prompt);
    if (!isPlainObject(data) || typeof data.etymologyOrMnemonic !== 'string' || typeof data.culturalContext !== 'string' || !Array.isArray(data.sentences)) {
      return sendJson(502, { error: 'Gemini returned an incomplete word explanation.', code: 'INVALID_EXPLANATION' });
    }
    const sentences = data.sentences.filter(isPlainObject).slice(0, 3).map((sentence) => ({
      native: typeof sentence.native === 'string' ? sentence.native.slice(0, 500) : '',
      romanization: typeof sentence.romanization === 'string' ? sentence.romanization.slice(0, 500) : '',
      translation: typeof sentence.translation === 'string' ? sentence.translation.slice(0, 500) : '',
    })).filter((sentence) => sentence.native && sentence.translation);
    return sendJson(200, { success: true, data: {
      etymologyOrMnemonic: data.etymologyOrMnemonic.slice(0, 1200),
      culturalContext: data.culturalContext.slice(0, 1200),
      tonesOrPronunciationTip: typeof data.tonesOrPronunciationTip === 'string' ? data.tonesOrPronunciationTip.slice(0, 1200) : '',
      sentences,
      synonymsOrRelated: Array.isArray(data.synonymsOrRelated) ? data.synonymsOrRelated.filter(isPlainObject).slice(0, 10).map((item) => ({ word: typeof item.word === 'string' ? item.word.slice(0, 120) : '', translation: typeof item.translation === 'string' ? item.translation.slice(0, 300) : '' })).filter((item) => item.word) : [],
    }});
  } catch (error: any) {
    console.error('AI explain-word error:', error);
    const status = Number(error?.status) || 500;
    return sendJson(status >= 400 && status < 600 ? status : 500, { error: error?.message || 'AI explanation failed', code: error?.code || 'AI_ERROR', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
