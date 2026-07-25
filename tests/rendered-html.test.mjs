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

test("server-renders the virtual museum", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Patrick Everaert/);
  assert.match(html, /Artwork gallery/);
  assert.match(html, /gallery-track/);
  assert.match(html, /Previous artwork/);
  assert.match(html, /Next artwork/);
  assert.match(html, /Human scale reference, 180 centimetres/);
  assert.match(html, /scale-person-180-v2\.png/);
  assert.doesNotMatch(html, /scale-person-180\.webp/);
  assert.doesNotMatch(html, />180 cm</);
  assert.doesNotMatch(html, /Curatorial sequence|collection-select/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/);
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
  assert.match(html, /32[\s\S]{0,40}works/);
  assert.match(html, /43[\s\S]{0,40}works/);
  assert.match(html, /26[\s\S]{0,40}works/);
  assert.match(html, /camera max ×[\s\S]{0,20}6/);
  assert.match(html, /camera max ×[\s\S]{0,20}2\.2/);
});

test("uses local original artwork files and the calibrated scale figure", async () => {
  const gallerySource = await readFile(
    new URL("../app/museum-gallery.tsx", import.meta.url),
    "utf8",
  );
  const galleryStyles = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  const artworkSource = await readFile(
    new URL("../lib/artworks.ts", import.meta.url),
    "utf8",
  );
  const figurePng = await readFile(
    new URL("../public/scale-person-180-v2.png", import.meta.url),
  );

  assert.match(gallerySource, /imageSrc=\{work\.localImageUrl\}/);
  assert.doesNotMatch(gallerySource, /fetch\(`\$\{work\.image_url\}/);
  assert.match(artworkSource, /localImageUrl: `\/artworks\/pe-/);
  const localArtworkFiles = await readFile(
    new URL("../public/artworks/pe-001.jpg", import.meta.url),
  );
  assert.ok(localArtworkFiles.byteLength > 100_000);
  assert.ok(figurePng.byteLength > 100_000);
  assert.equal(figurePng.subarray(1, 4).toString("ascii"), "PNG");
  assert.match(
    galleryStyles,
    /@media \(max-width: 680px\)[\s\S]*?\.person-camera\s*\{\s*display: none;/,
  );
});
