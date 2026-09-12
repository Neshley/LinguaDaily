export type AiError = Error & { code?: string; isApiKeyMissing?: boolean };

async function postAi(path: string, body: unknown) {
  if (!navigator.onLine) {
    const error: AiError = new Error('AI features need an internet connection. Your downloaded language content is still available offline.');
    error.code = 'OFFLINE';
    throw error;
  }
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    const error: AiError = new Error('The AI service could not be reached. Check your connection and try again.');
    error.code = 'NETWORK';
    throw error;
  }
  const contentType = response.headers.get('content-type') || '';
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    const fallback = response.status === 404
      ? 'The AI endpoint is not deployed. Redeploy the latest project to Vercel.'
      : !contentType.includes('application/json')
        ? `The AI server returned an unexpected response (HTTP ${response.status}). Check the Vercel Function logs.`
        : 'The AI service returned an error.';
    const error: AiError = new Error(data.error || fallback);
    error.isApiKeyMissing = Boolean(data.isApiKeyMissing);
    error.code = response.status === 429 ? 'RATE_LIMIT' : response.status === 401 || response.status === 403 ? 'AUTH' : data.code || 'AI_ERROR';
    throw error;
  }
  return data;
}

export const aiApi = {
  dialogueCheck: (body: unknown) => postAi('/api/gemini/dialogue-check', body),
  explainWord: (body: unknown) => postAi('/api/gemini/explain-word', body),
  generateCustomWord: (body: unknown) => postAi('/api/gemini/generate-custom-word', body),
};
