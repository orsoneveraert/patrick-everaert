import type { Metadata } from "next";
import type { Artwork } from "./artworks";
import { portfolioPath, type Language, type View } from "./portfolio-routes";

export function portfolioMetadata(language: Language, view: View = "work", work?: Artwork): Metadata {
  const url = portfolioPath(language, view, work?.id);
  const title = work ? `${work.title}, ${work.year} | Patrick Everaert` : "Patrick Everaert";
  const description = work
    ? `${work.title}, ${work.year} — ${work.material}, ${work.physical_dimensions}. Patrick Everaert.`
    : language === "en"
      ? view === "archive" ? "Complete chronological archive of works by Patrick Everaert, with techniques, dimensions and collections." : "Works, archives, exhibitions and publications by Patrick Everaert, a Belgian contemporary artist."
      : view === "archive" ? "Archive chronologique complète des œuvres de Patrick Everaert, de 2022 à 1989, avec techniques, dimensions et collections." : "Œuvres, archives, expositions et publications de Patrick Everaert, artiste belge contemporain.";
  const images = work ? [{ url: work.localImageUrl, alt: `${work.title}, ${work.year}` }] : [{ url: "/og.png", width: 1200, height: 630, alt: "Patrick Everaert" }];
  return {
    title, description,
    alternates: { canonical: url, languages: {
      fr: portfolioPath("fr", view, work?.id),
      en: portfolioPath("en", view, work?.id),
      "x-default": portfolioPath("fr", view, work?.id),
    } },
    openGraph: { title, description, url, type: "website", locale: language === "en" ? "en_GB" : "fr_BE", alternateLocale: [language === "en" ? "fr_BE" : "en_GB"], images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
