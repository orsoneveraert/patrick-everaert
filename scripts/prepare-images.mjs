import sharp from "sharp";
import { readFile, mkdir, writeFile, stat } from "node:fs/promises";

const artworks = JSON.parse(await readFile("data/artworks.json", "utf8"));
const widths = [480, 800, 1200, 1600];
await mkdir("public/artworks/responsive", { recursive: true });
const manifest = {};
const generatorModified = (await stat(new URL(import.meta.url))).mtimeMs;
for (const work of artworks) {
  const original = `public/artworks/${work.id}.jpg`;
  const originalModified = (await stat(original)).mtimeMs;
  const metadata = await sharp(original).metadata();
  const variants = [];
  for (const width of widths.filter((width) => width < metadata.width)) {
    const url = `/artworks/responsive/${work.id}-${width}.webp`;
    const existing = await stat(`public${url}`).catch(() => null);
    if (!existing || existing.mtimeMs < Math.max(originalModified, generatorModified)) {
      await sharp(original).resize({ width, height: Math.round(metadata.height * width / metadata.width), fit: "fill", withoutEnlargement: true })
        .webp({ quality: 90, effort: 5 }).toFile(`public${url}`);
    }
    variants.push({ width, url });
  }
  // The original is always the largest candidate; no enlargement or replacement.
  variants.push({ width: metadata.width, url: `/artworks/${work.id}.jpg` });
  manifest[work.id] = { width: metadata.width, height: metadata.height, variants };
}
await writeFile("data/image-variants.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Prepared responsive images for ${artworks.length} works.`);
await import("./prepare-sitemap.mjs");
