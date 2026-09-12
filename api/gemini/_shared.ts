import { GoogleGenAI } from '@google/genai';

export const MODEL = 'gemini-3.8-flash';

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
  return new GoogleGenAI({ apiKey });
}

export function sendJson(res: any, status: number, body: unknown) {
  res.status(status).json(body);
}

export function parseJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}
