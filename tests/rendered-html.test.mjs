import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the editorial portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Patrick Everaert/);
  assert.match(html, /Œuvres sélectionnées/);
  assert.match(html, />Œuvres</);
  assert.match(html, />Archive</);
  assert.match(html, /À propos/);
  assert.match(html, /101 œuvres réalisées entre 1989/);
  assert.match(html, /Techniques/);
  assert.match(html, /Chronologie/);
  assert.match(html, /Archive numérique/);
  assert.match(html, /33 tirages Lambda/);
  assert.match(html, />FR</);
  assert.match(html, />EN</);
  assert.match(html, /\/artworks\/pe-001\.jpg/);
  assert.doesNotMatch(html, /Human scale reference|gallery-track|floor-line/);
});

test("keeps all scraped physical dimensions and attribution fields", async () => {
  const raw = await readFile(
    new URL("../data/artworks.json", import.meta.url),
    "utf8",
  );
  const artworks = JSON.parse(raw);

  assert.equal(artworks.length, 101);
  for (const work of artworks) {
    assert.equal(typeof work.height, "number");
    assert.equal(typeof work.width, "number");
    assert.ok(work.height > 0);
    assert.ok(work.width > 0);
    assert.match(work.physical_dimensions, /\d/);
    assert.match(work.image_url, /^https:\/\//);
    assert.match(work.source_url, /^https:\/\//);
  }
});

test("server-renders the management index", async () => {
  const response = await render("/manage");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Artwork index/);
  assert.match(html, /101/);
  assert.match(html, /Chronological/);
  assert.match(html, /Photographic works/);
  assert.match(html, /Artwork size bands/);
  assert.match(html, /Return to portfolio/);
});

test("uses local original artwork files in both portfolio views", async () => {
  const source = await readFile(
    new URL("../app/museum-gallery.tsx", import.meta.url),
    "utf8",
  );
  const styles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  const artworkSource = await readFile(
    new URL("../lib/artworks.ts", import.meta.url),
    "utf8",
  );
  const firstArtwork = await readFile(
    new URL("../public/artworks/pe-001.jpg", import.meta.url),
  );

  assert.match(source, /src=\{work\.localImageUrl\}/);
  assert.match(source, /artworks\.map\(\(work\)/);
  assert.match(source, /loading="lazy"/);
  assert.match(source, /Complete artwork archive/);
  assert.match(source, /portfolio-dialog/);
  assert.match(source, /type Language = "fr" \| "en"/);
  assert.match(source, /onLanguage\("fr"\)/);
  assert.match(source, /onLanguage\("en"\)/);
  assert.doesNotMatch(source, /scale-person|scene-camera|gallery-track/);
  assert.match(artworkSource, /localImageUrl: `\/artworks\/pe-/);
  assert.ok(firstArtwork.byteLength > 100_000);
  assert.match(styles, /\.archive-grid\s*\{/);
  assert.match(styles, /grid-template-columns: repeat\(2/);
  assert.match(styles, /\.portfolio-header\s*\{[\s\S]*?position: fixed/);
  assert.match(styles, /\.portfolio-intro\s*\{[\s\S]*?min-height: 62svh/);
  assert.match(
    styles,
    /\.portfolio-footer\s*\{[\s\S]*?grid-template-columns: repeat\(3/,
  );
  assert.match(
    styles,
    /\.portfolio-footer\s*\{[\s\S]*?font-family: Arial/,
  );
});
