# LinguaDaily AI production setup

The AI UI calls `/api/gemini/*`. Vercel treats the TypeScript files under `/api` as serverless functions, so the Gemini key never reaches the browser.

## Required Vercel environment variable

Set:

`GEMINI_API_KEY=your_google_ai_studio_key`

Add it to Production (and Preview if you want AI on preview deployments).

The app uses the stable `gemini-3.8-flash` model.

## AI features

- `/api/gemini/dialogue-check` — Sentence Studio evaluation
- `/api/gemini/explain-word` — vocabulary deep dive
- `/api/gemini/generate-custom-word` — AI custom flashcard generation

## Offline behavior

AI calls intentionally require an internet connection. Downloaded language packs, vocabulary search, review data, bookmarks, and local learning state remain usable offline. When the device reconnects, AI controls become available again.
