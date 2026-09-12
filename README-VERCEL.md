# Linguadaily — Vercel content deployment

This version is prepared for Vercel's serverless/static architecture.

## Why the old deployment did not generate

The original app initialized a writable SQLite database and called the 18,000+ seed builder when the Express server booted. Vercel does not provide that long-running, writable SQLite server model for a production Vite deployment.

## What changed

- The existing seed database was exported into six production content libraries under `public/data/languages/`.
- The exported library currently contains **19,902 learning items**.
- The frontend now loads those libraries directly from Vercel's static CDN.
- Vocabulary search, filtering, pagination, random practice, recommendations, categories, and content statistics work without SQLite.
- Vercel no longer needs to start `server.ts` to serve the learning library.
- SQLite seed files are ignored by Vercel deployment because they are no longer required at runtime.
- The original seed generators remain in `server/seeds/` for future content expansion.

## Deploy

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Keep the project framework as Vite (Vercel can detect it automatically).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

No database environment variable is required just to serve the pre-generated language library.

## Updating the library

When the seed generators are changed locally:

```bash
npm run content:export
npm run build
```

Commit the updated `public/data/` files and redeploy.

## Important production note

The content library is global/static. Learner progress, bookmarks, settings and custom words should remain client-side until the Supabase/Postgres persistence layer is connected. The current UI keeps those actions best-effort so Vercel deployment does not break when a serverless write endpoint is unavailable.

The next production persistence step is to replace those write fallbacks with Supabase/Postgres while keeping the static content architecture.

## AI on Vercel

AI features are deployed as Vercel serverless functions under `/api/gemini/*`. Add `GEMINI_API_KEY` to the Vercel project Environment Variables for Production (and Preview if desired). The key is server-side only. See `AI-PRODUCTION-SETUP.md`.
