# Patrick Everaert — Virtual Museum MVP

A deliberately minimal, responsive portfolio for Patrick Everaert. The main
gallery displays 101 works at a consistent physical scale against a white
museum wall, with a 180 cm human reference, keyboard controls, continuous
trackpad movement, touch/swipe browsing, named collections, and a
developer-facing artwork index.

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

Small and medium artworks are hung with their vertical centre 150 cm above the
floor line. Large works use a separate museum datum: their lower frame edge is
120 cm above the floor. Dataset-derived size bands use the longest physical edge
(`≤65 cm`, `66–149 cm`, `≥150 cm`) and an immersive close-view camera. Each
focused work fills a responsive viewing frame, capped at `6×`, `3.8×`, or
`2.2×` by category. Artwork, 180 cm figure, floor, wall depth, and hanging
geometry always zoom together; neighbouring works keep their true relative
size. The human reference is compositionally retained at the right edge in
every close view.

Artwork images are served locally from `public/artworks` as the 101 downloaded
original JPEG files. Their scraped CDN and source-page URLs remain preserved in
the data for attribution and future refreshes. Only the focused work and the
small rendered neighbour window are mounted, so the browser does not eagerly
load the complete 58 MB collection. The 180 cm human reference is a true vector
SVG so it stays crisp at the closest camera scales.
