# Patrick Everaert — Virtual Museum MVP

A minimal, responsive bilingual portfolio for Patrick Everaert, with a selection
of works, a chronological archive of 101 works, exhibitions, publications and
contact information. The fullscreen viewer preserves each image's proportions
against a white background. A developer-facing index is available at `/manage`.

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

To generate the static export:

```bash
npm run build:pages
```

The export is written to `out/`. Pushes to `main` run both build and test suites
through `.github/workflows/pages.yml`.

Production is the existing Cloudflare Worker `patrick-everaert`, serving
`https://patrickeveraert.info/` and redirecting `www` to the primary domain.
Publish with `npm run deploy` using the existing Wrangler login. This builds
the Vinext Worker and uploads `dist/server` with its assets from `dist/client`.
GitHub Pages is not enabled; the old `.openai/hosting.json` Site identifier is
retained as historical project configuration, not the production deployment target.

## Content management

- `data/artworks.json` is the editable source of truth used by the website.
- `data/artworks.csv` is retained as a convenient editorial export.
- Original captions, physical height and width, image URLs, pixel dimensions,
  and source attribution fields are preserved.
- `lib/artworks.ts` reads persistent artwork IDs, preserves source order, and
  defines named collections.
- The `/manage` view exposes ordering, collection counts, dimensions, materials,
  and attribution links.

Artwork originals are served locally from `public/artworks`. Source-page and CDN
URLs remain preserved in the data for attribution and future refreshes.

## Responsive images and permanent links

Artwork IDs are stored in `data/artworks.json`. Keep each ID attached to its
original image, even when reordering the dataset. Never reuse an existing ID.
Original JPEG files remain unchanged in `public/artworks`.

`npm run images:prepare` generates WebP derivatives at 480, 800, 1200 and
1600 pixels where smaller than the original, writes `data/image-variants.json`,
and refreshes the bilingual image sitemap. Development and both build commands
run this preparation automatically; generated WebP files are ignored by Git.
The original JPEG remains the largest responsive candidate.

French routes are `/`, `/archive/` and `/oeuvres/pe-001/` (one route per ID).
English routes are `/en/`, `/en/archive/` and `/en/works/pe-001/`.
Opening an artwork updates the address bar, so its URL can be copied or opened
in another tab. Direct links open the white, full-window image viewer with only
a close cross. Escape, keyboard focus containment and focus restoration are
handled by a native modal dialog. Closing returns to the gallery; opening and
closing in the gallery preserves the current scroll position.

The document is the only scroller, so wheel, keyboard and footer share one
scroll position. Above 680px the archive snaps to one work per screen with a
root `scroll-snap-type`; on phones it scrolls freely. Smooth scrolling is
requested per jump (About, decades, top) and never set globally, so a view change
resets to the top instantly. Each history entry keeps its scroll position, so
back and forward restore it in both directions. Image space is reserved before
lazy loading, and the viewer freezes and restores the page position for iOS
Safari. The fixed header uses one fixed container while retaining its contrast
over the images.
