import MuseumGallery from "../museum-gallery";
import { portfolioMetadata } from "../../lib/portfolio-metadata";
export const metadata = portfolioMetadata("en");
export default function Home() { return <MuseumGallery key="en-work" initialLanguage="en" />; }
