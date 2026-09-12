import { getGeminiClient, MODEL, parseJson, sendJson } from './_shared';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const { word, language, userSentence, variety } = req.body || {};
    if (!word || !language || !userSentence) return sendJson(res, 400, { error: 'word, language, and userSentence are required' });

    const isCantonese = `${language} ${variety || ''}`.toLowerCase().includes('cantonese') || language === 'zh-yue';
    const prompt = `You are an expert language tutor evaluating a learner's original sentence in ${language}${variety ? ` (${variety})` : ''}.
Target word: ${word}
Learner sentence: ${userSentence}
Evaluate grammar, naturalness, register, and correct use of the target word.
${isCantonese ? 'This is authentic spoken Cantonese. Use Cantonese grammar and standard Jyutping with tone numbers. Do not judge it as Mandarin.' : ''}
Return ONLY valid JSON:
{
  "isCorrect": boolean,
  "score": number,
  "feedback": "encouraging explanation in English",
  "correction": "natural corrected sentence in the target variety",
  "correctionPhonetic": "accurate pronunciation/romanization",
  "translation": "natural English translation"
}`;

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({ model: MODEL, contents: prompt, config: { responseMimeType: 'application/json' } });
    return sendJson(res, 200, { success: true, evaluation: parseJson(result.text || '{}') });
  } catch (error: any) {
    console.error('AI dialogue-check error:', error);
    return sendJson(res, 500, { error: error?.message || 'AI evaluation failed', isApiKeyMissing: !process.env.GEMINI_API_KEY });
  }
}
