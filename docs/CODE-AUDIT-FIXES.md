# Code Audit Fixes — September 2026

## Completed

### Critical
- Removed browser calls to nonexistent `/api/user/*` and `/api/practice/*` routes.
- Removed the automatic SQLite migration/sync effect from the learner app.
- Removed the automatic SQLite vocabulary loading effect from the learner app.
- Removed the public `/api/vocabulary/reseed` mutation endpoint.
- Changed local Express binding from `0.0.0.0` to `127.0.0.1`.
- Fixed the invalid production `start` command (`dist/server.cjs`) to `vite preview`.
- Split browser and Node TypeScript configuration.

### AI/API
- Centralized Gemini configuration in `api/gemini/_shared.ts`.
- Reused the same Gemini handlers from local Express development and Vercel serverless deployment.
- Added request-size validation.
- Added field-level input limits.
- Added best-effort per-instance rate limiting.
- Added malformed-JSON handling.
- Added response-shape validation for dialogue checks, explanations, and generated cards.
- Removed deprecated Gemini 3.8 sampling configuration (`temperature`).
- Centralized the model name and health response.

### Learner state
- Made learner progress/settings explicitly local-first.
- Removed silent-success remote persistence wrappers that called nonexistent production endpoints.
- Added one canonical SRS implementation in `src/utils/srs.ts`.
- Added one canonical language/variant matcher in `src/utils/language.ts`.
- Corrected default learner stats so a new learner starts with 0 practiced words and 0 XP rather than fabricated progress.
- Fixed zero-question/zero-total accuracy edge cases.

### PWA/offline
- Versioned the service-worker caches.
- Stopped returning the HTML app shell for failed JSON/data requests.
- Kept API requests completely outside service-worker interception.
- Added no-cache headers for the service worker and no-store headers for APIs.
- Added immutable caching for hashed Vite assets.

### Deployment/docs
- Added Node 22 engine requirement and `.nvmrc`.
- Added Node-side typecheck and logic-test scripts.
- Added security/deployment documentation for the new architecture.
- Removed the unused `@google/genai`, `esbuild`, and `autoprefixer` runtime/development dependencies; moved `@types/canvas-confetti` to dev dependencies.

## Validation performed on the source archive

- TypeScript/TSX transpile/syntax scan: passed.
- Production JSON parse scan: 8 JSON files passed.
- Content verification: 1,757 items passed.
- Content quality audit: 1,757 seed-curated, 0 generated-pattern, 0 structural issues.
- Secret scan for exposed Gemini keys: clean.
- Frontend scan for `/api/user/*` and `/api/practice/*`: clean.
- Public vocabulary reseed route scan: clean.
- Deprecated Gemini sampling-parameter scan: clean.
- Extracted SRS/language logic checks: passed.

## Environment limitation

A full `npm install`/Vite build could not be executed in this audit environment because the npm registry was unavailable and the project archive did not contain `node_modules` or a lockfile. The source was still syntax-transpiled and the content pipeline was executed successfully.

In a normal development environment, run:

```bash
npm install
npm run lint
npm run typecheck:node
npm run test:logic
npm run verify:content
npm run audit:content
npm run build
```
