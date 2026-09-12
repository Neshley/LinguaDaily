# Linguadaily Content Persistence

Vocabulary is now treated as project content, not temporary runtime data.

## Permanent storage

The deployed learning library lives in:

- `public/data/languages/*.json` — the files the web app serves.
- `public/data/manifest.json` — total counts and language metadata.
- `public/data/quality-report.json` — content quality/duplicate audit.
- `public/data/generation/*.json` — generation batch history.
- `server/data/linguadaily.db` — local generation/seed database.

## Generate and save

Run:

```bash
npm run content:generate
```

This generates the datasets, uses a database-level unique content identity to reject duplicates, exports the resulting library into `public/data/languages/`, verifies it, and runs the quality audit.

## Duplicate protection

Each learning item receives a normalized identity based on language variety, item type, native text, pronunciation, and meaning. A unique SQLite index prevents the same identity from being inserted twice. Static JSON is also audited for duplicate identities before deployment.

## Deployment

The JSON files are committed with the project and served by Vercel as static content. Vercel does not need a writable SQLite database for visitors.
