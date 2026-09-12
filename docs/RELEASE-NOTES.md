# Release Notes — AI + Offline Production

## Highlights

This release turns Linguadaily into a more complete production-oriented learning application with AI assistance and explicit offline language packs.

### AI

- Added Vercel serverless Gemini routes.
- Added a frontend AI service layer.
- Added Sentence Studio evaluation.
- Added AI vocabulary explanations.
- Added AI custom-word generation.
- Added a health endpoint for deployment diagnostics.
- Improved error reporting so provider/configuration failures are easier to diagnose.

### Offline

- Added explicit language-pack downloads.
- Added offline pack status and storage controls in Settings.
- Added Cache Storage integration for language JSON.
- Added shared-file handling for Mandarin/Cantonese's Chinese data file.
- Updated service-worker behavior so offline packs are preserved across activation.
- Kept `/api/*` outside offline shell interception because AI requires connectivity.

### Content quality

- Removed legacy synthetic generated-pattern records from learner-facing content.
- Kept curated-only export protection.
- Kept duplicate and structural quality checks.
- Corrected Cantonese pronunciation/tone handling.

## Current content size

**905 trusted seed-curated learning items.**

## Important configuration

Set `GEMINI_API_KEY` in Vercel before testing AI in production.

## Known limitations

- Gemini requires an internet connection.
- Durable multi-device learner persistence is not yet the primary storage layer.
- New generated language material still requires human/linguistic review before promotion.
