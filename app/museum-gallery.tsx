"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  artworks,
  sizeCategoryConfig,
  type Artwork,
} from "../lib/artworks";

const HUMAN_HEIGHT_CM = 180;
const HANGING_CENTRE_CM = 150;
const LARGE_BOTTOM_EDGE_CM = 120;
const MIN_ZOOM = 0.7;
const MAX_ZOOM = 1.3;
const ZOOM_STEP = 0.05;

function ScaleFigure({ height }: { height: number }) {
  return (
    <div
      className="human-scale"
      style={{ height: `${height}px` }}
      aria-label="Human scale reference, 180 centimetres"
      role="img"
    >
      <img
        src="/scale-person-180.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
    </div>
  );
}

function GalleryArtwork({
  work,
  position,
  centerX,
  floorY,
  sceneScale,
  dragOffset,
  isDragging,
}: {
  work: Artwork;
  position: -1 | 0 | 1;
  centerX: number;
  floorY: number;
  sceneScale: number;
  dragOffset: number;
  isDragging: boolean;
}) {
  const width = work.width * sceneScale;
  const height = work.height * sceneScale;
  const centerY =
    work.sizeCategory === "large"
      ? floorY - (LARGE_BOTTOM_EDGE_CM + work.height / 2) * sceneScale
      : floorY - HANGING_CENTRE_CM * sceneScale;
  const top = centerY - height / 2;
  const isCurrent = position === 0;
  const floorClearance =
    work.sizeCategory === "large"
      ? LARGE_BOTTOM_EDGE_CM * sceneScale
      : (HANGING_CENTRE_CM - work.height / 2) * sceneScale;
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
  const [travelOffset, setTravelOffset] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const pointerStart = useRef<number | null>(null);
  const pointerLast = useRef({ x: 0, time: 0, velocity: 0 });
  const travelOffsetRef = useRef(0);
  const wheelMomentum = useRef(0);
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    return () => {
      if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current);
    };
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
  const glimpse = isMobile ? 34 : 64;
  const focusedWork = artworks[index];
  const focusedCategory = focusedWork.sizeCategory;
  const mobileCameraMultiplier = isMobile
    ? sizeCategoryConfig.mobileCameraMultiplier[focusedCategory]
    : 1;
  const categoryCameraTarget =
    sizeCategoryConfig.cameraBaseline[focusedCategory] *
    mobileCameraMultiplier;
  const focusedTopDistanceCm =
    focusedCategory === "large"
      ? LARGE_BOTTOM_EDGE_CM + focusedWork.height
      : HANGING_CENTRE_CM + focusedWork.height / 2;
  const verticalFit =
    (floorY - (isMobile ? 12 : 18)) /
    (focusedTopDistanceCm * sceneScale);
  const horizontalFit =
    (viewport.width * (isMobile ? 0.88 : 0.8)) /
    (focusedWork.width * sceneScale);
  const categoryCameraBaseline = Math.min(
    categoryCameraTarget,
    verticalFit,
    horizontalFit,
  );
  const cameraZoom = categoryCameraBaseline * zoom;

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
            ? viewport.width / 2 +
              (glimpse - viewport.width / 2) / cameraZoom -
              width / 2
            : viewport.width / 2 +
              (viewport.width - glimpse - viewport.width / 2) / cameraZoom +
              width / 2;
      return { position, work, centerX };
    });
  }, [cameraZoom, glimpse, index, sceneScale, viewport.width]);

  const previousTravel =
    viewport.width / 2 - galleryWindow.find((item) => item.position === -1)!.centerX;
  const nextTravel =
    galleryWindow.find((item) => item.position === 1)!.centerX -
    viewport.width / 2;

  const updateTravel = (value: number) => {
    travelOffsetRef.current = value;
    setTravelOffset(value);
  };

  const resistedTravel = (rawValue: number) => {
    const limit = rawValue < 0 ? nextTravel : previousTravel;
    const direction = rawValue < 0 ? -1 : 1;
    const magnitude = Math.abs(rawValue);
    const resistanceStart = limit * 0.68;
    const resisted =
      magnitude <= resistanceStart
        ? magnitude
        : resistanceStart + (magnitude - resistanceStart) * 0.24;
    return direction * Math.min(resisted, limit * 0.94);
  };

  const settleTrack = (momentum = 0) => {
    const projected = resistedTravel(travelOffsetRef.current + momentum);
    setIsInteracting(false);
    updateTravel(0);
    if (projected <= -nextTravel * 0.5) {
      move(1);
    } else if (projected >= previousTravel * 0.5) {
      move(-1);
    }
    pointerStart.current = null;
  };

  const adjustZoom = (amount: number) => {
    setZoom((current) => {
      const next = Math.round((current + amount) * 100) / 100;
      return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
    });
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
        style={
          {
            "--floor-y": `${floorY}px`,
            "--scene-zoom": cameraZoom,
          } as React.CSSProperties
        }
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button, a")) return;
          pointerStart.current = event.clientX;
          pointerLast.current = {
            x: event.clientX,
            time: event.timeStamp,
            velocity: 0,
          };
          setIsInteracting(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (pointerStart.current === null) return;
          const delta = (event.clientX - pointerStart.current) / cameraZoom;
          const elapsed = Math.max(1, event.timeStamp - pointerLast.current.time);
          pointerLast.current = {
            x: event.clientX,
            time: event.timeStamp,
            velocity:
              (event.clientX - pointerLast.current.x) /
              elapsed /
              cameraZoom,
          };
          updateTravel(resistedTravel(delta));
        }}
        onPointerUp={() => settleTrack(pointerLast.current.velocity * 90)}
        onPointerCancel={() => {
          pointerStart.current = null;
          setIsInteracting(false);
          updateTravel(0);
        }}
        onWheel={(event) => {
          const horizontalDelta =
            Math.abs(event.deltaX) > 0
              ? event.deltaX
              : event.shiftKey
                ? event.deltaY
                : 0;
          if (
            horizontalDelta === 0 ||
            (!event.shiftKey &&
              Math.abs(event.deltaX) < Math.abs(event.deltaY) * 0.72)
          ) {
            return;
          }
          event.preventDefault();
          const deltaModeFactor =
            event.deltaMode === 1
              ? 16
              : event.deltaMode === 2
                ? viewport.width
                : 1;
          const controlledDelta =
            (-horizontalDelta * deltaModeFactor * 0.78) / cameraZoom;
          wheelMomentum.current = controlledDelta;
          setIsInteracting(true);
          updateTravel(
            resistedTravel(travelOffsetRef.current + controlledDelta),
          );
          if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current);
          wheelEndTimer.current = setTimeout(() => {
            settleTrack(wheelMomentum.current * 0.85);
            wheelEndTimer.current = null;
          }, 120);
        }}
      >
        <div className="scene-world">
          <div className="wall-depth" aria-hidden="true" />
          <div className="floor-plane" aria-hidden="true" />

          <div className="gallery-track">
            {galleryWindow.map(({ position, work, centerX }) => (
              <GalleryArtwork
                key={work.id}
                work={work}
                position={position}
                centerX={centerX}
                floorY={floorY}
                sceneScale={sceneScale}
                dragOffset={travelOffset}
                isDragging={isInteracting}
              />
            ))}
          </div>

          <ScaleFigure height={HUMAN_HEIGHT_CM * sceneScale} />
          <div className="floor-line" aria-hidden="true" />
        </div>

        <button
          className="gallery-control gallery-control-left"
          type="button"
          aria-label="Previous artwork"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={() => move(-1)}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          className="gallery-control gallery-control-right"
          type="button"
          aria-label="Next artwork"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
          onClick={() => move(1)}
        >
          <span aria-hidden="true">→</span>
        </button>

        <div
          className="scene-zoom-controls"
          aria-label="Temporary scene scale controls"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Zoom scene out"
            onClick={() => adjustZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
          >
            −
          </button>
          <output
            aria-live="polite"
            aria-label={`${focusedCategory} camera, ${Math.round(
              zoom * 100,
            )} percent debug offset`}
          >
            {Math.round(zoom * 100)}%
          </output>
          <button
            type="button"
            aria-label="Zoom scene in"
            onClick={() => adjustZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
          >
            +
          </button>
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
