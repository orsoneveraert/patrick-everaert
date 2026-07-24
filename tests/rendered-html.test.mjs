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
  assert.match(html, /Curatorial sequence/);
  assert.match(html, /Previous artwork/);
  assert.match(html, /Next artwork/);
  assert.match(html, /Human scale reference/);
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
});
