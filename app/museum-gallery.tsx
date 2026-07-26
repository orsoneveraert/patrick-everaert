"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  artworks,
  sizeCategoryConfig,
  type Artwork,
} from "../lib/artworks";

const HUMAN_HEIGHT_CM = 180;
const HUMAN_ASPECT_RATIO = 364 / 1395;
const HANGING_CENTRE_CM = 150;
const LARGE_BOTTOM_EDGE_CM = 120;

type TrackPhase = "idle" | "dragging" | "snapping" | "rebasing";
type GestureAxis = "x" | "y" | null;

function ScaleFigure({
  height,
  left,
  bottom,
}: {
  height: number;
  left: number;
  bottom: number;
}) {
  return (
    <div
      className="human-scale"
      style={{
        height: `${height}px`,
        left: `${left}px`,
        bottom: `${bottom}px`,
      }}
      aria-label="Human scale reference, 180 centimetres"
      role="img"
    >
      <img
        src="/scale-person-180-v3.svg"
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
  imageSrc,
}: {
  work: Artwork;
  position: -1 | 0 | 1;
  centerX: number;
  floorY: number;
  sceneScale: number;
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
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${centerX}px`,
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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const trackPhaseRef = useRef<TrackPhase>("idle");
  const pointerGesture = useRef({
    id: -1,
    axis: null as GestureAxis,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });
  const travelOffsetRef = useRef(0);
  const pendingTravelRef = useRef(0);
  const travelFrameRef = useRef<number | null>(null);
  const wheelMomentum = useRef(0);
  const wheelAxisRef = useRef<GestureAxis>(null);
  const pendingDirectionRef = useRef<-1 | 0 | 1>(0);
  const navigationDistanceRef = useRef({ previous: 0, next: 0 });
  const motionScaleRef = useRef(1);
  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapFrameRef = useRef<number | null>(null);
  const rebaseFrameRef = useRef<number | null>(null);
  const startSnapRef = useRef<(direction: -1 | 0 | 1) => void>(() => {});

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
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      if (travelFrameRef.current !== null) {
        cancelAnimationFrame(travelFrameRef.current);
      }
      if (snapFrameRef.current !== null) {
        cancelAnimationFrame(snapFrameRef.current);
      }
      if (rebaseFrameRef.current !== null) {
        cancelAnimationFrame(rebaseFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") startSnapRef.current(1);
      if (event.key === "ArrowLeft") startSnapRef.current(-1);
      if (event.key === "Home" && trackPhaseRef.current === "idle") setIndex(0);
      if (event.key === "End" && trackPhaseRef.current === "idle") {
        setIndex(artworks.length - 1);
      }
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
  motionScaleRef.current =
    cameraZoom * (typeof window === "undefined" ? 1 : window.devicePixelRatio);
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
  const personWidth = personHeight * HUMAN_ASPECT_RATIO;
  const personScreenHeight = personHeight * cameraZoom;
  const personScreenWidth = personWidth * cameraZoom;
  const desiredPersonScreenLeft =
    viewport.width - Math.max(isMobile ? 72 : 90, personScreenWidth * 0.72);
  const screenFloorY = floorY + cameraPanY;

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
  navigationDistanceRef.current = {
    previous: previousTravel,
    next: nextTravel,
  };

  const updateTravel = (value: number, immediate = false) => {
    const pixelScale = Math.max(1, motionScaleRef.current);
    const stableValue = Math.round(value * pixelScale) / pixelScale;
    travelOffsetRef.current = stableValue;
    pendingTravelRef.current = stableValue;

    const renderTravel = () => {
      trackRef.current?.style.setProperty(
        "--track-x",
        `${pendingTravelRef.current}px`,
      );
    };

    if (immediate) {
      if (travelFrameRef.current !== null) {
        cancelAnimationFrame(travelFrameRef.current);
        travelFrameRef.current = null;
      }
      renderTravel();
      return;
    }

    if (travelFrameRef.current !== null) return;
    travelFrameRef.current = requestAnimationFrame(() => {
      renderTravel();
      travelFrameRef.current = null;
    });
  };

  const setTrackPhase = (phase: TrackPhase) => {
    trackPhaseRef.current = phase;
    if (trackRef.current) trackRef.current.dataset.motion = phase;
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

  const completeSnap = () => {
    if (trackPhaseRef.current !== "snapping") return;
    if (snapTimerRef.current) {
      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }

    const direction = pendingDirectionRef.current;
    pendingDirectionRef.current = 0;
    setTrackPhase("rebasing");

    if (direction !== 0) {
      flushSync(() => {
        setIndex(
          (current) =>
            (current + direction + artworks.length) % artworks.length,
        );
      });
    }
    updateTravel(0, true);

    rebaseFrameRef.current = requestAnimationFrame(() => {
      rebaseFrameRef.current = requestAnimationFrame(() => {
        setTrackPhase("idle");
        rebaseFrameRef.current = null;
      });
    });
  };

  const startSnap = (direction: -1 | 0 | 1) => {
    if (
      trackPhaseRef.current === "snapping" ||
      trackPhaseRef.current === "rebasing"
    ) {
      return;
    }

    if (travelFrameRef.current !== null) {
      cancelAnimationFrame(travelFrameRef.current);
      travelFrameRef.current = null;
      updateTravel(pendingTravelRef.current, true);
    }

    pendingDirectionRef.current = direction;
    setTrackPhase("snapping");
    const distances = navigationDistanceRef.current;
    const target =
      direction === 1
        ? -distances.next
        : direction === -1
          ? distances.previous
          : 0;

    snapFrameRef.current = requestAnimationFrame(() => {
      updateTravel(target, true);
      snapFrameRef.current = null;
      snapTimerRef.current = setTimeout(completeSnap, 620);
    });
  };
  startSnapRef.current = startSnap;

  const settleTrack = (momentum = 0) => {
    const projected = resistedTravel(travelOffsetRef.current + momentum);
    let direction: -1 | 0 | 1 = 0;
    if (projected <= -nextTravel * 0.5) {
      direction = 1;
    } else if (projected >= previousTravel * 0.5) {
      direction = -1;
    }
    pointerGesture.current.axis = null;
    pointerGesture.current.id = -1;
    startSnap(direction);
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
          if (trackPhaseRef.current !== "idle") return;

          pointerGesture.current = {
            id: event.pointerId,
            axis: event.pointerType === "mouse" ? "x" : null,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastTime: event.timeStamp,
            velocity: 0,
          };
          wheelMomentum.current = 0;

          if (event.pointerType === "mouse") {
            setTrackPhase("dragging");
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }}
        onPointerMove={(event) => {
          const gesture = pointerGesture.current;
          if (gesture.id !== event.pointerId) return;

          const screenDeltaX = event.clientX - gesture.startX;
          const screenDeltaY = event.clientY - gesture.startY;

          if (gesture.axis === null) {
            if (Math.max(Math.abs(screenDeltaX), Math.abs(screenDeltaY)) < 6) {
              return;
            }
            if (Math.abs(screenDeltaY) > Math.abs(screenDeltaX) * 1.1) {
              gesture.axis = "y";
              return;
            }
            gesture.axis = "x";
            setTrackPhase("dragging");
            event.currentTarget.setPointerCapture(event.pointerId);
          }

          if (gesture.axis !== "x") return;
          event.preventDefault();
          const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
          gesture.velocity =
            (event.clientX - gesture.lastX) / elapsed / cameraZoom;
          gesture.lastX = event.clientX;
          gesture.lastTime = event.timeStamp;
          const delta = screenDeltaX / cameraZoom;
          updateTravel(resistedTravel(delta));
        }}
        onPointerUp={(event) => {
          const gesture = pointerGesture.current;
          if (gesture.id !== event.pointerId) return;
          if (gesture.axis === "x") {
            settleTrack(gesture.velocity * 90);
          } else {
            gesture.id = -1;
            gesture.axis = null;
            setTrackPhase("idle");
          }
        }}
        onPointerCancel={(event) => {
          if (pointerGesture.current.id !== event.pointerId) return;
          pointerGesture.current.id = -1;
          pointerGesture.current.axis = null;
          if (trackPhaseRef.current === "dragging") startSnap(0);
        }}
        onWheel={(event) => {
          if (
            trackPhaseRef.current === "snapping" ||
            trackPhaseRef.current === "rebasing"
          ) {
            return;
          }

          const deltaModeFactor =
            event.deltaMode === 1
              ? 16
              : event.deltaMode === 2
                ? viewport.width
                : 1;
          const deltaX = event.deltaX * deltaModeFactor;
          const deltaY = event.deltaY * deltaModeFactor;

          if (wheelAxisRef.current === null) {
            const horizontalIntent =
              event.shiftKey ||
              (Math.abs(deltaX) > 0.35 &&
                Math.abs(deltaX) >= Math.abs(deltaY) * 1.05);
            wheelAxisRef.current = horizontalIntent ? "x" : "y";
          }

          if (wheelEndTimer.current) clearTimeout(wheelEndTimer.current);
          if (wheelAxisRef.current === "y") {
            wheelEndTimer.current = setTimeout(() => {
              wheelAxisRef.current = null;
              wheelEndTimer.current = null;
            }, 180);
            return;
          }

          const horizontalDelta = event.shiftKey ? deltaY || deltaX : deltaX;
          if (Math.abs(horizontalDelta) < 0.15) return;
          event.preventDefault();

          if (trackPhaseRef.current === "idle") setTrackPhase("dragging");
          const rawControlledDelta =
            (-horizontalDelta * 0.78) / cameraZoom;
          const controlledDelta = Math.max(
            -42,
            Math.min(42, rawControlledDelta),
          );

          const previousMomentum = wheelMomentum.current;
          if (
            previousMomentum !== 0 &&
            Math.sign(controlledDelta) !== Math.sign(previousMomentum) &&
            Math.abs(controlledDelta) < 1.2
          ) {
            wheelEndTimer.current = setTimeout(() => {
              wheelAxisRef.current = null;
              settleTrack(wheelMomentum.current * 0.65);
              wheelMomentum.current = 0;
              wheelEndTimer.current = null;
            }, 220);
            return;
          }

          wheelMomentum.current =
            previousMomentum * 0.64 + controlledDelta * 0.36;
          updateTravel(
            resistedTravel(travelOffsetRef.current + controlledDelta),
          );
          wheelEndTimer.current = setTimeout(() => {
            wheelAxisRef.current = null;
            settleTrack(wheelMomentum.current * 0.65);
            wheelMomentum.current = 0;
            wheelEndTimer.current = null;
          }, 220);
        }}
      >
        <div className="scene-camera">
          <div className="scene-world">
            <div className="wall-depth" aria-hidden="true" />
            <div className="floor-plane" aria-hidden="true" />

            <div
              ref={trackRef}
              className="gallery-track"
              data-motion="idle"
              onTransitionEnd={(event) => {
                if (
                  event.propertyName === "transform" &&
                  event.currentTarget === event.target
                ) {
                  completeSnap();
                }
              }}
            >
              {galleryWindow.map(({ position, work, centerX }) => (
                <GalleryArtwork
                  key={work.id}
                  work={work}
                  position={position}
                  centerX={centerX}
                  floorY={floorY}
                  sceneScale={sceneScale}
                  imageSrc={work.localImageUrl}
                />
              ))}
            </div>

            <div className="floor-line" aria-hidden="true" />
          </div>
        </div>

        <div className="person-camera">
          <ScaleFigure
            height={personScreenHeight}
            left={desiredPersonScreenLeft}
            bottom={stageHeight - screenFloorY}
          />
        </div>

        <button
          className="gallery-control gallery-control-left"
          type="button"
          aria-label="Previous artwork"
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => {
            event.stopPropagation();
            startSnap(-1);
          }}
          onClick={(event) => {
            if (event.detail === 0) startSnap(-1);
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
            startSnap(1);
          }}
          onClick={(event) => {
            if (event.detail === 0) startSnap(1);
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
