import { notFound } from "next/navigation";
import MuseumGallery from "../../../museum-gallery";
import { artworks } from "../../../../lib/artworks";
import { portfolioMetadata } from "../../../../lib/portfolio-metadata";

export const dynamicParams = false;
export function generateStaticParams() { return artworks.map((work) => ({ id: work.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = artworks.find((work) => work.id === id);
  if (!work) notFound();
  return portfolioMetadata("en", "archive", work);
}
export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = artworks.find((work) => work.id === id);
  if (!work) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "@id": `https://patrickeveraert.info/oeuvres/${work.id}/`,
    name: work.title,
    dateCreated: work.year,
    artMedium: work.material,
    image: `https://patrickeveraert.info${work.localImageUrl}`,
    creator: { "@id": "https://patrickeveraert.info/#patrick-everaert" },
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\u003c") }} />
    <MuseumGallery key={`en-${id}`} initialLanguage="en" initialView="archive" initialArtwork={work} />
  </>;
}
