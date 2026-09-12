import { boundedScore, enforceRateLimit, generateGeminiJson, isPlainObject, optionalString, readJson, requiredString, sendJson } from './_shared';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;
  try {
    const body = await readJson(request);
    const word = requiredString(body.word, 'word', 120);
    const language = requiredString(body.language, 'language', 60);
    const userSentence = requiredString(body.userSentence, 'userSentence', 1200);
    const variety = optionalString(body.variety, 'variety', 80);
    const context = `${language} ${variety}`.toLowerCase();
    const isCantonese = context.includes('cantonese') || language === 'zh-yue';
    const prompt = `You are an expert language tutor evaluating a learner's original sentence in ${language}${variety ? ` (${variety})` : ''}.\nTarget word: ${word}\nLearner sentence: ${userSentence}\nEvaluate grammar, naturalness, register, and correct use of the target word.\n${isCantonese ? 'This is authentic spoken Cantonese. Use Cantonese grammar and standard Jyutping with tone numbers. Do not judge it as Mandarin.' : ''}\nReturn ONLY valid JSON matching this exact shape: {"isCorrect": boolean, "score": number 0-100, "feedback": string, "correction": string, "correctionPhonetic": string, "translation": string}`;
    const evaluation = await generateGeminiJson(prompt);
    if (!isPlainObject(evaluation) || typeof evaluation.feedback !== 'string' || typeof evaluation.correction !== 'string' || typeof evaluation.translation !== 'string') {
      return sendJson(502, { error: 'Gemini returned an incomplete evaluation.', code: 'INVALID_EVALUATION' });
    }
    return sendJson(200, {
      success: true,
      evaluation: {
        ...evaluation,
        isCorrect: Boolean(evaluation.isCorrect),
        score: boundedScore(evaluation.score),
        feedback: evaluation.feedback.slice(0, 1200),
        correction: evaluation.correction.slice(0, 600),
        correctionPhonetic: typeof evaluation.correctionPhonetic === 'string' ? evaluation.correctionPhonetic.slice(0, 600) : '',
        translation: evaluation.translation.slice(0, 600),
      },
    });
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
