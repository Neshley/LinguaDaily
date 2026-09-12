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
