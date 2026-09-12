export const MODEL = 'gemini-3.8-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_BODY_BYTES = 32_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function sendJson(res: ResponseInit | number, body?: unknown) {
  const status = typeof res === 'number' ? res : (res.status || 200);
  return Response.json(body ?? {}, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...(typeof res === 'object' && res?.headers ? res.headers : {}),
    },
  });
}

function clientKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'anonymous';
}

export function enforceRateLimit(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return null;
  }
  if (current.count >= RATE_LIMIT) {
    return sendJson(429, {
      error: 'Too many AI requests. Please wait a minute and try again.',
      code: 'RATE_LIMIT',
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    });
  }
  current.count += 1;
  return null;
}

export async function readJson(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    const error = new Error('Request body is too large.');
    (error as any).status = 413;
    (error as any).code = 'BODY_TOO_LARGE';
    throw error;
  }
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      const error = new Error('Request body must be a JSON object.');
      (error as any).status = 400;
      (error as any).code = 'INVALID_BODY';
      throw error;
    }
    const serialized = JSON.stringify(body);
    if (serialized.length > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large.');
      (error as any).status = 413;
      (error as any).code = 'BODY_TOO_LARGE';
      throw error;
    }
    return body as Record<string, unknown>;
  } catch (error: any) {
    if (error?.status) throw error;
    const invalid = new Error('Invalid JSON request body.');
    (invalid as any).status = 400;
    (invalid as any).code = 'INVALID_JSON';
    throw invalid;
  }
}

export function requiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim()) {
    const error = new Error(`${field} is required.`);
    (error as any).status = 400;
    (error as any).code = 'INVALID_INPUT';
    throw error;
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    const error = new Error(`${field} must be ${maxLength} characters or fewer.`);
    (error as any).status = 400;
    (error as any).code = 'INPUT_TOO_LONG';
    throw error;
  }
  return trimmed;
}

export function optionalString(value: unknown, field: string, maxLength: number) {
  if (value == null || value === '') return '';
  return requiredString(value, field, maxLength);
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
    (error as any).status = 503;
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

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
      (error as any).status = 502;
      throw error;
    }

    return parseJson(text);
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Gemini took too long to respond. Please try again.');
      (timeoutError as any).code = 'TIMEOUT';
      (timeoutError as any).status = 504;
      throw timeoutError;
    }
    if (error instanceof SyntaxError) {
      const parseError = new Error('Gemini returned malformed JSON.');
      (parseError as any).code = 'INVALID_MODEL_JSON';
      (parseError as any).status = 502;
      throw parseError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function boundedScore(value: unknown) {
  const score = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}
