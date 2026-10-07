"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { artworks, type Artwork } from "../lib/artworks";

type View = "work" | "archive";

const selectedOrders = [1, 15, 21, 43, 53, 67, 72, 77, 87, 95, 99, 101];

function ArtworkDialog({
  artwork,
  onClose,
}: {
  artwork: Artwork;
  onClose: () => void;
}) {
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
        aria-label="Close artwork"
        autoFocus
      >
        Close
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
}: {
  view: View;
  onView: (view: View) => void;
}) {
  const goToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="portfolio-header">
      <nav className="portfolio-nav portfolio-nav-left" aria-label="Portfolio views">
        <button
          className={view === "work" ? "is-active" : ""}
          type="button"
          onClick={() => onView("work")}
        >
          Work
        </button>
        <button
          className={view === "archive" ? "is-active" : ""}
          type="button"
          onClick={() => onView("archive")}
        >
          Archive
        </button>
      </nav>
      <button className="about-jump" type="button" onClick={goToAbout}>
        About <span aria-hidden="true">↓</span>
      </button>
    </header>
  );
}

function WorkView({ onOpen }: { onOpen: (work: Artwork) => void }) {
  const selectedWorks = useMemo(
    () => selectedOrders.map((order) => artworks[order - 1]).filter(Boolean),
    [],
  );

  return (
    <section className="work-view" aria-label="Selected works">
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
                aria-label={`Open ${work.title}, ${work.year}`}
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

function ArchiveView({ onOpen }: { onOpen: (work: Artwork) => void }) {
  return (
    <section className="archive-view" aria-label="Complete artwork archive">
      <h1 className="sr-only">Patrick Everaert — Complete archive</h1>
      <div className="archive-grid">
        {artworks.map((work) => (
          <figure className="archive-entry" key={work.id}>
            <button
              className="archive-image-button"
              type="button"
              onClick={() => onOpen(work)}
              aria-label={`Open ${work.title}, ${work.year}, ${work.physical_dimensions}`}
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

function AboutFooter() {
  return (
    <footer className="portfolio-footer" id="about">
      <div className="footer-introduction">
        <h2>About</h2>
        <p>
          Patrick Everaert’s archive brings together 101 works dated from 1989
          to 2022. The corpus moves across photographic and Lambda prints,
          works mounted on Forex and Dibond, lithography, canvas, and giclée.
        </p>
        <p>
          This digital portfolio preserves the original sequence, physical
          dimensions, materials, and source attribution for every work.
        </p>
      </div>
      <div className="footer-column">
        <h2>Archive</h2>
        <p>101 works</p>
        <p>1989—2022</p>
        <p>All dimensions in centimetres</p>
      </div>
      <div className="footer-column">
        <h2>Contact</h2>
        <p>Studio details forthcoming.</p>
        <Link href="/manage">Artwork index ↗</Link>
      </div>
      <a className="to-top" href="#top">
        To top <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}

export default function MuseumGallery() {
  const [view, setView] = useState<View>("work");
  const [openWork, setOpenWork] = useState<Artwork | null>(null);

  const changeView = (nextView: View) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <main className="portfolio-shell" id="top">
      <SiteHeader view={view} onView={changeView} />
      {view === "work" ? (
        <WorkView onOpen={setOpenWork} />
      ) : (
        <ArchiveView onOpen={setOpenWork} />
      )}
      <AboutFooter />
      {openWork && (
        <ArtworkDialog artwork={openWork} onClose={() => setOpenWork(null)} />
      )}
    </main>
  );
}
