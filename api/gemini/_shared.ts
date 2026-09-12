export const MODEL = 'gemini-3.8-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export function sendJson(res: ResponseInit | number, body?: unknown) {
  const status = typeof res === 'number' ? res : (res.status || 200);
  return Response.json(body ?? {}, { status });
}

export async function readJson(request: Request) {
  try {
    return await request.json() as Record<string, any>;
  } catch {
    return {};
  }
}

export function parseJson(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function generateGeminiJson(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured on the server.');
    (error as any).code = 'MISSING_API_KEY';
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 1200,
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    });

    const raw = await response.text();
    let payload: any = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch { /* handled below */ }

    if (!response.ok) {
      const apiMessage = payload?.error?.message || `Gemini API returned HTTP ${response.status}.`;
      const error = new Error(apiMessage);
      (error as any).status = response.status;
      (error as any).code = response.status === 429 ? 'RATE_LIMIT' : response.status === 401 || response.status === 403 ? 'AUTH' : 'GEMINI_API';
      throw error;
    }

    const text = payload?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part?.text || '')
      .join('')
      .trim();

    if (!text) {
      const blockReason = payload?.promptFeedback?.blockReason || payload?.candidates?.[0]?.finishReason;
      const error = new Error(blockReason ? `Gemini returned no text (${blockReason}).` : 'Gemini returned an empty response.');
      (error as any).code = 'EMPTY_RESPONSE';
      throw error;
    }

    return parseJson(text);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Gemini took too long to respond. Please try again.');
      (timeoutError as any).code = 'TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
