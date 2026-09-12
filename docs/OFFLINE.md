# Offline Learning

## Goal

Offline mode lets learners continue using downloaded language content when a network connection is unavailable.

## Supported packs

- Mandarin Chinese (`zh-cmn`) — uses `public/data/languages/zh.json`
- Cantonese (`zh-yue`) — uses the same Chinese JSON file while keeping a separate variety identity
- Japanese (`ja`)
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Korean (`ko`)

## Storage model

Language files are stored in the dedicated Cache Storage cache:

```text
linguadaily-offline-language-packs-v2
```

Pack metadata is stored in local storage under the versioned Linguadaily offline key.

Chinese is a shared physical file. The app therefore avoids deleting `zh.json` while either Mandarin or Cantonese is still marked as downloaded.

## Runtime lookup

When `vocabularyApi.ts` loads a language, it checks the explicit offline cache first. If the pack is not available there, it uses the normal network request.

## Service worker

The service worker provides app-shell/PWA caching. It must preserve the dedicated offline language-pack cache during activation. It must also avoid intercepting `/api/*` AI requests because AI calls require live network access.

## Learner expectations

Offline support is intended for:

- vocabulary browsing/search
- downloaded language content
- local practice/review flows
- locally stored learning state

Not guaranteed offline:

- Gemini AI evaluation
- AI word explanation
- AI custom generation
- server-side persistence

## Clearing packs

The Settings offline panel provides controls to remove downloaded packs or clear offline storage. Removing one Chinese variety should not remove the shared Chinese file when the other variety remains installed.

## Troubleshooting

If a pack says it downloaded but does not work offline:

1. Confirm the browser supports Service Workers and Cache Storage.
2. Open the app settings and check that the pack is still marked ready.
3. Refresh once while online so the latest application shell is installed.
4. Test again with the device/network disconnected.
5. If the issue persists, clear the old site data and download the pack again.
