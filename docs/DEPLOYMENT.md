# Deployment Guide

## Vercel

LinguaDaily is deployed as a Vite frontend plus serverless AI functions.

```text
Framework: Vite
Build command: npm run build
Output directory: dist
Node: 22.x
```

`vercel.json` owns the SPA rewrite, static-data caching, immutable asset caching, service-worker cache policy, and no-store API responses.

## Environment variables

Required for AI:

```text
GEMINI_API_KEY
```

Never expose this value through a `VITE_*` variable or frontend source.

## Pre-deploy checks

```bash
npm ci
npm run lint
npm run typecheck:node
npm run verify:content
npm run audit:content
npm run test:logic
npm run build
```

Use `npm ci` only after committing the generated `package-lock.json` in a normal development environment. The provided source archive does not include a lockfile because dependency installation is environment-dependent.

## Deployment sequence

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Select Node 22.x if the project settings expose a Node runtime selector.
4. Add `GEMINI_API_KEY` to Production and Preview when preview AI testing is desired.
5. Deploy.
6. Check `/api/health`.
7. Check `/api/gemini/health` and confirm the model is `gemini-3.8-flash` and `configured: true`.
8. Test Sentence Studio, word explanation, and custom-word generation.
9. Download a language pack and test it offline.
10. Test the smallest supported mobile layout and a desktop layout.

## Database note

Do not depend on SQLite for deployed learner state. SQLite is local content-authoring infrastructure. The learner-facing application is static-content + local-state + serverless-AI.

## Release checklist

- [ ] TypeScript passes
- [ ] Node-side TypeScript passes
- [ ] Logic tests pass
- [ ] Content verification passes
- [ ] Content audit passes
- [ ] Vite build passes
- [ ] `GEMINI_API_KEY` is configured server-side
- [ ] AI health endpoint reports configured
- [ ] All three AI endpoints work online
- [ ] Offline language download works
- [ ] Offline vocabulary works
- [ ] No API request is made to `/api/user/*` or `/api/practice/*` by the browser
- [ ] Mobile layout checked at 320–390px widths
- [ ] Tablet and desktop layouts checked
