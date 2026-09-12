import { generateGeminiJson, readJson, sendJson } from './_shared';

export async function POST(request: Request) {
  try {
    const { word, language, userSentence, variety } = await readJson(request);
    if (!word || !language || !userSentence) return sendJson(400, { error: 'word, language, and userSentence are required' });

    const context = `${language} ${variety || ''}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || language === 'zh-yue';
    const prompt = `You are an expert language tutor evaluating a learner's original sentence in ${language}${variety ? ` (${variety})` : ''}.
Target word: ${word}
Learner sentence: ${userSentence}
Evaluate grammar, naturalness, register, and correct use of the target word.
${isCantonese ? 'This is authentic spoken Cantonese. Use Cantonese grammar and standard Jyutping with tone numbers. Do not judge it as Mandarin.' : ''}
Return ONLY valid JSON matching this exact shape:
{
  "isCorrect": boolean,
  "score": number,
  "feedback": "encouraging explanation in English",
  "correction": "natural corrected sentence in the target variety",
  "correctionPhonetic": "accurate pronunciation/romanization",
  "translation": "natural English translation"
}`;

    const evaluation = await generateGeminiJson(prompt);
    return sendJson(200, { success: true, evaluation });
  } catch (error: any) {
    console.error('AI dialogue-check error:', error);
    const status = Number(error?.status) || 500;
    return sendJson(status >= 400 && status < 600 ? status : 500, {
      error: error?.message || 'AI evaluation failed',
      code: error?.code || 'AI_ERROR',
      isApiKeyMissing: !process.env.GEMINI_API_KEY,
    });
  }
}
