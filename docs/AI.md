# AI Integration

## Features

Linguadaily currently uses Gemini for three learner-facing workflows:

| Feature | Endpoint | Purpose |
|---|---|---|
| Sentence Studio | `/api/gemini/dialogue-check` | Evaluate a learner sentence and provide corrections/guidance |
| Word explanation | `/api/gemini/explain-word` | Explain vocabulary in learner-friendly detail |
| Custom word | `/api/gemini/generate-custom-word` | Generate a custom learning item |
| Health | `/api/gemini/health` | Confirm AI route configuration |

## Environment variable

Set this on Vercel:

```text
GEMINI_API_KEY=...
```

Use Production for the live deployment. Add Preview as well if preview deployments should have AI enabled.

Never place this value in React code, `public/`, or a committed `.env` file.

## Model

The server-side AI routes use:

```text
 gemini-3.8-flash
```

The implementation uses Google's supported server-side Gemini SDK/REST-compatible flow and requests structured JSON where the endpoint needs structured output.

## Request flow

```text
AI UI
  ↓
src/services/aiApi.ts
  ↓
/api/gemini/dialogue-check
  ↓
Vercel function
  ↓
GEMINI_API_KEY
  ↓
Google Gemini
  ↓
validated JSON response
  ↓
AI UI
```

## Health check

After deployment, open:

```text
https://YOUR-DOMAIN/api/gemini/health
```

A healthy configuration should report that the service is configured. If it reports that the key is not configured, set the environment variable in Vercel and redeploy.

## Common failures

### `AI service returned an error`

The UI should now expose a more specific server/API message. Check the browser network request for the failing `/api/gemini/*` route and check the Vercel function logs.

### Key is missing

Set `GEMINI_API_KEY` in the correct Vercel environment and create a new deployment.

### AI works locally but not on Vercel

Local `.env.local` values are not automatically available to Vercel. Configure the Vercel project environment variable separately.

### AI is unavailable offline

This is expected. Gemini is a network service. Offline packs provide language data, not an offline LLM.

### Rate limit or provider error

Retry later and inspect Vercel/Gemini usage limits. The frontend should not expose secrets while reporting a useful failure state.

## Language-quality rules

Cantonese must use authentic Cantonese wording and Jyutping. Do not substitute Mandarin pinyin for Cantonese. Do not attach Mandarin HSK metadata to Cantonese items.

AI-generated language content should be treated as untrusted until reviewed. Generation is not permission to publish directly to the curated production library.
