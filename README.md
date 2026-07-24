# Patrick Everaert — Virtual Museum MVP

A deliberately minimal, responsive portfolio for Patrick Everaert. The main
gallery displays 101 works at a consistent physical scale against a white
museum wall, with a 175 cm human reference, keyboard controls, touch/swipe
browsing, named collections, and a developer-facing artwork index.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The content index is available at
`http://localhost:3000/manage`.

To verify the production build:

```bash
npm run build
```

## Content management

- `data/artworks.json` is the editable source of truth used by the website.
- `data/artworks.csv` is retained as a convenient editorial export.
- Original captions, physical height and width, image URLs, pixel dimensions,
  and source attribution fields are preserved.
- `lib/artworks.ts` assigns stable display IDs, preserves source order, and
  defines named collections.
- The `/manage` view exposes ordering, collection counts, dimensions, materials,
  and attribution links.

The display scale is calculated from the physical dimensions. A work and the
human reference always share the same scene scale; exceptionally large works
are reduced together to fit the available wall, and the legend identifies that
reduced scene scale.
