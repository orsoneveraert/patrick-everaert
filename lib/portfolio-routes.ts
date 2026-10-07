export type Language = "fr" | "en";
export type View = "work" | "archive";

export function portfolioPath(language: Language, view: View = "work", id?: string) {
  if (id) return language === "en" ? `/en/works/${id}/` : `/oeuvres/${id}/`;
  if (view === "archive") return language === "en" ? "/en/archive/" : "/archive/";
  return language === "en" ? "/en/" : "/";
}
