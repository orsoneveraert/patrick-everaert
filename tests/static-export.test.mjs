import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const artworks = JSON.parse(await readFile("data/artworks.json", "utf8"));
const variants = JSON.parse(await readFile("data/image-variants.json", "utf8"));

test("exports bilingual pages and every permanent artwork address", async () => {
  assert.equal(new Set(artworks.map((work) => work.id)).size, artworks.length);
  for (const [language, prefix, section] of [["fr", "", "oeuvres"], ["en", "en/", "works"]]) {
    for (const page of ["", "archive/"]) {
      const html = await readFile(`out/${prefix}${page}index.html`, "utf8");
      assert.match(html, new RegExp(`<html lang="${language}"`));
      assert.ok(html.includes(`href="https://patrickeveraert.info/${prefix}${page}"`));
    }
    for (const work of artworks) {
      const path = `${prefix}${section}/${work.id}/`;
      const html = await readFile(`out/${path}index.html`, "utf8");
      assert.ok(html.includes(`rel="canonical" href="https://patrickeveraert.info/${path}"`));
      assert.match(html, /VisualArtwork/);
      assert.match(html, /hrefLang="en"|hreflang="en"/);
      assert.ok(html.includes(`https://patrickeveraert.info/artworks/${work.id}.jpg`));
    }
  }
});

test("responsive assets preserve proportions and retain every original", async () => {
  for (const work of artworks) {
    const image = variants[work.id];
    const original = await sharp(`public/artworks/${work.id}.jpg`).metadata();
    assert.equal(image.width, original.width);
    assert.equal(image.height, original.height);
    assert.equal(image.variants.at(-1).url, `/artworks/${work.id}.jpg`);
    for (const variant of image.variants) {
      await access(`out${variant.url}`);
      const actual = await sharp(`public${variant.url}`).metadata();
      assert.equal(actual.width, variant.width);
      assert.ok(actual.width <= original.width);
      assert.ok(Math.abs(actual.height - original.height * actual.width / original.width) <= 1);
    }
  }
});

test("image sitemap contains all works and translated permanent routes", async () => {
  const sitemap = await readFile("out/sitemap.xml", "utf8");
  for (const work of artworks) {
    assert.ok(sitemap.includes(`<loc>https://patrickeveraert.info/oeuvres/${work.id}/</loc>`));
    assert.ok(sitemap.includes(`<loc>https://patrickeveraert.info/en/works/${work.id}/</loc>`));
    assert.ok(sitemap.includes(`<image:loc>https://patrickeveraert.info/artworks/${work.id}.jpg</image:loc>`));
  }
  assert.ok(!sitemap.includes("/manage"));
});
