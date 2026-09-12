# LinguaDaily Offline Learning

## Content source of truth
All learner-facing language libraries remain versioned in `public/data/languages/`. Offline downloads never replace or delete these project files.

## How offline downloads work
The Settings → Offline Learning panel downloads a complete language JSON pack into a dedicated browser Cache Storage bucket (`linguadaily-offline-content-v1`). A small local metadata record tracks the pack version, item count, size, and download date.

When offline, the vocabulary client and service worker can read the downloaded pack directly from local storage. Core learning progress continues to use the app's existing local storage.

## Available packs
- Chinese (`zh.json`) — includes Mandarin and Cantonese variants
- Japanese
- Spanish
- French
- German
- Korean

## Updating
When online, users can update an individual downloaded pack. The content manifest timestamp is used as the pack version so the UI can identify a newer project content build.

## Limitations
- The first visit/install requires internet.
- Downloading and updating packs requires internet.
- AI/server-backed features still require internet.
- Browser storage is device/browser-specific. Clearing site data removes offline packs.
- The service worker keeps explicit offline content in its own cache so routine app-shell cache updates do not delete downloaded language libraries.
