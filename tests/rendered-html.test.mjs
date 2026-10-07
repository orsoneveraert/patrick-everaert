import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  collectiveExhibitions,
  personalExhibitions,
} from "../lib/exhibitions.ts";

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
  assert.match(html, /né en 1962 à Charleroi/);
  assert.match(html, /peintre sans pinceau et photographe sans appareil/);
  assert.match(html, /mailto:patrickeveraert@mac\.com/);
  assert.match(html, /Books/);
  assert.match(html, /Personal exhibition/);
  assert.match(html, /Collective exhibition/);
  assert.match(html, /Trous noirs, trous blancs/);
  assert.doesNotMatch(html, /Archive numérique/);
  assert.doesNotMatch(html, /MATÉRIAUX/);
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
  assert.match(source, /archiveWorks\.map\(\(work, index\)/);
  assert.match(
    source,
    /Number\(b\.year\) - Number\(a\.year\) \|\| a\.sourceOrder - b\.sourceOrder/,
  );
  assert.match(source, /"--work-aspect": aspect/);
  assert.equal(personalExhibitions.length, 19);
  assert.equal(collectiveExhibitions.length, 69);
  assert.match(source, /loading=\{index < 2 \? "eager" : "lazy"\}/);
  assert.match(source, /work\.caption_remainder/);
  assert.match(source, /archive-caption-collection/);
  assert.match(source, /Complete artwork archive/);
  assert.match(source, /portfolio-dialog/);
  assert.match(source, /type Language = "fr" \| "en"/);
  assert.match(source, /onLanguage\("fr"\)/);
  assert.match(source, /onLanguage\("en"\)/);
  assert.doesNotMatch(source, /String\(index \+ 1\)\.padStart/);
  assert.doesNotMatch(source, /scale-person|scene-camera|gallery-track/);
  assert.match(artworkSource, /localImageUrl: `\/artworks\/pe-/);
  assert.ok(firstArtwork.byteLength > 100_000);
  assert.match(styles, /\.archive-sequence\s*\{[\s\S]*?scroll-snap-type: y mandatory/);
  assert.match(styles, /\.archive-entry\s*\{[\s\S]*?min-height: 100svh/);
  assert.match(styles, /--paper: #f8f7f2/);
  assert.match(styles, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(styles, /\.portfolio-header\s*\{[\s\S]*?position: fixed/);
  assert.match(styles, /\.header-title\s*\{[\s\S]*?font-size: 14px/);
  assert.match(styles, /\.portfolio-nav\s*\{[\s\S]*?top: 20px/);
  assert.match(styles, /left: calc\(50% - 20px\)/);
  assert.match(styles, /\.header-right\s*\{[\s\S]*?gap: 16px/);
  assert.match(styles, /\.portfolio-intro\s*\{[\s\S]*?display: none/);
  assert.match(styles, /\.work-entry:first-child\s*\{[\s\S]*?padding-top: 64px/);
  assert.match(styles, /calc\(\(100svh - 112px\) \* var\(--work-aspect\)\)/);
  assert.match(styles, /\.work-entry\s*\{[\s\S]*?min-height: 100svh/);
  assert.match(
    styles,
    /\.portfolio-footer\s*\{[\s\S]*?grid-template-columns: repeat\(3/,
  );
  assert.match(
    styles,
    /\.portfolio-footer\s*\{[\s\S]*?font-family: Arial/,
  );
});
