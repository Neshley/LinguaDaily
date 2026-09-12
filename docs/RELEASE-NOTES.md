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

## Chinese variety filtering fix

- Fixed the vocabulary library so selecting **Mandarin Chinese** shows only `zh-cmn` content.
- Fixed the vocabulary library so selecting **Cantonese** shows only `zh-yue` content.
- Added defensive variant inference inside the vocabulary API so callers using `zh-cmn` or `zh-yue` cannot accidentally load both varieties from the shared `zh.json` content file.
- Applied the same protection to category filters and recommendations.
- Current curated Chinese library: 148 Mandarin items and 78 Cantonese items.


## Chinese variety filtering hotfix

The Learn Library now applies a final defensive filter for Chinese varieties and normalizes legacy records. Mandarin (`zh-cmn`) and Cantonese (`zh-yue`) cannot appear in the same Mandarin/Cantonese library view even when both are stored in the shared `zh.json` content pack. The service-worker shell/runtime cache version was also bumped to force the corrected frontend bundle to replace older cached application code.

## Mandarin vocabulary expansion

The Chinese content library now contains 1,000 Mandarin (`zh-cmn`) entries plus the existing 78 Cantonese (`zh-yue`) entries. Mandarin entries use Pinyin; Cantonese entries use Jyutping. The expanded Mandarin records are explicitly marked as requiring content review before being treated as trusted core content.
