import type { Metadata } from "next";
import MuseumGallery from "../museum-gallery";

export const metadata: Metadata = {
  title: "Patrick Everaert",
  description:
    "Archive chronologique complète des œuvres de Patrick Everaert, de 2022 à 1989, avec techniques, dimensions et collections.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    url: "/archive",
    title: "Archives des œuvres | Patrick Everaert",
    description:
      "Archive complète des œuvres de Patrick Everaert, de 2022 à 1989.",
  },
};

export default function ArchivePage() {
  return <MuseumGallery initialView="archive" />;
}
