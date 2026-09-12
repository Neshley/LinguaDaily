import { generateGeminiJson, readJson, sendJson } from './_shared';

export async function POST(request: Request) {
  try {
    const { input, targetLanguage, variety, writingSystem, pronunciationSystem } = await readJson(request);
    if (!input || !targetLanguage) return sendJson(400, { error: 'Input and targetLanguage are required' });
    const context = `${targetLanguage} ${variety || ''} ${pronunciationSystem || ''}`.toLowerCase();
    const isMandarin = targetLanguage === 'zh-cmn' || context.includes('mandarin');
    const isCantonese = targetLanguage === 'zh-yue' || context.includes('cantonese');
    const pronunciationInstruction = isCantonese
      ? 'Use standard Jyutping with tone numbers.'
      : isMandarin
        ? 'Use Hanyu Pinyin with tone marks (for example chī, hē, kàn), not Cantonese Jyutping.'
        : `Use the language's standard pronunciation/romanization system${pronunciationSystem ? ` (${pronunciationSystem})` : ''}.`; 
    const prompt = `Create one accurate vocabulary card for a learner of ${targetLanguage}${variety ? ` (${variety})` : ''}.
Learner input: "${input}"
Writing system: ${writingSystem || 'standard'}
Pronunciation system: ${pronunciationSystem || 'standard'}
${isCantonese ? 'CANTONESE ONLY: use authentic Cantonese characters and standard Jyutping with tone numbers. Never Mandarin pinyin or HSK labels.' : ''}
${isMandarin ? 'MANDARIN ONLY: use Mandarin vocabulary and grammar. Never Cantonese-only vocabulary or Jyutping.' : ''}
Pronunciation requirement: ${pronunciationInstruction}
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
    if (!card || typeof card !== 'object' || typeof card.word !== 'string' || typeof card.meaning !== 'string') {
      return sendJson(502, { error: 'Gemini returned an incomplete vocabulary card.', code: 'INVALID_CARD' });
    }
    return sendJson(200, { success: true, card });
  } catch (error: any) {
    console.error('AI generate-custom-word error:', error);
    const status = Number(error?.status) || 500;
    return sendJson(status >= 400 && status < 600 ? status : 500, { error: error?.message || 'AI card generation failed', code: error?.code || 'AI_ERROR', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
