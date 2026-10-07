"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef, useCallback, type CSSProperties } from "react";
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

import { portfolioPath, type View, type Language } from "../lib/portfolio-routes";
import imageVariants from "../data/image-variants.json";

function responsiveImage(work: Artwork) {
  const image = imageVariants[work.id as keyof typeof imageVariants];
  return {
    srcSet: image.variants.map(({ url, width }) => `${url} ${width}w`).join(", "),
    width: image.width,
    height: image.height,
  };
}

function workImageSizes(work: Artwork, index: number) {
  const aspect = work.width / work.height;
  const maximum = index === 0 ? "min(78vw, 1180px)" : aspect > 1.45 ? "min(82vw, 1240px)" : aspect < 0.76 ? "min(54vw, 760px)" : "min(70vw, 1060px)";
  const mobileMaximum = index !== 0 && aspect < 0.76 ? "72vw" : "calc(100vw - 32px)";
  return `(max-width: 680px) min(${mobileMaximum}, calc((100svh - 104px) * ${aspect})), min(${maximum}, calc((100svh - 112px) * ${aspect}), calc(100vw - 40px))`;
}

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
    personalExhibition: "Personal exhibitions",
    collectiveExhibition: "Collective exhibitions",
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    dialog?.focus({ preventScroll: true });
    document.body.classList.add("dialog-open");
    return () => {
      dialog?.close();
      document.body.classList.remove("dialog-open");
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="portfolio-dialog"
      tabIndex={-1}
      autoFocus
      aria-label={`${artwork.title}, ${artwork.year}`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
        }
      }}
    >
      <button
        className="dialog-close"
        type="button"
        onClick={onClose}
        aria-label={language === "fr" ? "Fermer l’œuvre" : "Close artwork"}
      >
        <span aria-hidden="true">×</span>
      </button>
      <img
        src={artwork.localImageUrl}
        {...responsiveImage(artwork)}
        sizes={`min(100vw, ${100 * responsiveImage(artwork).width / responsiveImage(artwork).height}dvh)`}
        alt={`${artwork.title}, ${artwork.year} — ${artwork.material}, ${artwork.physical_dimensions}`}
        draggable={false}
        decoding="async"
        fetchPriority="high"
      />
    </dialog>
  );
}

function SiteHeader({
  view,
  language,
  openWork,
}: {
  view: View;
  language: Language;
  openWork: Artwork | null;
}) {
  const text = copy[language];
  const [aboutActive, setAboutActive] = useState(false);
  useEffect(() => {
    const footer = document.getElementById("about");
    if (!footer) return;
    let observer: IntersectionObserver;
    const observeFooter = () => {
      observer?.disconnect();
      const line = window.innerWidth < 640 ? 96 : 56;
      observer = new IntersectionObserver(([entry]) => {
        setAboutActive(entry.isIntersecting);
      }, {
        // Follow the section directly beneath the fixed navigation, even for a long footer.
        rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px`,
      });
      observer.observe(footer);
    };
    observeFooter();
    window.addEventListener("resize", observeFooter);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", observeFooter);
    };
  }, [view]);
  const decades = [...new Set(artworks.map((work) => Math.floor(Number(work.year) / 10) * 10))].sort((a, b) => b - a);
  const goToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`portfolio-header${view === "archive" ? " is-archive" : ""}`}
    >
      <h1 className="header-title">
        <Link href={portfolioPath(language)}>Patrick Everaert</Link>
      </h1>
      <nav
        className="portfolio-nav"
        aria-label={language === "fr" ? "Vues du portfolio" : "Portfolio views"}
      >
        <div className="portfolio-nav-menu">
          <Link
            className={view === "work" && !aboutActive ? "is-active" : ""}
            href={portfolioPath(language)}
            aria-current={view === "work" && !aboutActive ? "page" : undefined}
          >
            {text.work}
          </Link>
          <Link
            className={view === "archive" && !aboutActive ? "is-active" : ""}
            href={portfolioPath(language, "archive")}
            aria-current={view === "archive" && !aboutActive ? "page" : undefined}
          >
            {text.archive}
          </Link>
          {view === "archive" && (
            <div className="archive-decades" role="group" aria-label={language === "fr" ? "Parcourir par décennie" : "Browse by decade"}>
              {decades.map((decade, index) => (
                <span key={decade}>
                  {index > 0 && <span aria-hidden="true"> · </span>}
                  <a href={`#decade-${decade}`} aria-label={language === "fr" ? `Années ${decade}` : `${decade}s`}>
                    {decade}
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="header-right">
          <button className={`about-jump${aboutActive ? " is-active" : ""}`} type="button" onClick={goToAbout} aria-current={aboutActive ? "location" : undefined}>
            <span className="about-label">{text.about}</span>
            <span className="about-arrow" aria-hidden="true">↓</span>
          </button>
          <div className="language-switcher" aria-label="Language / Langue">
            <Link
              className={language === "fr" ? "is-active" : ""}
              href={portfolioPath("fr", view, openWork?.id)}
              hrefLang="fr"
              aria-current={language === "fr" ? "page" : undefined}
            >
              FR
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              className={language === "en" ? "is-active" : ""}
              href={portfolioPath("en", view, openWork?.id)}
              hrefLang="en"
              aria-current={language === "en" ? "page" : undefined}
            >
              EN
            </Link>
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
              <a
                className="work-image-button"
                href={portfolioPath(language, "work", work.id)}
                onClick={(event) => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpen(work); } }}
                aria-label={`${copy[language].open} ${work.title}, ${work.year}`}
              >
                <img
                  src={work.localImageUrl}
                  {...responsiveImage(work)}
                  sizes={workImageSizes(work, index)}
                  alt={`${work.title}, ${work.year} — ${work.material}, ${work.physical_dimensions}`}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                  draggable={false}
                />
              </a>
              <figcaption>
                <span>{work.title}, {work.year}</span>
                {/^(collection|galerie)\b/i.test(work.caption_remainder.trim()) && (
                  <span>{work.caption_remainder}</span>
                )}
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
          <figure
            className="archive-entry"
            key={work.id}
            id={index === 0 || Math.floor(Number(work.year) / 10) !== Math.floor(Number(archiveWorks[index - 1].year) / 10)
              ? `decade-${Math.floor(Number(work.year) / 10) * 10}` : undefined}
          >
            <a
              className="archive-image-button"
              href={portfolioPath(language, "archive", work.id)}
              onClick={(event) => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onOpen(work); } }}
              aria-label={`${text.open} ${work.title}, ${work.year}, ${work.physical_dimensions}`}
            >
              <img
                src={work.localImageUrl}
                {...responsiveImage(work)}
                sizes="(max-width: 680px) 65vw, 70vw"
                alt={`${work.title}, ${work.year} — ${work.material}, ${work.physical_dimensions}`}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
                draggable={false}
              />
            </a>
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
        <span className="to-top-content">
          <span className="about-label">{text.toTop}</span>
          <span className="about-arrow" aria-hidden="true">↑</span>
        </span>
      </a>
    </footer>
  );
}

export default function MuseumGallery({
  initialView = "work",
  initialLanguage = "fr",
  initialArtwork = null,
}: {
  initialView?: View;
  initialLanguage?: Language;
  initialArtwork?: Artwork | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [openWork, setOpenWork] = useState<Artwork | null>(initialArtwork);
  const openedHere = useRef(false);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const syncLocation = () => {
      const path = window.location.pathname.replace(/\/$/, "");
      const nextLanguage = path.startsWith("/en") ? "en" : "fr";
      const id = path.match(/\/(?:oeuvres|works)\/(pe-\d+)$/)?.[1];
      setLanguage(nextLanguage);
      if (!id) setView(path.endsWith("/archive") ? "archive" : "work");
      setOpenWork(artworks.find((work) => work.id === id) ?? null);
    };
    window.addEventListener("popstate", syncLocation);
    return () => window.removeEventListener("popstate", syncLocation);
  }, []);

  const openArtwork = (work: Artwork) => {
    window.history.pushState({ ...window.history.state }, "", portfolioPath(language, view, work.id));
    openedHere.current = true;
    setOpenWork(work);
  };

  const closeArtwork = useCallback(() => {
    if (openedHere.current) {
      openedHere.current = false;
      window.history.back();
    } else {
      router.replace(portfolioPath(language, view), { scroll: false });
    }
  }, [language, view, router]);

  return (
    <main className="portfolio-shell" id="top">
      <SiteHeader view={view} language={language} openWork={openWork} />
      {view === "work" ? (
        <WorkView language={language} onOpen={openArtwork} />
      ) : (
        <ArchiveView language={language} onOpen={openArtwork} />
      )}
      <AboutFooter language={language} />
      {openWork && (
        <ArtworkDialog artwork={openWork} language={language} onClose={closeArtwork} />
      )}
    </main>
  );
}
