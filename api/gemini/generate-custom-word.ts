import { getGeminiClient, MODEL, parseJson, sendJson } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const { input, targetLanguage, variety, writingSystem } = req.body || {};
    if (!input || !targetLanguage) return sendJson(res, 400, { error: 'Input and targetLanguage are required' });
    const context = `${targetLanguage} ${variety || ''}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || targetLanguage === 'zh-yue';
    const isMandarin = context.includes('mandarin') || targetLanguage === 'zh' || targetLanguage === 'zh-cmn';
    const prompt = `Create one accurate vocabulary card for a learner of ${targetLanguage}${variety ? ` (${variety})` : ''}.
Learner input: "${input}"
Writing system: ${writingSystem || 'standard'}
${isCantonese ? 'CANTONESE ONLY: use authentic Cantonese characters and standard Jyutping with tone numbers. Never Mandarin pinyin or HSK labels.' : ''}
Return ONLY valid JSON:
{
 "word":"native word",
 "phonetic":"accurate reading",
 "meaning":"clear English meaning",
 "partOfSpeech":"Noun, Verb, Adjective, Idiom, Expression, Particle, or Measure Word",
 "category":"Daily Essentials, Food & Drink, Travel & Places, Social & Feelings, Work & Study, Time & Numbers, or Culture & Customs",
 "level":"appropriate level",
 "exampleSentence":{"native":"natural high-frequency sentence","phonetic":"accurate reading","translation":"natural English"},
 "memoryTip":"short useful memory tip"
}`;
    const ai = getGeminiClient();
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt, config: { responseMimeType: 'application/json' } });
    return sendJson(res, 200, { success: true, card: parseJson(result.text || '{}') });
  } catch (error: any) {
    console.error('AI generate-custom-word error:', error);
    return sendJson(res, 500, { error: error?.message || 'AI card generation failed', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
