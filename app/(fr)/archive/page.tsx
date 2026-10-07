import MuseumGallery from "../../museum-gallery";
import { portfolioMetadata } from "../../../lib/portfolio-metadata";

export const metadata = portfolioMetadata("fr", "archive");
export default function ArchivePage() { return <MuseumGallery key="fr-archive" initialView="archive" />; }
