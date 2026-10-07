"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { artworks, type Artwork } from "../lib/artworks";

type View = "work" | "archive";
type Language = "fr" | "en";

const copy = {
  fr: {
    work: "Œuvres",
    archive: "Archive",
    about: "À propos",
    close: "Fermer",
    open: "Ouvrir",
    selectedWorks: "Œuvres sélectionnées",
    completeArchive: "Archives complètes des œuvres",
    aboutParagraphs: [
      "Les archives de Patrick Everaert rassemblent 101 œuvres réalisées entre 1989 et 2022. Le corpus traverse le tirage photographique et Lambda, les œuvres montées sur Forex et Dibond, la lithographie, la toile et l’impression giclée.",
      "Ce portfolio numérique conserve pour chaque œuvre l’ordre original, les dimensions physiques, les matériaux et l’attribution de la source.",
    ],
    worksCount: "101 œuvres",
    dimensions: "Toutes les dimensions sont en centimètres",
    contact: "Contact",
    contactPending: "Coordonnées de l’atelier à venir.",
    artworkIndex: "Index des œuvres ↗",
    toTop: "Haut de page",
    techniques: "Techniques",
    chronology: "Chronologie",
    formats: "Formats",
    digitalArchive: "Archive numérique",
    materials: "Matériaux",
    techniqueLines: [
      "10 impressions giclées sur papier chiffon collées sur Dibond",
      "3 impressions giclées sur papier chiffon",
      "1 lithographie — Atelier Bruno Robbe",
      "6 impressions sur toile",
    ],
    chronologyLines: [
      "2022, 2021, 2017, 2014, 2013, 2012",
      "2011, 2010, 2008, 2006, 2005, 2004",
      "2002, 2001, 2000, 1998, 1997, 1996",
      "1995, 1992, 1991, 1990, 1989",
    ],
    formatLines: [
      "32 petits formats — ≤ 65 cm",
      "43 formats moyens — de 65 à 150 cm",
      "26 grands formats — ≥ 150 cm",
      "Dimensions : de 15,3 × 22 à 500 × 700 cm",
    ],
    archiveLines: [
      "101 œuvres",
      "23 années représentées",
      "1989—2022",
      "Ordre, dimensions et attribution source conservés",
    ],
    materialsText:
      "33 tirages Lambda collés sur Dibond, 33 tirages photographiques collés sur Dibond, 15 tirages photographiques collés sur Forex, 13 impressions giclées sur papier chiffon, 6 impressions sur toile et 1 lithographie.",
  },
  en: {
    work: "Work",
    archive: "Archive",
    about: "About",
    close: "Close",
    open: "Open",
    selectedWorks: "Selected works",
    completeArchive: "Complete artwork archive",
    aboutParagraphs: [
      "Patrick Everaert’s archive brings together 101 works dated from 1989 to 2022. The corpus moves across photographic and Lambda prints, works mounted on Forex and Dibond, lithography, canvas, and giclée.",
      "This digital portfolio preserves the original sequence, physical dimensions, materials, and source attribution for every work.",
    ],
    worksCount: "101 works",
    dimensions: "All dimensions in centimetres",
    contact: "Contact",
    contactPending: "Studio details forthcoming.",
    artworkIndex: "Artwork index ↗",
    toTop: "To top",
    techniques: "Techniques",
    chronology: "Chronology",
    formats: "Formats",
    digitalArchive: "Digital archive",
    materials: "Materials",
    techniqueLines: [
      "10 giclée prints on rag paper mounted on Dibond",
      "3 giclée prints on rag paper",
      "1 lithograph — Atelier Bruno Robbe",
      "6 prints on canvas",
    ],
    chronologyLines: [
      "2022, 2021, 2017, 2014, 2013, 2012",
      "2011, 2010, 2008, 2006, 2005, 2004",
      "2002, 2001, 2000, 1998, 1997, 1996",
      "1995, 1992, 1991, 1990, 1989",
    ],
    formatLines: [
      "32 small works — ≤ 65 cm",
      "43 medium works — 65 to 150 cm",
      "26 large works — ≥ 150 cm",
      "Dimensions: from 15.3 × 22 to 500 × 700 cm",
    ],
    archiveLines: [
      "101 works",
      "23 years represented",
      "1989—2022",
      "Source order, dimensions and attribution preserved",
    ],
    materialsText:
      "33 Lambda prints mounted on Dibond, 33 photographic prints mounted on Dibond, 15 photographic prints mounted on Forex, 13 giclée prints on rag paper, 6 prints on canvas and 1 lithograph.",
  },
} as const;

const selectedOrders = [1, 15, 21, 43, 53, 67, 72, 77, 87, 95, 99, 101];

function ArtworkDialog({
  artwork,
  language,
  onClose,
}: {
  artwork: Artwork;
  language: Language;
  onClose: () => void;
}) {
  const text = copy[language];
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("dialog-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("dialog-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="portfolio-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={`${artwork.title}, ${artwork.year}`}
      onClick={onClose}
    >
      <button
        className="dialog-close"
        type="button"
        onClick={onClose}
        aria-label={language === "fr" ? "Fermer l’œuvre" : "Close artwork"}
        autoFocus
      >
        {text.close}
      </button>
      <figure className="dialog-figure" onClick={(event) => event.stopPropagation()}>
        <img
          src={artwork.localImageUrl}
          alt={`${artwork.title}, ${artwork.year}`}
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
        <figcaption>
          <span>
            {artwork.title}, {artwork.year}
          </span>
          <span>{artwork.material}</span>
          <span>{artwork.physical_dimensions}</span>
        </figcaption>
      </figure>
    </div>
  );
}

function SiteHeader({
  view,
  onView,
  language,
  onLanguage,
}: {
  view: View;
  onView: (view: View) => void;
  language: Language;
  onLanguage: (language: Language) => void;
}) {
  const text = copy[language];
  const goToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="portfolio-header">
      <nav
        className="portfolio-nav portfolio-nav-left"
        aria-label={language === "fr" ? "Vues du portfolio" : "Portfolio views"}
      >
        <button
          className={view === "work" ? "is-active" : ""}
          type="button"
          onClick={() => onView("work")}
        >
          {text.work}
        </button>
        <button
          className={view === "archive" ? "is-active" : ""}
          type="button"
          onClick={() => onView("archive")}
        >
          {text.archive}
        </button>
      </nav>
      <div className="header-right">
        <button className="about-jump" type="button" onClick={goToAbout}>
          {text.about} <span aria-hidden="true">↓</span>
        </button>
        <div className="language-switcher" aria-label="Language / Langue">
          <button
            className={language === "fr" ? "is-active" : ""}
            type="button"
            aria-pressed={language === "fr"}
            onClick={() => onLanguage("fr")}
          >
            FR
          </button>
          <span aria-hidden="true">/</span>
          <button
            className={language === "en" ? "is-active" : ""}
            type="button"
            aria-pressed={language === "en"}
            onClick={() => onLanguage("en")}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}

function WorkView({
  language,
  onOpen,
}: {
  language: Language;
  onOpen: (work: Artwork) => void;
}) {
  const selectedWorks = useMemo(
    () => selectedOrders.map((order) => artworks[order - 1]).filter(Boolean),
    [],
  );

  return (
    <section className="work-view" aria-label={copy[language].selectedWorks}>
      <div className="portfolio-intro">
        <h1>Patrick Everaert</h1>
      </div>
      <div className="work-sequence">
        {selectedWorks.map((work, index) => {
          const aspect = work.width / work.height;
          const format = aspect > 1.45 ? "wide" : aspect < 0.76 ? "tall" : "regular";
          return (
            <figure
              className={`work-entry work-entry-${format}`}
              key={work.id}
            >
              <button
                className="work-image-button"
                type="button"
                onClick={() => onOpen(work)}
                aria-label={`${copy[language].open} ${work.title}, ${work.year}`}
              >
                <img
                  src={work.localImageUrl}
                  alt={`${work.title}, ${work.year}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  draggable={false}
                />
              </button>
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{work.title}</span>
                <span>{work.year}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function ArchiveView({
  language,
  onOpen,
}: {
  language: Language;
  onOpen: (work: Artwork) => void;
}) {
  const text = copy[language];
  return (
    <section className="archive-view" aria-label={text.completeArchive}>
      <h1 className="sr-only">Patrick Everaert — {text.completeArchive}</h1>
      <div className="archive-grid">
        {artworks.map((work) => (
          <figure className="archive-entry" key={work.id}>
            <button
              className="archive-image-button"
              type="button"
              onClick={() => onOpen(work)}
              aria-label={`${text.open} ${work.title}, ${work.year}, ${work.physical_dimensions}`}
            >
              <img
                src={work.localImageUrl}
                alt={`${work.title}, ${work.year}`}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <span className="archive-meta" aria-hidden="true">
                <span>{String(work.sourceOrder).padStart(3, "0")}</span>
                <span>{work.year}</span>
              </span>
            </button>
          </figure>
        ))}
      </div>
    </section>
  );
}

function AboutFooter({ language }: { language: Language }) {
  const text = copy[language];
  return (
    <footer className="portfolio-footer" id="about">
      <section className="footer-block footer-about">
        <h2>{text.about}</h2>
        <p>{text.aboutParagraphs[0]}</p>
        <p>{text.aboutParagraphs[1]}</p>
      </section>
      <section className="footer-block footer-contact">
        <h2>{text.contact}</h2>
        <p>{text.contactPending}</p>
        <Link href="/manage">{text.artworkIndex}</Link>
      </section>
      <section className="footer-block footer-techniques">
        <h2>{text.techniques}</h2>
        {text.techniqueLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>
      <section className="footer-block footer-chronology">
        <h2>{text.chronology}</h2>
        {text.chronologyLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>
      <section className="footer-block footer-formats">
        <h2>{text.formats}</h2>
        {text.formatLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>
      <section className="footer-block footer-archive">
        <h2>{text.digitalArchive}</h2>
        {text.archiveLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>
      <section className="footer-block footer-materials">
        <h2>{text.materials}</h2>
        <p>{text.materialsText}</p>
      </section>
      <a className="to-top" href="#top">
        {text.toTop} <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}

export default function MuseumGallery() {
  const [view, setView] = useState<View>("work");
  const [language, setLanguage] = useState<Language>("fr");
  const [openWork, setOpenWork] = useState<Artwork | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const changeView = (nextView: View) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main className="portfolio-shell" id="top">
      <SiteHeader
        view={view}
        onView={changeView}
        language={language}
        onLanguage={setLanguage}
      />
      {view === "work" ? (
        <WorkView language={language} onOpen={setOpenWork} />
      ) : (
        <ArchiveView language={language} onOpen={setOpenWork} />
      )}
      <AboutFooter language={language} />
      {openWork && (
        <ArtworkDialog
          artwork={openWork}
          language={language}
          onClose={() => setOpenWork(null)}
        />
      )}
    </main>
  );
}
