import rawArtworks from "../data/artworks.json";

export type RawArtwork = {
  title: string;
  year: string;
  material: string;
  physical_dimensions: string;
  height: number;
  width: number;
  depth: number | null;
  unit: string;
  caption_remainder: string;
  full_caption: string;
  image_url: string;
  image_pixel_dimensions: string;
  source_url: string;
};

export type Artwork = RawArtwork & {
  id: string;
  sourceOrder: number;
  maxDimensionCm: number;
  sizeCategory: ArtworkSizeCategory;
};

export type ArtworkSizeCategory = "small" | "medium" | "large";

// Dataset-derived bands using the longest physical edge:
// 65 cm is approximately the 30th percentile; 150 cm is the 75th percentile.
// Edit these values and framing limits to tune the gallery camera globally.
export const sizeCategoryConfig = {
  metric: "maximum physical dimension",
  smallMaxCm: 65,
  largeMinCm: 150,
  cameraMaxZoom: {
    small: 6,
    medium: 3.8,
    large: 2.2,
  },
  cameraFrame: {
    desktopWidth: 0.78,
    desktopHeight: 0.7,
    mobileWidth: 1.05,
    mobileHeight: 0.66,
  },
} as const;

export function classifyArtworkSize(
  work: Pick<RawArtwork, "height" | "width">,
): ArtworkSizeCategory {
  const maximumDimension = Math.max(work.height, work.width);
  if (maximumDimension <= sizeCategoryConfig.smallMaxCm) return "small";
  if (maximumDimension >= sizeCategoryConfig.largeMinCm) return "large";
  return "medium";
}

export const artworks: Artwork[] = (rawArtworks as RawArtwork[]).map(
  (work, index) => ({
    ...work,
    id: `pe-${String(index + 1).padStart(3, "0")}`,
    sourceOrder: index + 1,
    maxDimensionCm: Math.max(work.height, work.width),
    sizeCategory: classifyArtworkSize(work),
  }),
);

export const collections = [
  {
    id: "sequence",
    label: "Curatorial sequence",
    note: "The explicit source order from the scraped portfolio.",
  },
  {
    id: "chronological",
    label: "Chronological",
    note: "Oldest to newest; ties retain source order.",
  },
  {
    id: "recent",
    label: "2017—2022",
    note: "Works dated from 2017 onward.",
  },
  {
    id: "photographic",
    label: "Photographic works",
    note: "Lambda and photographic prints.",
  },
  {
    id: "editions",
    label: "Editions",
    note: "Lithographic editions.",
  },
] as const;

export type CollectionId = (typeof collections)[number]["id"];

export function getCollectionWorks(id: CollectionId): Artwork[] {
  if (id === "chronological") {
    return [...artworks].sort(
      (a, b) => Number(a.year) - Number(b.year) || a.sourceOrder - b.sourceOrder,
    );
  }
  if (id === "recent") {
    return artworks.filter((work) => Number(work.year) >= 2017);
  }
  if (id === "photographic") {
    return artworks.filter((work) =>
      /photograph|lambda/i.test(work.material),
    );
  }
  if (id === "editions") {
    return artworks.filter((work) => /lithograph/i.test(work.material));
  }
  return artworks;
}
