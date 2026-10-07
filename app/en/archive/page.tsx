import MuseumGallery from "../../museum-gallery";
import { portfolioMetadata } from "../../../lib/portfolio-metadata";
export const metadata = portfolioMetadata("en", "archive");
export default function Archive() { return <MuseumGallery key="en-archive" initialLanguage="en" initialView="archive" />; }
