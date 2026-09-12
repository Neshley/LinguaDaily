export async function GET() {
  const configured = Boolean(process.env.GEMINI_API_KEY?.trim());
  return Response.json({
    ok: true,
    configured,
    provider: 'Google Gemini API',
    model: 'gemini-3.8-flash',
  });
}
