import { MODEL, sendJson } from './_shared';

export async function GET() {
  const configured = Boolean(process.env.GEMINI_API_KEY?.trim());
  return sendJson(200, {
    ok: true,
    configured,
    provider: 'Google Gemini API',
    model: MODEL,
  });
}
