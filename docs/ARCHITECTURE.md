# Architecture

## Runtime model

LinguaDaily has a deliberate production boundary:

```text
                         ┌─────────────────────────────┐
                         │           Browser           │
                         │ React + TypeScript + Vite   │
                         └──────────────┬──────────────┘
                                        │
          ┌─────────────────────────────┼──────────────────────────┐
          │                             │                          │
          ▼                             ▼                          ▼
  Static language JSON          Local learner state           AI client
  /data/languages/*.json        localStorage + Cache          /api/gemini/*
          │                             │                          │
          │                             │                          ▼
          │                             │                    Gemini API
          └──────────────┬──────────────┴──────────────────────────┘
                         ▼
                  Service Worker / PWA
```

## Production source of truth

- **Learning content:** committed static JSON under `public/data/languages/`.
- **Learner progress/settings:** local browser storage. No anonymous remote persistence is implied.
- **AI:** server-side Vercel functions only.
- **SQLite:** local authoring/content-generation infrastructure only. It is not a production learner database.

## Local development

`server.ts` provides the local development server, SQLite-backed authoring endpoints, and adapters to the same Gemini handlers used by Vercel. It binds to `127.0.0.1` rather than exposing the local database/API to the LAN.

The public learner UI does not call the local SQLite endpoints.

## AI boundary

The browser calls `src/services/aiApi.ts` → `/api/gemini/*`. The Gemini API key is read only on the server. AI inputs are bounded and rate-limited, and model responses are schema-checked before being returned to the browser.

The project uses the stable `gemini-3.8-flash` model. Gemini 3.8 Flash supports low/medium/high thinking levels; the app uses low for short learner interactions.

## Offline boundary

Offline language packs are explicitly downloaded into a dedicated Cache Storage cache. The service worker does not intercept `/api/*` requests and does not return the HTML shell for failed JSON/data requests.

Navigation has an app-shell fallback; static assets use cache-first behavior; language data uses the explicit offline-pack cache and otherwise goes to the network.

## Content pipeline

```text
SQLite / seed data
       ↓
content generation
       ↓
dedupe + purge + verification + quality audit
       ↓
public/data/*.json
       ↓
Vercel CDN
```

Content generation/reseeding is a CLI/build concern, not a public HTTP mutation.
