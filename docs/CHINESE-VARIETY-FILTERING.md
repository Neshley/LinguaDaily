# Chinese Variety Filtering

Linguadaily treats Mandarin and Cantonese as separate learning varieties.

- `zh-cmn` = Mandarin Chinese → Hanyu Pinyin
- `zh-yue` = Cantonese → Jyutping

Both varieties currently share `public/data/languages/zh.json`. Therefore filtering is enforced at three layers:

1. `vocabularyApi.ts` filters by `languageVariant`.
2. Legacy records are normalized from `languageSpecific.type`.
3. `LearnView.tsx` applies a final UI guard before rendering cards.

If a deployed site still shows both varieties after this release, clear the browser's site data/service worker or deploy the new build so the old JavaScript bundle is not being served from cache.
