import { generateGeminiJson, readJson, sendJson } from './_shared';

export async function POST(request: Request) {
  try {
    const { word, language, romanization, meaning, variety, writingSystem } = await readJson(request);
    if (!word || !language) return sendJson(400, { error: 'Word and language are required' });
    const context = `${language} ${variety || ''}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || language === 'zh-yue';
    const isMandarin = context.includes('mandarin') || language === 'zh' || language === 'zh-cmn';
    const guide = isCantonese ? 'Use standard Cantonese Jyutping with tone numbers; never Mandarin pinyin.' : isMandarin ? 'Use Hanyu Pinyin with tone marks.' : 'Use accurate native romanization/phonetics.';
    const prompt = `You are a world-class language tutor for ${language}${variety ? ` (${variety})` : ''}.
Explain the word "${word}" (${romanization || ''}), meaning "${meaning || ''}". Writing system: ${writingSystem || 'standard'}.
${guide}
Return ONLY valid JSON matching this exact shape:
{
  "etymologyOrMnemonic": "memorable explanation",
  "culturalContext": "brief natural/cultural usage nuance",
  "tonesOrPronunciationTip": "accurate pronunciation guidance",
  "sentences": [{"native":"natural sentence","romanization":"accurate reading","translation":"natural English"},{"native":"second natural sentence","romanization":"accurate reading","translation":"natural English"}],
  "synonymsOrRelated": [{"word":"related word","translation":"meaning"}]
}`;
    const data = await generateGeminiJson(prompt);
    return sendJson(200, { success: true, data });
  } catch (error: any) {
    console.error('AI explain-word error:', error);
    const status = Number(error?.status) || 500;
    return sendJson(status >= 400 && status < 600 ? status : 500, { error: error?.message || 'AI explanation failed', code: error?.code || 'AI_ERROR', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
