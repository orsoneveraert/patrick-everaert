"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { artworks, type Artwork } from "../lib/artworks";
import {
  collectiveExhibitions,
  personalExhibitions,
} from "../lib/exhibitions";
import {
  collectivePublications,
  personalPublications,
  type Publication,
} from "../lib/publications";

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
      "Patrick Everaert, né en 1962 à Charleroi, est un artiste belge dont la pratique interroge la fabrication et l’autorité des images. Depuis le début des années 1990, il travaille à partir de photographies puisées dans des fonds d’archives documentaires, qu’il transforme longuement par montage, collage et superposition.",
      "Ces manipulations produisent des scènes plausibles mais impossibles, ouvertes à plusieurs récits, qui invitent le regardeur à ralentir et à douter de ce qu’il voit. Se décrivant comme un « peintre sans pinceau et photographe sans appareil », il a présenté son travail en Belgique et à l’étranger, notamment au BPS22, au FRAC Provence-Alpes-Côte d’Azur, au Jeu de Paume et dans le cadre de la 49e Biennale de Venise.",
    ],
    worksCount: "101 œuvres",
    dimensions: "Toutes les dimensions sont en centimètres",
    contact: "Contact",
    contactEmail: "patrickeveraert@mac.com",
    toTop: "Haut de page",
    personalPublication: "Publications personnelles",
    collectivePublication: "Publications collectives",
    personalExhibition: "Expositions personnelles",
    collectiveExhibition: "Expositions collectives",
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
      "Patrick Everaert, born in Charleroi in 1962, is a Belgian artist whose practice questions how images are constructed and how they exert authority. Since the early 1990s, he has worked with photographs drawn from documentary archives, transforming them over long periods through montage, collage, and superimposition.",
      "The resulting scenes feel plausible yet impossible, opening onto multiple narratives and asking viewers to slow down and doubt what they see. Describing himself as a ‘painter without a brush and a photographer without a camera,’ he has exhibited in Belgium and internationally, including at BPS22, FRAC Provence-Alpes-Côte d’Azur, the Jeu de Paume, and in the context of the 49th Venice Biennale.",
    ],
    worksCount: "101 works",
    dimensions: "All dimensions in centimetres",
    contact: "Contact",
    contactEmail: "patrickeveraert@mac.com",
    toTop: "To top",
    personalPublication: "Personal publications",
    collectivePublication: "Collective publications",
    personalExhibition: "Personal exhibition",
    collectiveExhibition: "Collective exhibition",
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
      if (event.key === "Escape" || event.code === "Escape") {
        event.preventDefault();
        onClose();
      }
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
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label={language === "fr" ? "Fermer l’œuvre" : "Close artwork"}
        title={text.close}
        autoFocus
      >
        <span aria-hidden="true">×</span>
      </button>
      <figure className="dialog-figure" onClick={(event) => event.stopPropagation()}>
        <img
          src={artwork.localImageUrl}
          alt={`${artwork.title}, ${artwork.year} — ${artwork.material}, ${artwork.physical_dimensions}`}
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
    <header
      className={`portfolio-header${view === "archive" ? " is-archive" : ""}`}
    >
      <h1 className="header-title">Patrick Everaert</h1>
      <nav
        className="portfolio-nav"
        aria-label={language === "fr" ? "Vues du portfolio" : "Portfolio views"}
      >
        <div className="portfolio-nav-menu">
          <Link
            className={view === "work" ? "is-active" : ""}
            href="/"
            aria-current={view === "work" ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onView("work");
            }}
          >
            {text.work}
          </Link>
          <Link
            className={view === "archive" ? "is-active" : ""}
            href="/archive"
            aria-current={view === "archive" ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onView("archive");
            }}
          >
            {text.archive}
          </Link>
        </div>
        <div className="header-right">
          <button className="about-jump" type="button" onClick={goToAbout}>
            <span className="about-label">{text.about}</span>
            <span className="about-arrow" aria-hidden="true">↓</span>
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
      </nav>
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
      <div className="portfolio-intro" aria-hidden="true" />
      <div className="work-sequence">
        {selectedWorks.map((work, index) => {
          const aspect = work.width / work.height;
          const format = aspect > 1.45 ? "wide" : aspect < 0.76 ? "tall" : "regular";
          return (
            <figure
              className={`work-entry work-entry-${format}`}
              key={work.id}
              style={
                {
                  "--work-aspect": aspect,
                } as CSSProperties & { "--work-aspect": number }
              }
            >
              <button
                className="work-image-button"
                type="button"
                onClick={() => onOpen(work)}
                aria-label={`${copy[language].open} ${work.title}, ${work.year}`}
              >
                <img
                  src={work.localImageUrl}
                  alt={`${work.title}, ${work.year} — ${work.material}, ${work.physical_dimensions}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  draggable={false}
                />
              </button>
              <figcaption>
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
  const archiveWorks = useMemo(
    () =>
      [...artworks].sort(
        (a, b) =>
          Number(b.year) - Number(a.year) || a.sourceOrder - b.sourceOrder,
      ),
    [],
  );

  return (
    <section className="archive-view" aria-label={text.completeArchive}>
      <h1 className="sr-only">Patrick Everaert — {text.completeArchive}</h1>
      <div className="archive-sequence">
        {archiveWorks.map((work, index) => (
          <figure className="archive-entry" key={work.id}>
            <button
              className="archive-image-button"
              type="button"
              onClick={() => onOpen(work)}
              aria-label={`${text.open} ${work.title}, ${work.year}, ${work.physical_dimensions}`}
            >
              <img
                src={work.localImageUrl}
                alt={`${work.title}, ${work.year} — ${work.material}, ${work.physical_dimensions}`}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                draggable={false}
              />
            </button>
            <figcaption>
              <span className="archive-caption-title">
                {work.title}, {work.year}
              </span>
              <span>{work.material}</span>
              <span>{work.physical_dimensions}</span>
              {work.caption_remainder ? (
                <span className="archive-caption-collection">
                  {work.caption_remainder}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function AboutFooter({ language }: { language: Language }) {
  const text = copy[language];
  const publicationList = (items: readonly Publication[]) => (
    <div className="publication-list">
      {items.map((publication) => (
        <article className="publication-entry" key={publication.title}>
          <p>{publication.title}</p>
          <p>{publication.meta}</p>
          {publication.details?.map((detail) => (
            <p className="publication-detail" key={detail}>
              {detail}
            </p>
          ))}
        </article>
      ))}
    </div>
  );

  return (
    <footer className="portfolio-footer" id="about">
      <section className="footer-block footer-about">
        <h2>{text.about}</h2>
        <p>{text.aboutParagraphs[0]}</p>
        <p>{text.aboutParagraphs[1]}</p>
      </section>
      <section className="footer-block footer-contact">
        <h2>{text.contact}</h2>
        <p>
          <a href={`mailto:${text.contactEmail}`}>{text.contactEmail}</a>
        </p>
      </section>
      <section className="footer-block footer-personal-publications">
        <h2>{text.personalPublication}</h2>
        {publicationList(personalPublications)}
      </section>
      <section className="footer-block footer-collective-publications">
        <h2>{text.collectivePublication}</h2>
        {publicationList(collectivePublications)}
      </section>
      <section className="footer-block footer-personal-exhibition">
        <h2>{text.personalExhibition}</h2>
        <div className="exhibition-list">
          {personalExhibitions.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>
      <section className="footer-block footer-collective-exhibition">
        <h2>{text.collectiveExhibition}</h2>
        <div className="exhibition-list exhibition-list-collective">
          {collectiveExhibitions.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>
      <a className="to-top" href="#top">
        {text.toTop} <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}

export default function MuseumGallery({
  initialView = "work",
}: {
  initialView?: View;
}) {
  const [view, setView] = useState<View>(initialView);
  const [language, setLanguage] = useState<Language>("fr");
  const [openWork, setOpenWork] = useState<Artwork | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const syncViewToPath = () => {
      setView(window.location.pathname === "/archive" ? "archive" : "work");
    };
    window.addEventListener("popstate", syncViewToPath);
    return () => window.removeEventListener("popstate", syncViewToPath);
  }, []);

  const changeView = (nextView: View) => {
    if (nextView !== view) {
      window.history.pushState(
        { view: nextView },
        "",
        nextView === "archive" ? "/archive" : "/",
      );
    }
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
