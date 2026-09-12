# Deployment Guide

## Vercel setup

Linguadaily is designed for Vercel with a Vite frontend and serverless AI functions.

Recommended settings:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
```

The repository already contains `vercel.json` with the application rewrite and static data caching rules.

## Environment variables

Required for AI:

```text
GEMINI_API_KEY
```

Add it to Production. Add it to Preview if preview AI testing is required.

## Deployment sequence

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the `GEMINI_API_KEY` environment variable.
4. Deploy.
5. Open `/api/gemini/health` on the deployment.
6. Open the app and test Sentence Studio.
7. Test one language pack download.
8. Test the app after disconnecting the network.

## Production build

Run locally before pushing:

```bash
npm install
npm run lint
npm run verify:content
npm run audit:content
npm run build
```

## Database note

Do not design the deployed learner experience around a writable SQLite file. Vercel's serverless/static deployment should use the committed static JSON library for learner content.

SQLite remains useful for local authoring and content generation.

## Release checklist

- [ ] TypeScript passes
- [ ] Content verification passes
- [ ] Content audit passes
- [ ] Vite build passes
- [ ] `GEMINI_API_KEY` is configured
- [ ] AI health endpoint reports configured
- [ ] Sentence Studio works online
- [ ] Offline language download works
- [ ] Offline vocabulary works
- [ ] Mobile layout checked
- [ ] Desktop layout checked
