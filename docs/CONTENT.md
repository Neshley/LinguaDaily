# Content System

## Production source

The learner-facing library is stored under:

```text
public/data/languages/
```

Supporting metadata includes:

```text
public/data/manifest.json
public/data/quality-report.json
public/data/generation/
```

## Current release

The current learner-facing library contains **905 trusted seed-curated items**:

- Chinese: 226 total
  - Mandarin: 148
  - Cantonese: 78
- French: 133
- German: 132
- Japanese: 138
- Korean: 138
- Spanish: 138

Legacy synthetic generated-pattern content was removed from the learner-facing export.

## Quality gates

The production build runs:

```bash
npm run verify:content
npm run audit:content
```

The export boundary includes only curated content. Structural issues and duplicate identities are checked before deployment.

## Duplicate identity

Content identity is normalized around language variety, item type, native text, pronunciation, and meaning. Database-level uniqueness and static JSON auditing work together to prevent duplicate learning items.

## Generation policy

Do not assume that grammatical combinations are natural collocations. A phrase that can be parsed mechanically may still be unnatural or wrong in real usage.

AI-generated material should be linguistically validated before becoming curated learner content.

## Chinese varieties

Mandarin and Cantonese are separate learning varieties. Cantonese pronunciation uses Jyutping and its tone metadata is derived from the actual Jyutping syllables.

## Content commands

```bash
npm run content:generate
npm run content:export
npm run content:dedupe
npm run content:purge-untrusted
npm run verify:content
npm run audit:content
```

When production JSON changes, commit the resulting static data files with the code change.

## Mandarin expansion — September 2026

The Mandarin (`zh-cmn`) library has been expanded to **1,000 distinct entries** while keeping Cantonese (`zh-yue`) separate.

- Mandarin: 1,000 entries
- Cantonese: 78 entries
- Chinese file total: 1,078 entries
- Mandarin pronunciation system: Hanyu Pinyin
- Cantonese pronunciation system: Jyutping
- Expanded entries are marked `seed-review-required` and `trustedForCoreLearning: false` until reviewed.
- No `generated-pattern` content was introduced.
- No duplicate Mandarin identity keys were found in the expansion.
