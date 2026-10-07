import MuseumGallery from "../museum-gallery";
import { portfolioMetadata } from "../../lib/portfolio-metadata";

export const metadata = portfolioMetadata("fr");
export default function Home() { return <MuseumGallery key="fr-work" />; }
