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
};

export const artworks: Artwork[] = (rawArtworks as RawArtwork[]).map(
  (work, index) => ({
    ...work,
    id: `pe-${String(index + 1).padStart(3, "0")}`,
    sourceOrder: index + 1,
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
