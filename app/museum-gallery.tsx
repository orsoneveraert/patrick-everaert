"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { artworks, type Artwork } from "../lib/artworks";

const HUMAN_HEIGHT_CM = 180;
const HANGING_CENTRE_CM = 150;
const SWIPE_THRESHOLD_PX = 46;

function ScaleFigure({ height }: { height: number }) {
  return (
    <div
      className="human-scale"
      style={{ height: `${height}px` }}
      aria-label="Human scale reference, 180 centimetres"
      role="img"
    >
      <svg
        viewBox="0 0 84 180"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMax meet"
      >
        <circle cx="43" cy="15" r="8.5" />
        <path d="M39.5 23.5v7l-9 5.5-5 29 6 43" />
        <path d="M47 23.5v7l8.5 5.5 5.5 29-5 38" />
        <path d="M31 36c2 19 3 38 4 57l-2 23" />
        <path d="M55.5 36c-1 19-2 38-3.5 57l2 23" />
        <path d="M35 92c1 10 2 18 1 27l-3 50" />
        <path d="M52 92c-1 10-2 18-1 27l4 50" />
        <path d="M36 118l9 1 6-1" />
        <path d="M33 169h-9c-3 0-4 4-1 5h13" />
        <path d="M55 169h8c3 0 5 4 1 5H52" />
        <path d="M25.5 65l-3 36 7 7" />
        <path d="M61 65l3 34-8 4" />
      </svg>
      <span>180 cm</span>
    </div>
  );
}

function GalleryArtwork({
  work,
  position,
  centerX,
  centerY,
  sceneScale,
  dragOffset,
  isDragging,
}: {
  work: Artwork;
  position: -1 | 0 | 1;
  centerX: number;
  centerY: number;
  sceneScale: number;
  dragOffset: number;
  isDragging: boolean;
}) {
  const width = work.width * sceneScale;
  const height = work.height * sceneScale;
  const top = centerY - height / 2;
  const isCurrent = position === 0;
  const floorClearance =
    (HANGING_CENTRE_CM - work.height / 2) * sceneScale;
  const compactLegend = floorClearance < 58;

  return (
    <article
      className={[
        "artwork-slot",
        isCurrent ? "artwork-slot-current" : "artwork-slot-neighbour",
        isDragging ? "is-dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${centerX + dragOffset}px`,
        top: `${top}px`,
        width: `${width}px`,
      }}
      aria-hidden={!isCurrent}
    >
      <div
        className="artwork-frame"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <img
          src={work.image_url}
          alt={isCurrent ? `${work.title}, ${work.year}` : ""}
          draggable={false}
          loading="eager"
          decoding="async"
          fetchPriority={isCurrent ? "high" : "auto"}
        />
      </div>
      {isCurrent && (
        <div
          className={
            compactLegend
              ? "artwork-label artwork-label-compact"
              : "artwork-label"
          }
          aria-live="polite"
        >
          {compactLegend ? (
            <>
              <p>
                {work.title}, {work.year} · {work.physical_dimensions}
              </p>
              <p>{work.material}</p>
            </>
          ) : (
            <>
              <p>
                {work.title}, {work.year}
              </p>
              <p>{work.material}</p>
              <p>{work.physical_dimensions}</p>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function MuseumGallery() {
  const [index, setIndex] = useState(0);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [contactOpen, setContactOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef<number | null>(null);

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const move = (amount: number) => {
    setIndex((current) => (current + amount + artworks.length) % artworks.length);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(artworks.length - 1);
      if (event.key === "Escape") setContactOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const preloadOffsets = [-2, -1, 0, 1, 2];
    preloadOffsets.forEach((offset) => {
      const work =
        artworks[(index + offset + artworks.length) % artworks.length];
      const image = new Image();
      image.decoding = "async";
      image.src = work.image_url;
    });
  }, [index]);

  const isMobile = viewport.width < 680;
  const headerHeight = isMobile ? 70 : 86;
  const stageHeight = viewport.height - headerHeight;
  const sceneScale = isMobile ? 1.08 : 1.48;
  const floorY = stageHeight * (isMobile ? 0.8 : 0.78);
  const hangingCenterY = floorY - HANGING_CENTRE_CM * sceneScale;
  const glimpse = isMobile ? 34 : 64;

  const galleryWindow = useMemo(() => {
    return ([-1, 0, 1] as const).map((position) => {
      const workIndex =
        (index + position + artworks.length) % artworks.length;
      const work = artworks[workIndex];
      const width = work.width * sceneScale;
      const centerX =
        position === 0
          ? viewport.width / 2
          : position < 0
            ? glimpse - width / 2
            : viewport.width - glimpse + width / 2;
      return { position, work, centerX };
    });
  }, [glimpse, index, sceneScale, viewport.width]);

  const finishGesture = (clientX: number) => {
    if (pointerStart.current === null) return;
    const delta = clientX - pointerStart.current;
    setIsDragging(false);
    setDragOffset(0);
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      move(delta < 0 ? 1 : -1);
    }
    pointerStart.current = null;
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
        className="gallery-stage"
        aria-label="Artwork gallery"
        style={{ "--floor-y": `${floorY}px` } as React.CSSProperties}
        onPointerDown={(event) => {
          pointerStart.current = event.clientX;
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (pointerStart.current === null) return;
          const delta = event.clientX - pointerStart.current;
          setDragOffset(
            Math.max(-viewport.width * 0.42, Math.min(viewport.width * 0.42, delta)),
          );
        }}
        onPointerUp={(event) => finishGesture(event.clientX)}
        onPointerCancel={() => {
          pointerStart.current = null;
          setDragOffset(0);
          setIsDragging(false);
        }}
      >
        <div className="floor-plane" aria-hidden="true" />

        <div className="gallery-track">
          {galleryWindow.map(({ position, work, centerX }) => (
            <GalleryArtwork
              key={work.id}
              work={work}
              position={position}
              centerX={centerX}
              centerY={hangingCenterY}
              sceneScale={sceneScale}
              dragOffset={dragOffset}
              isDragging={isDragging}
            />
          ))}
        </div>

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

        <ScaleFigure height={HUMAN_HEIGHT_CM * sceneScale} />

        <div className="interaction-hint" aria-hidden="true">
          <span>← →</span>
          <span>{isMobile ? "Swipe to walk" : "Arrow keys to walk"}</span>
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
