import { getGeminiClient, MODEL, parseJson, sendJson } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const { word, language, romanization, meaning, variety, writingSystem } = req.body || {};
    if (!word || !language) return sendJson(res, 400, { error: 'Word and language are required' });
    const context = `${language} ${variety || ''}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || language === 'zh-yue';
    const isMandarin = context.includes('mandarin') || language === 'zh' || language === 'zh-cmn';
    const guide = isCantonese ? 'Use standard Cantonese Jyutping with tone numbers; never Mandarin pinyin.' : isMandarin ? 'Use Hanyu Pinyin with tone marks.' : 'Use accurate native romanization/phonetics.';
    const prompt = `You are a world-class language tutor for ${language}${variety ? ` (${variety})` : ''}.
Explain the word "${word}" (${romanization || ''}), meaning "${meaning || ''}". Writing system: ${writingSystem || 'standard'}.
${guide}
Return ONLY valid JSON:
{
  "etymologyOrMnemonic": "memorable explanation",
  "culturalContext": "brief natural/cultural usage nuance",
  "tonesOrPronunciationTip": "accurate pronunciation guidance",
  "sentences": [{"native":"natural sentence","romanization":"accurate reading","translation":"natural English"},{"native":"second natural sentence","romanization":"accurate reading","translation":"natural English"}],
  "synonymsOrRelated": [{"word":"related word","translation":"meaning"}]
}`;
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt, config: { responseMimeType: 'application/json' } });
    return sendJson(res, 200, { success: true, data: parseJson(result.text || '{}') });
  } catch (error: any) {
    console.error('AI explain-word error:', error);
    return sendJson(res, 500, { error: error?.message || 'AI explanation failed', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
