"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  collections,
  type CollectionId,
  getCollectionWorks,
} from "../lib/artworks";

const HUMAN_HEIGHT_CM = 175;

function HumanFigure({ height }: { height: number }) {
  return (
    <div
      className="human-scale"
      style={{ height: `${height}px`, width: `${height * 0.25}px` }}
      aria-label="Human scale reference, 175 centimetres"
      role="img"
    >
      <span className="human-head" />
      <span className="human-body" />
      <span className="human-arm arm-left" />
      <span className="human-arm arm-right" />
      <span className="human-leg leg-left" />
      <span className="human-leg leg-right" />
      <span className="human-height-label">175 cm</span>
    </div>
  );
}

export default function MuseumGallery() {
  const [collectionId, setCollectionId] =
    useState<CollectionId>("sequence");
  const [index, setIndex] = useState(0);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [contactOpen, setContactOpen] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const stageRef = useRef<HTMLElement>(null);

  const works = useMemo(
    () => getCollectionWorks(collectionId),
    [collectionId],
  );
  const artwork = works[index] ?? works[0];

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const move = (amount: number) => {
    setIndex((current) => (current + amount + works.length) % works.length);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(works.length - 1);
      if (event.key === "Escape") setContactOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const isMobile = viewport.width < 680;
  const baseScale = isMobile ? 1.25 : 1.8;
  const availableWidth = viewport.width * (isMobile ? 0.72 : 0.6);
  const availableHeight = viewport.height * (isMobile ? 0.34 : 0.43);
  const scale = Math.min(
    baseScale,
    availableWidth / artwork.width,
    availableHeight / artwork.height,
  );
  const reduced = scale < baseScale - 0.02;
  const artWidth = artwork.width * scale;
  const artHeight = artwork.height * scale;

  const setCollection = (value: string) => {
    setCollectionId(value as CollectionId);
    setIndex(0);
  };

  return (
    <main className="museum-shell">
      <header className="site-header">
        <a className="artist-name" href="/" aria-label="Patrick Everaert home">
          Patrick Everaert
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#gallery">Works</a>
          <a href="/manage">Index</a>
          <button type="button" onClick={() => setContactOpen(true)}>
            Contact
          </button>
        </nav>
      </header>

      <section
        id="gallery"
        ref={stageRef}
        className="gallery-stage"
        aria-label={`${collectionId} gallery`}
        onPointerDown={(event) => {
          pointerStart.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return;
          const delta = event.clientX - pointerStart.current;
          if (Math.abs(delta) > 45) move(delta < 0 ? 1 : -1);
          pointerStart.current = null;
        }}
      >
        <div className="gallery-tools">
          <label htmlFor="collection-select">Collection</label>
          <select
            id="collection-select"
            value={collectionId}
            onChange={(event) => setCollection(event.target.value)}
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.label}
              </option>
            ))}
          </select>
        </div>

        <div className="floor-plane" aria-hidden="true" />

        <button
          className="gallery-control gallery-control-left"
          type="button"
          aria-label="Previous artwork"
          onClick={() => move(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          className="gallery-control gallery-control-right"
          type="button"
          aria-label="Next artwork"
          onClick={() => move(1)}
        >
          <span aria-hidden="true">→</span>
        </button>

        <div className="artwork-group">
          <div
            className="artwork-frame"
            style={{ width: `${artWidth}px`, height: `${artHeight}px` }}
          >
            <img
              key={artwork.id}
              src={artwork.image_url}
              alt={`${artwork.title}, ${artwork.year}`}
              draggable={false}
            />
          </div>
          <div className="artwork-label" aria-live="polite">
            <div className="label-topline">
              <span>
                {artwork.title}, {artwork.year}
              </span>
              <span>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(works.length).padStart(2, "0")}
              </span>
            </div>
            <p>{artwork.material}</p>
            <p className="dimensions">
              {artwork.physical_dimensions}
              {reduced ? " · reduced scene scale" : ""}
            </p>
          </div>
        </div>

        <HumanFigure height={HUMAN_HEIGHT_CM * scale} />

        <div className="interaction-hint" aria-hidden="true">
          <span>← →</span>
          <span>{isMobile ? "Swipe to browse" : "Arrow keys to browse"}</span>
        </div>
      </section>

      {contactOpen && (
        <div className="contact-panel" role="dialog" aria-modal="true">
          <button
            className="contact-close"
            type="button"
            onClick={() => setContactOpen(false)}
            aria-label="Close contact panel"
          >
            ×
          </button>
          <p className="contact-eyebrow">Contact</p>
          <h2>Studio details forthcoming.</h2>
          <p>
            This space is prepared for representation, press and studio contact
            information.
          </p>
        </div>
      )}
    </main>
  );
}
