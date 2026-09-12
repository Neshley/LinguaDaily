# Linguadaily Content Quality Fix

This release removes the synthetic verb+noun collocation system from the learner-facing library.

## What changed

- Removed all 18,997 legacy `generated-pattern` learning items from the seed database.
- Static learner content now contains 905 trusted seed-curated items only.
- `scripts/generate-content.ts` no longer creates mechanical verb+noun collocations.
- `scripts/export-content.mjs` exports only `is_curated = 1` items as a second safety boundary.
- Duplicate protection remains enabled through the database content identity index.
- Cantonese Jyutping tone metadata is derived from the actual Jyutping syllables instead of a hard-coded `[1, 2]` value.
- Corrected Cantonese entries:
  - 智能電話 → `zi3 nang4 din6 waa2`
  - 手提電腦 → `sau2 tai4 din6 nou5`
- Cantonese entries use Cantonese/Jyutping metadata instead of Mandarin/HSK metadata.

## Current content counts

- Chinese: 226 (148 Mandarin + 78 Cantonese)
- French: 133
- German: 132
- Japanese: 138
- Korean: 138
- Spanish: 138
- Total: 905

## Future generation rule

New AI-generated phrases should enter the learner library only after explicit linguistic validation/review. The system should never assume that `verb + noun` is a natural collocation.
