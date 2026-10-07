import { readFile, writeFile } from "node:fs/promises";
const artworks = JSON.parse(await readFile("data/artworks.json", "utf8"));
const origin = "https://patrickeveraert.info";
const selected = [1, 15, 21, 43, 53, 67, 72, 77, 87, 95, 99, 101].map((order) => artworks[order - 1]);
const imageXml = (work) => `<image:image><image:loc>${origin}/artworks/${work.id}.jpg</image:loc></image:image>`;
const entry = (path, fr, en, works) => `  <url><loc>${origin}${path}</loc><xhtml:link rel="alternate" hreflang="fr" href="${origin}${fr}"/><xhtml:link rel="alternate" hreflang="en" href="${origin}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}${fr}"/>${works.map(imageXml).join("")}</url>`;
const entries = [];
for (const [fr, en, works] of [["/", "/en/", selected], ["/archive/", "/en/archive/", artworks]]) {
  entries.push(entry(fr, fr, en, works), entry(en, fr, en, works));
}
for (const work of artworks) {
  const fr = `/oeuvres/${work.id}/`, en = `/en/works/${work.id}/`;
  entries.push(entry(fr, fr, en, [work]), entry(en, fr, en, [work]));
}
await writeFile("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join("\n")}\n</urlset>\n`);
