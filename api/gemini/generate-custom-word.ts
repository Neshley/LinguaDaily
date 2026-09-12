import { generateGeminiJson, readJson, sendJson } from './_shared';

export async function POST(request: Request) {
  try {
    const { input, targetLanguage, variety, writingSystem } = await readJson(request);
    if (!input || !targetLanguage) return sendJson(400, { error: 'Input and targetLanguage are required' });
    const context = `${targetLanguage} ${variety || ''}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || targetLanguage === 'zh-yue';
    const prompt = `Create one accurate vocabulary card for a learner of ${targetLanguage}${variety ? ` (${variety})` : ''}.
Learner input: "${input}"
Writing system: ${writingSystem || 'standard'}
${isCantonese ? 'CANTONESE ONLY: use authentic Cantonese characters and standard Jyutping with tone numbers. Never Mandarin pinyin or HSK labels.' : ''}
Return ONLY valid JSON matching this exact shape:
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
    const card = await generateGeminiJson(prompt);
    return sendJson(200, { success: true, card });
  } catch (error: any) {
    console.error('AI generate-custom-word error:', error);
    const status = Number(error?.status) || 500;
    return sendJson(status >= 400 && status < 600 ? status : 500, { error: error?.message || 'AI card generation failed', code: error?.code || 'AI_ERROR', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
