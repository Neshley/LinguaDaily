# Security

## Secrets

The Gemini API key is a server-side secret.

Never:

- commit `GEMINI_API_KEY`
- place it in `VITE_*` variables
- place it in `public/`
- send it to the browser
- print it in logs

Use Vercel Environment Variables for production.

## API boundary

AI requests flow through `/api/gemini/*`. This provides a server-side boundary for the provider key and allows the application to return controlled error responses.

## Generated content

AI-generated language content is not automatically trusted. It must pass explicit review before it becomes curated production content.

## Local database

SQLite files are local authoring/build artifacts. They are not required as a writable production data store.

## Client-side data

Learner state stored in local storage should be treated as user-controlled data. Do not use client-side state as an authorization boundary for sensitive server operations.

## Dependency hygiene

Keep dependencies current and run package audits as part of normal maintenance. Do not install packages solely to work around an architecture problem when a small first-party implementation is sufficient.

## AI abuse controls

The Gemini endpoints enforce:

- bounded JSON request sizes
- per-instance request rate limiting
- field-specific length limits
- strict response-shape checks before model output reaches the UI
- no-store caching headers on API responses
- provider/API-key errors that do not expose the secret

The in-memory rate limiter is intentionally a best-effort control for serverless instances. If the application becomes high-traffic, move rate limiting to a shared provider such as Vercel KV/Redis or another centralized edge store.

## Local development boundary

`server.ts` binds to `127.0.0.1`, not `0.0.0.0`, because its SQLite-backed routes are local development/authoring infrastructure. Do not expose that server directly to the public internet without authentication and a real persistence/security model.
