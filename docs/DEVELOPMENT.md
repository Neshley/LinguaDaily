# Development Guide

## Install

```bash
npm install
```

## Development server

```bash
npm run dev
```

## Useful checks

```bash
npm run lint
npm run verify:content
npm run audit:content
npm run build
```

## Content workflow

For content changes, keep the generated/static library synchronized with the authoring data and run the verification/audit scripts before committing.

## Frontend workflow

Prefer small, reusable components. Keep API/network logic in `src/services/` rather than embedding fetch logic throughout UI components.

## AI workflow

Frontend components should call `src/services/aiApi.ts`. Do not call Gemini directly from browser components and do not expose the API key.

## Offline workflow

Offline pack operations belong in `src/utils/offlinePacks.ts`. Keep the explicit offline cache separate from generic application-shell caching.

When modifying the service worker, verify that existing offline language packs survive activation/update.

## Responsive UI

Every learner-facing screen should be tested at:

- small mobile widths
- normal mobile widths
- tablet widths
- desktop widths
- wide desktop widths

Avoid fixed-width layouts that can overflow on smaller screens.

## Pull requests / releases

Before merging a significant change:

1. Run TypeScript validation.
2. Run content verification/audit if content or content-loading code changed.
3. Run a production build.
4. Test the affected feature in both online and offline conditions where applicable.
5. Update documentation when architecture or deployment behavior changes.
