# Linguadaily

> **Choose a language. Learn what interests you. Practice what you need. Review what you forget. Improve every day.**

Linguadaily is a responsive language-learning web application built around practical vocabulary, focused practice, review, and lightweight AI assistance. It is designed as a flexible learning workspace rather than a fixed course sequence.

## What this release includes

- **7 learning varieties/languages:** Mandarin Chinese, Cantonese, Japanese, Spanish, French, German, and Korean.
- **Chinese variety support:** Mandarin (`zh-cmn`) and Cantonese (`zh-yue`) share the Chinese content file while remaining separate learning varieties in the UI and metadata.
- **Curated static content:** the learner-facing library is served from `public/data/languages/` and does not require a writable production database.
- **AI Sentence Studio:** evaluate learner sentences, receive corrections, explanations, and improvement guidance.
- **AI vocabulary tools:** word explanations and custom-word generation through secure server-side Gemini endpoints.
- **Offline learning packs:** learners can explicitly download language data and continue vocabulary learning/search/review without an internet connection.
- **PWA foundation:** manifest, icons, and service worker support installation and resilient app-shell caching.
- **Responsive interface:** layouts are designed to work across desktop, tablet, and mobile screens.
- **Content safeguards:** duplicate protection, verification, quality auditing, and a curated-only export boundary.

## Technology

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Motion
- Lucide React
- Google Gemini via `@google/genai`
- Vercel serverless functions for AI
- SQLite for local content generation/authoring workflows
- Static JSON for production learner content
- Service Worker + Cache Storage for offline packs

## Project structure

```text
.
├── api/                         # Vercel serverless API routes
│   ├── gemini/                  # Gemini AI endpoints
│   └── health.ts                # Basic API health endpoint
├── public/
│   ├── data/languages/          # Production language libraries
│   ├── icons/                   # PWA icons
│   ├── manifest.webmanifest     # PWA manifest
│   └── sw.js                    # Service worker
├── scripts/                     # Content verification/export/audit tools
├── server/                      # Local authoring/generation code and seed data
├── src/
│   ├── components/              # UI components
│   ├── services/                # Vocabulary and AI client services
│   ├── utils/                   # Offline and shared utilities
│   └── ...                      # App shell, views, types, styling
├── docs/                        # Project documentation
├── server.ts                    # Local development server
├── vercel.json                  # Vercel routing/build configuration
└── package.json
```

## Requirements

- Node.js 20+ recommended
- npm
- A Google Gemini API key for AI features

## Run locally

Install dependencies:

```bash
npm install
```

Create a local environment file and add your Gemini key when you want AI features:

```bash
GEMINI_API_KEY=your_key_here
```

Then start the application:

```bash
npm run dev
```

The local development command uses `server.ts` to provide the development experience. The production learner library is still read from the static JSON files under `public/data/languages/`.

## Validate before deployment

Run the content checks:

```bash
npm run verify:content
npm run audit:content
```

Run TypeScript validation:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

The build intentionally runs content verification and the quality audit before Vite builds the application.

## AI configuration

AI is intentionally server-side. The browser calls `/api/gemini/*`; the Gemini API key is read only by the serverless functions.

Required Vercel environment variable:

```text
GEMINI_API_KEY
```

AI features require an internet connection. Offline language packs do not make Gemini itself available offline.

See [`docs/AI.md`](docs/AI.md) for setup, endpoint behavior, troubleshooting, and security notes.

## Offline learning

Learners can download supported language packs from the application's settings. Packs are stored in Cache Storage and tracked locally. Vocabulary loading checks the explicit offline-pack cache before falling back to the network.

Offline support covers the static learning library and local learning state. AI requests still require connectivity.

See [`docs/OFFLINE.md`](docs/OFFLINE.md).

## Content architecture

Production content is static and deployable:

```text
public/data/languages/*.json
public/data/manifest.json
public/data/quality-report.json
```

The local SQLite database and generators are authoring/build-time infrastructure. Vercel does not need a writable SQLite database to serve learners.

The current learner-facing library contains **905 trusted seed-curated items** after removal of legacy synthetic generated-pattern records.

See [`docs/CONTENT.md`](docs/CONTENT.md).

## Deployment

The application is configured for Vercel as a Vite/static frontend with serverless AI routes.

High-level flow:

```text
Browser
  │
  ├── Static app ────────> Vercel CDN / Vite output
  │
  ├── Language JSON ─────> public/data/languages/*.json
  │
  └── AI requests ───────> /api/gemini/* ──> Google Gemini
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the production checklist.

## Content commands

```bash
npm run content:export
npm run verify:content
npm run audit:content
npm run content:generate
npm run content:dedupe
npm run content:purge-untrusted
```

Do not add mechanically generated phrases directly to learner-facing content. New AI-generated material should be linguistically reviewed before it becomes curated production content.

## Security principles

- Never put `GEMINI_API_KEY` in frontend source code.
- Do not commit `.env.local` or real secrets.
- Keep AI requests behind server-side API routes.
- Treat generated language content as untrusted until reviewed.
- Do not rely on writable SQLite storage in Vercel production.

See [`docs/SECURITY.md`](docs/SECURITY.md).

## Current limitations

- AI features require network access and a configured Gemini API key.
- Learner persistence is primarily client-side; a durable multi-device database layer is a future production step.
- The static language library must be regenerated/exported and committed when production content changes.
- AI-generated learning content must be reviewed before promotion to the curated library.

## Documentation map

| Document | Purpose |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Application architecture and data flow |
| [`docs/AI.md`](docs/AI.md) | Gemini setup, API routes, troubleshooting |
| [`docs/OFFLINE.md`](docs/OFFLINE.md) | Offline packs, caching, PWA behavior |
| [`docs/CONTENT.md`](docs/CONTENT.md) | Content model, generation, verification |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Vercel deployment and release checklist |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Local development and contribution workflow |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Secrets, API boundaries, production safety |
| [`docs/RELEASE-NOTES.md`](docs/RELEASE-NOTES.md) | What is included in this release |

## License

No open-source license is declared in this repository. Treat the project as proprietary unless the project owner explicitly adds a license.
