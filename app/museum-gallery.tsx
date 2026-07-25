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

function ScaleFigure({ height, left }: { height: number; left: number }) {
  return (
    <div
      className="human-scale"
      style={{ height: `${height}px`, left: `${left}px` }}
      aria-label="Human scale reference, 180 centimetres"
      role="img"
    >
      <img
        src="/scale-person-180-v2.png"
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
  imageSrc,
}: {
  work: Artwork;
  position: -1 | 0 | 1;
  centerX: number;
  floorY: number;
  sceneScale: number;
  dragOffset: number;
  isDragging: boolean;
  imageSrc: string;
}) {
  const width = work.width * sceneScale;
  const height = work.height * sceneScale;
  const centerY =
    work.sizeCategory === "large"
      ? floorY - (LARGE_BOTTOM_EDGE_CM + work.height / 2) * sceneScale
      : floorY - HANGING_CENTRE_CM * sceneScale;
  const top = centerY - height / 2;
  const isCurrent = position === 0;

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
          src={imageSrc}
          alt={isCurrent ? `${work.title}, ${work.year}` : ""}
          draggable={false}
          loading="eager"
          decoding="async"
          fetchPriority={isCurrent ? "high" : "auto"}
        />
      </div>
    </article>
  );
}

export default function MuseumGallery() {
  const [index, setIndex] = useState(0);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [contactOpen, setContactOpen] = useState(false);
  const [travelOffset, setTravelOffset] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
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

  const isMobile = viewport.width < 680;
  const headerHeight = isMobile ? 70 : 86;
  const stageHeight = viewport.height - headerHeight;
  const sceneScale = isMobile ? 1.08 : 1.48;
  const floorY = stageHeight * (isMobile ? 0.8 : 0.78);
  const glimpse = isMobile ? 34 : 64;
  const focusedWork = artworks[index];
  const focusedCategory = focusedWork.sizeCategory;
  const framingWidth =
    viewport.width *
    (isMobile
      ? sizeCategoryConfig.cameraFrame.mobileWidth
      : sizeCategoryConfig.cameraFrame.desktopWidth);
  const framingHeight =
    stageHeight *
    (isMobile
      ? sizeCategoryConfig.cameraFrame.mobileHeight
      : sizeCategoryConfig.cameraFrame.desktopHeight);
  const cameraZoom = Math.min(
    framingWidth / (focusedWork.width * sceneScale),
    framingHeight / (focusedWork.height * sceneScale),
    sizeCategoryConfig.cameraMaxZoom[focusedCategory],
  );
  const focusedCenterY =
    focusedCategory === "large"
      ? floorY -
        (LARGE_BOTTOM_EDGE_CM + focusedWork.height / 2) * sceneScale
      : floorY - HANGING_CENTRE_CM * sceneScale;
  const focusedScreenCenterY =
    floorY + (focusedCenterY - floorY) * cameraZoom;
  const cameraPanY =
    stageHeight * (isMobile ? 0.43 : 0.44) - focusedScreenCenterY;
  const personHeight = HUMAN_HEIGHT_CM * sceneScale;
  const personWidth = personHeight * (235 / 1071);
  const personScreenWidth = personWidth * cameraZoom;
  const desiredPersonScreenLeft =
    viewport.width - Math.max(isMobile ? 72 : 90, personScreenWidth * 0.72);
  const personLeft =
    viewport.width / 2 +
    (desiredPersonScreenLeft - viewport.width / 2) / cameraZoom;

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
            "--scene-pan-y": `${cameraPanY}px`,
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
        <div className="scene-camera">
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
                  imageSrc={work.localImageUrl}
                />
              ))}
            </div>

            <div className="floor-line" aria-hidden="true" />
          </div>
        </div>

        <div className="person-camera">
          <div className="person-world">
            <ScaleFigure height={personHeight} left={personLeft} />
          </div>
        </div>

        <button
          className="gallery-control gallery-control-left"
          type="button"
          aria-label="Previous artwork"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => {
            event.stopPropagation();
            move(-1);
          }}
          onClick={(event) => {
            if (event.detail === 0) move(-1);
          }}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          className="gallery-control gallery-control-right"
          type="button"
          aria-label="Next artwork"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => {
            event.stopPropagation();
            move(1);
          }}
          onClick={(event) => {
            if (event.detail === 0) move(1);
          }}
        >
          <span aria-hidden="true">→</span>
        </button>

        <div className="gallery-legend" aria-live="polite">
          <p>
            {focusedWork.title}, {focusedWork.year}
          </p>
          <p>{focusedWork.material}</p>
          <p>{focusedWork.physical_dimensions}</p>
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
