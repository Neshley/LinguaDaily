# Architecture

## Product model

Linguadaily is organized around learner intent instead of a fixed course path. The application combines discovery, practice, review, vocabulary management, and optional AI assistance around a shared language/content layer.

## Runtime architecture

```text
                         ┌──────────────────────────────┐
                         │           Browser            │
                         │ React + TypeScript + Vite    │
                         └──────────────┬───────────────┘
                                        │
             ┌──────────────────────────┼─────────────────────────┐
             │                          │                         │
             ▼                          ▼                         ▼
   Static language data          Local learning state       AI client service
   public/data/languages/         localStorage/cache         src/services/aiApi.ts
             │                          │                         │
             │                          │                         ▼
             │                          │                 /api/gemini/*
             │                          │                         │
             │                          │                         ▼
             │                          │                  Google Gemini
             │                          │
             └──────────────────────────┴─────────────────────────
                         Offline Cache Storage
```

## Production content

Production learning content is static JSON. This avoids depending on a writable database at runtime and makes the content deterministic, cacheable, and deployable through Vercel's CDN.

## Local authoring data

SQLite is used for local generation, seed management, duplicate protection, and content workflows. It is not the source of truth required by the deployed learner application.

## AI boundary

The browser never receives the Gemini API key. Frontend components call `src/services/aiApi.ts`, which sends requests to the serverless endpoints under `api/gemini/`. Those functions read `GEMINI_API_KEY` from the server environment and call Gemini.

## Offline boundary

Offline packs are explicit downloads. `src/utils/offlinePacks.ts` stores language JSON in a dedicated Cache Storage cache and stores pack metadata locally. `vocabularyApi.ts` checks this cache before performing a normal network request.

## Deployment boundary

Vercel serves the compiled frontend and static content. `/api/*` is handled by serverless functions. SQLite files are excluded from deployment through `.vercelignore` because they are not required for runtime learning.
