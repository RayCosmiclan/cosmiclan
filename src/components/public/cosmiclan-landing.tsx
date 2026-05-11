"use client";

import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { copyText } from "./copy-text";
import {
  hasSeenCosmiclanPublic,
  markCosmiclanPublicSeen,
} from "./cosmiclan-public-session";
import {
  PRODUCTS,
  WORK_CATEGORIES,
  type WorkCategory,
} from "./cosmiclan-site-data";
import frameStyles from "./cosmiclan-home.module.css";
import wheelStyles from "./cosmiclan-wheel.module.css";

const CONTACT_EMAIL = "gabrielantony56@gmail.com";

/**
 * Splash variant. Flip this to try different intro effects:
 *   "stars"   star + streak hyperspace (the original)
 *   "tunnel"  concentric rings exploding outward from center
 *   "matrix"  vertical streaks raining downward
 *   "grid"    Tron-style perspective grid receding
 *   "pulse"   radial pulse waves from center
 *   "type"    minimal type-only intro, no warp
 */
type SplashVariant = "stars" | "tunnel" | "matrix" | "grid" | "pulse" | "type";
const SPLASH_VARIANT: SplashVariant = "stars";

const SCROLL_SENSITIVITY = 0.0048;
const FALLBACK_REEL_SPACING = 285;
const VERTICAL_REEL_GAP = 12;
const HORIZONTAL_SPACING = 420;
const HORIZONTAL_PROJECT_LIST_ROWS = 9;
const GRID_MIN_SCALE = 0.38;
const GRID_MAX_SCALE = 2.4;
const GRID_ZOOM_SENSITIVITY = 0.0018;
const MIN_SPLASH_MS = 3000;
const AUTO_SKIP_SPLASH =
  typeof navigator !== "undefined" &&
  (navigator as { webdriver?: boolean }).webdriver === true;
const WORK_LAYOUTS = ["Vertical", "Horizontal", "Grid"] as const;
type WorkLayout = (typeof WORK_LAYOUTS)[number];
type ProductWithScreenshot = (typeof PRODUCTS)[number] & {
  screenshot?: string;
  screenshots?: string[];
};
type ReelProduct = (typeof PRODUCTS)[number] & {
  screenshot: string;
};

const REEL_PRODUCTS = PRODUCTS.filter(
  (product): product is ReelProduct =>
    typeof (product as ProductWithScreenshot).screenshot === "string",
);

const PRELOAD_ASSETS = Array.from(
  new Set([
    "/images/brand/cosmiclan-landscape.png",
    "/images/brand/cosmiclan-square-logo.png",
    "/favicon.ico",
    ...PRODUCTS.flatMap((product) => {
      const item = product as ProductWithScreenshot;
      return [item.screenshot, ...(item.screenshots ?? [])].filter(
        (src): src is string => typeof src === "string",
      );
    }),
  ]),
);

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type GridCell = {
  x: number;
  y: number;
  ratio: string;
  width: number;
  label: string;
};

function generateGridCells(count: number, seed = 0x1c0ff33): GridCell[] {
  const rng = mulberry32(seed);
  const ratios = ["16 / 10", "4 / 3", "1 / 1", "3 / 4"];
  const cols = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(count || 1))));
  const rows = Math.ceil((count || 1) / cols);
  const colGap = 460;
  const rowGap = 380;

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ratio = ratios[Math.floor(rng() * ratios.length)];
    const x = (col - (cols - 1) / 2) * colGap + (rng() - 0.5) * 92;
    const y = (row - (rows - 1) / 2) * rowGap + (rng() - 0.5) * 82;

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      ratio,
      width: Math.round(230 + rng() * 170),
      label: String(i + 1).padStart(2, "0"),
    };
  });
}

type GridCamera = {
  x: number;
  y: number;
  scale: number;
};

type GridDragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

const INITIAL_GRID_CAMERA: GridCamera = { x: 0, y: 0, scale: 1 };

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function zoomGridCamera(
  camera: GridCamera,
  rect: DOMRect,
  clientX: number,
  clientY: number,
  deltaY: number,
): GridCamera {
  const nextScale = clampNumber(
    camera.scale * Math.exp(-deltaY * GRID_ZOOM_SENSITIVITY),
    GRID_MIN_SCALE,
    GRID_MAX_SCALE,
  );
  const pointerX = clientX - rect.left - rect.width / 2;
  const pointerY = clientY - rect.top - rect.height / 2;
  const worldX = (pointerX - camera.x) / camera.scale;
  const worldY = (pointerY - camera.y) / camera.scale;

  return {
    x: pointerX - worldX * nextScale,
    y: pointerY - worldY * nextScale,
    scale: nextScale,
  };
}

function makeWrap(length: number) {
  return (index: number) =>
    length > 0 ? ((index % length) + length) % length : 0;
}

function makeCircularOffset(length: number) {
  return (index: number, position: number) => {
    if (length === 0) return 0;
    const wrappedPosition = ((position % length) + length) % length;
    let offset = index - wrappedPosition;
    if (offset > length / 2) offset -= length;
    if (offset < -length / 2) offset += length;
    return offset;
  };
}

function normalizedWheelDelta(event: WheelEvent) {
  const dominantDelta =
    Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return dominantDelta * 16;
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return dominantDelta * window.innerHeight;
  }

  return dominantDelta;
}

type LandingCopy = {
  workLabel: string;
  aboutLabel: string;
  blogsLabel: string;
  contactLabel: string;
  copiedLabel: string;
  intro: string;
  contactPrefix: string;
  projectHint: string;
  layoutLabel: string;
  rightsReserved: string;
  timezone: { label: string; intl: string; tz: string };
};

const DEFAULT_LANDING_COPY: LandingCopy = {
  workLabel: "Work",
  aboutLabel: "About",
  blogsLabel: "Blogs",
  contactLabel: "Contact",
  copiedLabel: "Copied",
  intro:
    "One builder, eight agents, one company. Cosmiclan ships apps, films, design, growth, games, and ops under a single brand — with specialized AI agents fronting every public surface.",
  contactPrefix: "Contact:",
  projectHint: "Scroll the work. Open the selected project.",
  layoutLabel: "Work layout",
  rightsReserved: "All rights reserved. © 2026 Cosmiclan",
  timezone: { label: "IST", intl: "en-IN", tz: "Asia/Kolkata" },
};

const DEFAULT_CATEGORY_LABELS: Record<WorkCategory, string> = {
  All: "All",
  Apps: "Apps",
  Landing: "Landing",
  Videos: "Videos",
  Creators: "Creators",
  Products: "Products",
};

const DEFAULT_LAYOUT_LABELS: Record<string, string> = {
  Vertical: "Vertical",
  Horizontal: "Horizontal",
  Grid: "Grid",
};

export function CosmiclanLanding({
  copy = DEFAULT_LANDING_COPY,
  categoryLabels = DEFAULT_CATEGORY_LABELS,
  layoutLabels = DEFAULT_LAYOUT_LABELS,
  initialShowSplash = true,
  splashVariant,
}: {
  copy?: LandingCopy;
  categoryLabels?: Record<WorkCategory, string>;
  layoutLabels?: Record<string, string>;
  initialShowSplash?: boolean;
  splashVariant?: SplashVariant;
} = {}) {
  const activeSplashVariant: SplashVariant = splashVariant ?? SPLASH_VARIANT;
  const shouldStartWithSplash =
    !AUTO_SKIP_SPLASH &&
    (splashVariant !== undefined ||
      (initialShowSplash && !hasSeenCosmiclanPublic()));
  const rootRef = useRef<HTMLElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetIndexRef = useRef(0);
  const currentIndexRef = useRef(0);
  const snapTimerRef = useRef<number | null>(null);
  const contactTimerRef = useRef<number | null>(null);
  const gridReelRef = useRef<HTMLDivElement>(null);
  const gridDragRef = useRef<GridDragState | null>(null);
  const gridClickSuppressedRef = useRef(false);
  const gridClickTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [layoutMode, setLayoutMode] = useState<WorkLayout>("Vertical");
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);
  const pendingLayoutRef = useRef<WorkLayout | null>(null);
  const layoutTransitionTlRef = useRef<gsap.core.Timeline | null>(null);
  const [gridCamera, setGridCamera] = useState<GridCamera>(INITIAL_GRID_CAMERA);
  const [isGridDragging, setIsGridDragging] = useState(false);
  const [verticalSpacing, setVerticalSpacing] = useState(FALLBACK_REEL_SPACING);
  const [splashProgress, setSplashProgress] = useState(
    shouldStartWithSplash ? 0 : 100,
  );
  const [showSplash, setShowSplash] = useState(shouldStartWithSplash);
  const [splashClosing, setSplashClosing] = useState(false);
  // Always start as "pending" so the stack-and-spread intro replays on every
  // visit to root, including revisits where the splash is suppressed by the
  // session cookie. The intro effect fires immediately when there is no
  // splash, or after the splash exits.
  const [introState, setIntroState] = useState<"pending" | "playing" | "done">(
    "pending",
  );
  const cardRefsMap = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const cardRefCallbacks = useRef<
    Map<string, (el: HTMLAnchorElement | null) => void>
  >(new Map());
  const getCardRef = useCallback((slug: string) => {
    let cb = cardRefCallbacks.current.get(slug);
    if (!cb) {
      cb = (el: HTMLAnchorElement | null) => {
        if (el) {
          cardRefsMap.current.set(slug, el);
        } else {
          cardRefsMap.current.delete(slug);
        }
      };
      cardRefCallbacks.current.set(slug, cb);
    }
    return cb;
  }, []);

  const [timeLabel, setTimeLabel] = useState(`${copy.timezone.label} --:--:--`);
  const [contactCopied, setContactCopied] = useState(false);
  const [hoveredGridCell, setHoveredGridCell] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<WorkCategory>("All");

  const filteredReel = useMemo(
    () =>
      categoryFilter === "All"
        ? REEL_PRODUCTS
        : REEL_PRODUCTS.filter((p) => p.category === categoryFilter),
    [categoryFilter],
  );
  const reelLength = filteredReel.length;
  const wrapProject = useMemo(() => makeWrap(reelLength), [reelLength]);
  const circularOffset = useMemo(
    () => makeCircularOffset(reelLength),
    [reelLength],
  );
  const gridCells = useMemo(
    () => generateGridCells(filteredReel.length),
    [filteredReel.length],
  );

  const availableCategories = useMemo(() => {
    const present = new Set(REEL_PRODUCTS.map((p) => p.category));
    return WORK_CATEGORIES.filter((cat) => cat === "All" || present.has(cat));
  }, []);

  const activeProduct =
    filteredReel[activeIndex] ?? filteredReel[0] ?? PRODUCTS[0];
  const hoveredGridProduct =
    layoutMode === "Grid" && hoveredGridCell !== null
      ? (filteredReel[hoveredGridCell] ?? null)
      : null;
  const highlightedSlug = hoveredGridProduct?.slug ?? activeProduct?.slug;
  const highlightedIndex = Math.max(
    0,
    filteredReel.findIndex((p) => p.slug === highlightedSlug),
  );
  const wrappedScrollPosition =
    layoutMode === "Horizontal"
      ? wrapProject(scrollPosition)
      : highlightedIndex;
  const horizontalListCenter = Math.round(wrappedScrollPosition);
  const horizontalListDelta = wrappedScrollPosition - horizontalListCenter;
  const horizontalProjectRows = useMemo(() => {
    if (layoutMode !== "Horizontal" || reelLength === 0) return [];

    const rowCount = Math.min(reelLength, HORIZONTAL_PROJECT_LIST_ROWS);
    const midpoint = Math.floor(rowCount / 2);

    return Array.from({ length: rowCount }, (_, rowIndex) => {
      const relativeIndex = rowIndex - midpoint;
      const productIndex = wrapProject(horizontalListCenter + relativeIndex);
      return {
        product: filteredReel[productIndex],
        productIndex,
        rowOffset: relativeIndex - horizontalListDelta,
      };
    }).filter((row) => row.product);
  }, [
    filteredReel,
    horizontalListCenter,
    horizontalListDelta,
    layoutMode,
    reelLength,
    wrapProject,
  ]);
  const gridViewportStyle =
    layoutMode === "Grid"
      ? ({
          "--grid-x": `${gridCamera.x}px`,
          "--grid-y": `${gridCamera.y}px`,
          "--grid-dot-size": `${Math.max(16, 54 * gridCamera.scale)}px`,
          "--grid-line-size": `${Math.max(96, 270 * gridCamera.scale)}px`,
        } as CSSProperties)
      : undefined;
  const splashStyle = {
    "--star-opacity": String(Math.max(0.34, 0.92 - splashProgress / 180)),
    "--streak-opacity": String(Math.min(0.88, 0.22 + splashProgress / 120)),
    "--streak-scale": String(0.92 + (splashProgress / 100) * 1.95),
    "--warp-duration": `${Math.max(380, 1800 - splashProgress * 13)}ms`,
    "--progress-width": `${splashProgress}%`,
  } as CSSProperties;

  useEffect(() => {
    if (introState !== "done") return;
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-boot]",
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: reduceMotion ? 0.01 : 0.78,
          ease: "power3.out",
          stagger: 0.055,
        },
      );
    }, root);

    return () => ctx.revert();
  }, [introState]);

  useEffect(() => {
    if (showSplash) return;
    if (introState !== "pending") return;

    if (layoutMode !== "Vertical") {
      setIntroState("done");
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      setIntroState("done");
      return;
    }

    const orderedCards: HTMLAnchorElement[] = [];
    filteredReel.forEach((product) => {
      const el = cardRefsMap.current.get(product.slug);
      if (el) orderedCards.push(el);
    });

    if (orderedCards.length === 0) {
      setIntroState("done");
      return;
    }

    targetIndexRef.current = 0;
    currentIndexRef.current = 0;
    setScrollPosition(0);
    setActiveIndex(0);

    setIntroState("playing");

    // Light stack offsets — photos placed carefully on top of each other
    const stackOffsets = orderedCards.map(() => ({
      x: (Math.random() - 0.5) * 32,
      y: (Math.random() - 0.5) * 20,
      rotation: (Math.random() - 0.5) * 5,
      scale: 0.97 + Math.random() * 0.03,
    }));

    gsap.set(orderedCards, {
      xPercent: -50,
      yPercent: -50,
      x: (i: number) => stackOffsets[i]?.x ?? 0,
      y: (i: number) => (stackOffsets[i]?.y ?? 0) - 18,
      scale: (i: number) => (stackOffsets[i]?.scale ?? 1) + 0.02,
      rotation: (i: number) => stackOffsets[i]?.rotation ?? 0,
      opacity: 0,
    });

    const finalStates = filteredReel.map((_, idx) => {
      const offset = circularOffset(idx, 0);
      const distance = Math.abs(offset);
      const visible = distance <= 2.4;
      return {
        y: offset * verticalSpacing,
        opacity: visible ? Math.max(0, 1 - distance * 0.24) : 0,
      };
    });

    const tl = gsap.timeline({
      onComplete: () => setIntroState("done"),
    });

    // Ease-out drop into the stack
    tl.to(orderedCards, {
      opacity: 1,
      y: (i: number) => stackOffsets[i]?.y ?? 0,
      scale: (i: number) => stackOffsets[i]?.scale ?? 1,
      duration: 0.5,
      stagger: 0.06,
      ease: "power3.out",
    });

    tl.addLabel("spread", "+=0.35");

    tl.to(
      orderedCards,
      {
        x: 0,
        y: (i: number) => finalStates[i]?.y ?? 0,
        rotation: 0,
        scale: 1,
        opacity: (i: number) => finalStates[i]?.opacity ?? 0,
        duration: 0.9,
        ease: "power3.inOut",
        stagger: 0.025,
      },
      "spread",
    );

    introTimelineRef.current = tl;
    // Intentionally only depend on showSplash. Adding introState here would
    // make setIntroState("playing") re-fire this effect and the cleanup would
    // immediately kill the timeline we just created. layoutMode/filteredReel
    // are captured via closure at the moment the splash exits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSplash]);

  useEffect(() => {
    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      layoutTransitionTlRef.current?.kill();
      layoutTransitionTlRef.current = null;
    };
  }, []);

  // Animate cards in after a layout mode change
  useEffect(() => {
    if (!isLayoutTransitioning) return;
    if (pendingLayoutRef.current !== layoutMode) return;

    pendingLayoutRef.current = null;

    const raf = requestAnimationFrame(() => {
      const reel = gridReelRef.current;
      const cards = reel
        ? Array.from(reel.querySelectorAll<HTMLElement>(".reelCard"))
        : [];

      if (cards.length === 0) {
        setIsLayoutTransitioning(false);
        return;
      }

      gsap.set(cards, { opacity: 0, scale: 0.96 });

      const tl = gsap.timeline({
        onComplete: () => setIsLayoutTransitioning(false),
      });

      tl.to(cards, {
        opacity: (i, el) => parseFloat((el as HTMLElement).style.opacity) || 1,
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.025,
      });

      layoutTransitionTlRef.current = tl;
    });

    return () => cancelAnimationFrame(raf);
  }, [layoutMode, isLayoutTransitioning]);

  useEffect(() => {
    markCosmiclanPublicSeen();
    if (!showSplash) {
      return;
    }

    let cancelled = false;
    let animationFrame = 0;
    let closeTimer = 0;
    let loadedTasks = 0;
    let allLoaded = false;
    const startedAt = performance.now();

    const markLoaded = () => {
      loadedTasks += 1;
    };

    const imageTasks = PRELOAD_ASSETS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.decoding = "async";
          img.onload = () => {
            markLoaded();
            resolve();
          };
          img.onerror = () => {
            markLoaded();
            resolve();
          };
          img.src = src;
        }),
    );

    const fontTask =
      document.fonts?.ready.then(() => {
        markLoaded();
      }) ??
      Promise.resolve().then(() => {
        markLoaded();
      });

    const totalTasks = imageTasks.length + 1;

    Promise.all([...imageTasks, fontTask]).then(() => {
      allLoaded = true;
    });

    const tick = () => {
      if (cancelled) return;

      const elapsed = performance.now() - startedAt;
      const timeProgress = Math.min(elapsed / MIN_SPLASH_MS, 1);
      const assetProgress = Math.min(loadedTasks / totalTasks, 1);
      const progress =
        allLoaded && elapsed >= MIN_SPLASH_MS
          ? 100
          : Math.min(
              99,
              Math.floor(Math.min(timeProgress, assetProgress) * 100),
            );

      setSplashProgress(progress);

      if (progress >= 100) {
        setSplashClosing(true);
        closeTimer = window.setTimeout(() => {
          if (!cancelled) {
            setShowSplash(false);
          }
        }, 320);
        return;
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }
    };
  }, [showSplash]);

  useEffect(() => {
    const animate = () => {
      if (
        reelLength > 0 &&
        Math.abs(targetIndexRef.current) > reelLength * 500
      ) {
        targetIndexRef.current = wrapProject(targetIndexRef.current);
        currentIndexRef.current = wrapProject(currentIndexRef.current);
      }

      const target = targetIndexRef.current;
      const current = currentIndexRef.current;
      const next =
        Math.abs(target - current) < 0.001
          ? target
          : current + (target - current) * 0.11;

      currentIndexRef.current = next;
      setScrollPosition(next);
      setActiveIndex(wrapProject(Math.round(next)));
      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
      }
    };
  }, [reelLength, wrapProject]);

  useEffect(() => {
    const updateVerticalSpacing = () => {
      const cardWidth = Math.min(460, Math.max(280, window.innerWidth * 0.23));
      const cardHeight = cardWidth * 0.625;
      setVerticalSpacing(Math.round(cardHeight + VERTICAL_REEL_GAP));
    };

    updateVerticalSpacing();
    window.addEventListener("resize", updateVerticalSpacing);

    return () => {
      window.removeEventListener("resize", updateVerticalSpacing);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleNativeWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (layoutMode === "Grid") {
        if (event.ctrlKey || event.metaKey || event.altKey) {
          const rect = root.getBoundingClientRect();
          setGridCamera((camera) =>
            zoomGridCamera(
              camera,
              rect,
              event.clientX,
              event.clientY,
              event.deltaY,
            ),
          );
          return;
        }

        setGridCamera((camera) => ({
          ...camera,
          x: camera.x - event.deltaX,
          y: camera.y - event.deltaY,
        }));
        return;
      }

      const delta = normalizedWheelDelta(event);
      if (Math.abs(delta) < 1) return;

      targetIndexRef.current += delta * SCROLL_SENSITIVITY;
      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
      }
      snapTimerRef.current = window.setTimeout(() => {
        targetIndexRef.current = Math.round(targetIndexRef.current);
      }, 110);
    };

    root.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      root.removeEventListener("wheel", handleNativeWheel);
    };
  }, [layoutMode]);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(copy.timezone.intl, {
      timeZone: copy.timezone.tz,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const tick = () =>
      setTimeLabel(`${copy.timezone.label} ${formatter.format(new Date())}`);
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(timer);
      if (contactTimerRef.current) {
        window.clearTimeout(contactTimerRef.current);
      }
      if (gridClickTimerRef.current) {
        window.clearTimeout(gridClickTimerRef.current);
      }
    };
  }, [copy.timezone.intl, copy.timezone.label, copy.timezone.tz]);

  function moveBy(step: number, shouldSnap = true) {
    targetIndexRef.current += step;
    if (shouldSnap) {
      targetIndexRef.current = Math.round(targetIndexRef.current);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (layoutMode === "Grid") {
      const panStep = event.shiftKey ? 180 : 82;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setGridCamera((camera) => ({ ...camera, x: camera.x - panStep }));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setGridCamera((camera) => ({ ...camera, x: camera.x + panStep }));
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setGridCamera((camera) => ({ ...camera, y: camera.y - panStep }));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setGridCamera((camera) => ({ ...camera, y: camera.y + panStep }));
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setGridCamera((camera) => ({
          ...camera,
          scale: clampNumber(
            camera.scale * 1.12,
            GRID_MIN_SCALE,
            GRID_MAX_SCALE,
          ),
        }));
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setGridCamera((camera) => ({
          ...camera,
          scale: clampNumber(
            camera.scale / 1.12,
            GRID_MIN_SCALE,
            GRID_MAX_SCALE,
          ),
        }));
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
    }
  }

  function resetReelPosition() {
    targetIndexRef.current = 0;
    currentIndexRef.current = 0;
    setScrollPosition(0);
    setActiveIndex(0);
    setGridCamera(INITIAL_GRID_CAMERA);
    setIsGridDragging(false);
    gridDragRef.current = null;
    setHoveredGridCell(null);
  }

  function selectCategory(cat: WorkCategory) {
    if (cat === categoryFilter) return;
    resetReelPosition();
    setCategoryFilter(cat);
  }

  function selectLayout(mode: WorkLayout) {
    if (mode === layoutMode || isLayoutTransitioning) return;

    const reel = gridReelRef.current;
    const cards = reel
      ? Array.from(reel.querySelectorAll<HTMLElement>(".reelCard"))
      : [];

    if (cards.length === 0 || introState !== "done") {
      setLayoutMode(mode);
      if (mode !== "Grid") {
        setHoveredGridCell(null);
        setIsGridDragging(false);
        gridDragRef.current = null;
      }
      return;
    }

    pendingLayoutRef.current = mode;
    setIsLayoutTransitioning(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setLayoutMode(mode);
        if (mode !== "Grid") {
          setHoveredGridCell(null);
          setIsGridDragging(false);
          gridDragRef.current = null;
        }
      },
    });

    tl.to(cards, {
      opacity: 0,
      scale: 0.96,
      duration: 0.22,
      ease: "power2.in",
      stagger: 0.015,
    });

    layoutTransitionTlRef.current = tl;
  }

  function handleGridPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (layoutMode !== "Grid") return;
    if (event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    gridDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: gridCamera.x,
      originY: gridCamera.y,
      moved: false,
    };
  }

  function handleGridPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = gridDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(deltaX, deltaY) > 4) {
      drag.moved = true;
      setIsGridDragging(true);
    }
    if (!drag.moved) return;

    event.preventDefault();
    setGridCamera((camera) => ({
      ...camera,
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    }));
  }

  function finishGridPointer(event: PointerEvent<HTMLDivElement>) {
    const drag = gridDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    gridDragRef.current = null;
    setIsGridDragging(false);

    if (drag.moved) {
      gridClickSuppressedRef.current = true;
      if (gridClickTimerRef.current) {
        window.clearTimeout(gridClickTimerRef.current);
      }
      gridClickTimerRef.current = window.setTimeout(() => {
        gridClickSuppressedRef.current = false;
      }, 0);
    }
  }

  function handleGridCardClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!gridClickSuppressedRef.current) return;
    event.preventDefault();
  }

  async function copyContact() {
    try {
      await copyText(CONTACT_EMAIL);
    } finally {
      setContactCopied(true);
      if (contactTimerRef.current) {
        window.clearTimeout(contactTimerRef.current);
      }
      contactTimerRef.current = window.setTimeout(() => {
        setContactCopied(false);
      }, 1800);
    }
  }

  return (
    <main
      ref={rootRef}
      className={frameStyles.site}
      data-layout={layoutMode.toLowerCase()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Cosmiclan project wheel"
    >
      {showSplash ? (
        <section
          className={frameStyles.splash}
          data-exiting={splashClosing}
          data-variant={activeSplashVariant}
          style={splashStyle}
          aria-label="Loading Cosmiclan"
          aria-live="polite"
        >
          <div className={frameStyles.splashField} />
          {activeSplashVariant === "type" ? (
            <div className={frameStyles.splashType} aria-hidden="true">
              COSMICLAN
            </div>
          ) : null}
          <div className={frameStyles.splashCounter}>
            <span>{String(splashProgress).padStart(3, "0")}</span>
            <small>/100</small>
          </div>
          <button
            type="button"
            className={frameStyles.splashSkip}
            onClick={() => {
              setSplashProgress(100);
              setSplashClosing(true);
              window.setTimeout(() => {
                setShowSplash(false);
              }, 320);
            }}
            aria-label="Skip loading animation"
          >
            Skip
          </button>
        </section>
      ) : null}

      <div className={frameStyles.ambientField} aria-hidden="true" />

      <nav
        data-boot
        className={frameStyles.nav}
        aria-label="Cosmiclan navigation"
      >
        <div className={frameStyles.navGroup}>
          <Link
            href="/"
            aria-current="page"
            className={frameStyles.activeNavLink}
          >
            {copy.workLabel}
          </Link>
          <Link href="/about">{copy.aboutLabel}</Link>
          <Link href="/blogs">{copy.blogsLabel}</Link>
        </div>
        <span className={frameStyles.navCenter} suppressHydrationWarning>
          {timeLabel}
        </span>
        <button
          type="button"
          className={frameStyles.contactButton}
          onClick={copyContact}
        >
          {contactCopied ? copy.copiedLabel : copy.contactLabel}
        </button>
      </nav>

      {layoutMode === "Grid" ? null : (
        <aside data-boot className={frameStyles.rightIntro}>
          <p>{copy.intro}</p>
          <p>
            {copy.contactPrefix}
            <br />
            <button type="button" onClick={copyContact}>
              {CONTACT_EMAIL}
            </button>
          </p>
        </aside>
      )}

      <header data-boot className={frameStyles.brandBlock}>
        <div className={frameStyles.logoFrame}>
          <Image
            src="/images/brand/cosmiclan-landscape.png?v=transparent"
            alt="Cosmiclan"
            fill
            priority
            unoptimized
            sizes="430px"
            className={frameStyles.logoImage}
          />
        </div>
      </header>

      <aside
        data-boot
        className={frameStyles.projectList}
        aria-label="Projects"
        style={
          {
            "--list-offset": highlightedIndex,
          } as CSSProperties
        }
      >
        <div className={frameStyles.projectListTrack}>
          {layoutMode === "Horizontal"
            ? horizontalProjectRows.map(
                ({ product, productIndex, rowOffset }) => (
                  <Link
                    key={`${product.slug}-${productIndex}`}
                    href={`/work/${product.slug}`}
                    data-active={highlightedSlug === product.slug}
                    data-index={productIndex}
                    style={
                      {
                        "--row-offset": rowOffset,
                      } as CSSProperties
                    }
                  >
                    {product.name}
                  </Link>
                ),
              )
            : filteredReel.map((product, index) => (
                <Link
                  key={product.name}
                  href={`/work/${product.slug}`}
                  data-active={highlightedSlug === product.slug}
                  data-index={index}
                >
                  {product.name}
                </Link>
              ))}
        </div>
        <span className={frameStyles.horizontalActiveName}>
          {activeProduct.name}
        </span>
      </aside>

      <section className={wheelStyles.stage} aria-label="Selected project">
        <div
          ref={gridReelRef}
          className={wheelStyles.reel}
          data-mode={layoutMode.toLowerCase()}
          data-transitioning={isLayoutTransitioning}
          data-dragging={layoutMode === "Grid" ? isGridDragging : undefined}
          aria-label="Infinite work reel"
          style={gridViewportStyle}
          onPointerDown={
            layoutMode === "Grid" ? handleGridPointerDown : undefined
          }
          onPointerMove={
            layoutMode === "Grid" ? handleGridPointerMove : undefined
          }
          onPointerUp={layoutMode === "Grid" ? finishGridPointer : undefined}
          onPointerCancel={
            layoutMode === "Grid" ? finishGridPointer : undefined
          }
        >
          {layoutMode === "Grid"
            ? gridCells.map((cell, cellIndex) => {
                const product = filteredReel[cellIndex];
                if (!product) return null;
                const isHovered = hoveredGridCell === cellIndex;
                const isDimmed = hoveredGridCell !== null && !isHovered;
                const cardX = gridCamera.x + cell.x * gridCamera.scale;
                const cardY = gridCamera.y + cell.y * gridCamera.scale;

                return (
                  <Link
                    key={`${product.slug}-${cellIndex}`}
                    href={`/work/${product.slug}`}
                    className={wheelStyles.reelCard}
                    data-mode="grid"
                    data-active={isHovered}
                    data-dimmed={isDimmed}
                    onMouseEnter={() => setHoveredGridCell(cellIndex)}
                    onMouseLeave={() =>
                      setHoveredGridCell((current) =>
                        current === cellIndex ? null : current,
                      )
                    }
                    onFocus={() => setHoveredGridCell(cellIndex)}
                    onBlur={() =>
                      setHoveredGridCell((current) =>
                        current === cellIndex ? null : current,
                      )
                    }
                    onClick={handleGridCardClick}
                    style={
                      {
                        width: `${cell.width}px`,
                        aspectRatio: cell.ratio,
                        transform: `translate3d(calc(-50% + ${cardX}px), calc(-50% + ${cardY}px), 0) scale(${gridCamera.scale})`,
                        zIndex: isHovered ? 22 : 5,
                      } as CSSProperties
                    }
                  >
                    <span
                      className={wheelStyles.reelCardLabel}
                      aria-hidden="true"
                    >
                      {cell.label}
                    </span>
                    <Image
                      src={product.screenshot}
                      alt=""
                      fill
                      unoptimized
                      sizes="240px"
                      className={wheelStyles.reelImage}
                    />
                  </Link>
                );
              })
            : filteredReel.map((product, index) => {
                const offset = circularOffset(index, scrollPosition);
                const distance = Math.abs(offset);
                const isHorizontal = layoutMode === "Horizontal";
                const scale = isHorizontal
                  ? Math.max(0.74, 1 - distance * 0.07)
                  : 1;
                const opacity = isHorizontal
                  ? Math.max(0.12, 1 - distance * 0.22)
                  : Math.max(0, 1 - distance * 0.24);
                const x = isHorizontal ? offset * HORIZONTAL_SPACING : 0;
                const y = isHorizontal ? 0 : offset * verticalSpacing;

                const introOwnsCards =
                  layoutMode === "Vertical" && introState !== "done";

                if (!introOwnsCards && distance > (isHorizontal ? 4.5 : 2.4))
                  return null;

                const cardStyle: CSSProperties = introOwnsCards
                  ? {
                      opacity: 0,
                      zIndex: index,
                    }
                  : {
                      opacity,
                      transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`,
                      zIndex: 20 - distance,
                    };

                return (
                  <Link
                    key={product.slug}
                    ref={getCardRef(product.slug)}
                    href={`/work/${product.slug}`}
                    className={wheelStyles.reelCard}
                    data-mode={layoutMode.toLowerCase()}
                    data-active={Math.abs(offset) < 0.1}
                    data-index={index}
                    style={cardStyle}
                  >
                    <Image
                      src={product.screenshot}
                      alt=""
                      fill
                      priority={distance < 0.1}
                      unoptimized
                      sizes="(max-width: 920px) 142px, 226px"
                      className={wheelStyles.reelImage}
                    />
                  </Link>
                );
              })}
        </div>

        {layoutMode !== "Grid" ? (
          <div data-boot className={wheelStyles.projectMeta}>
            {layoutMode === "Vertical" ? (
              <>
                <span>{activeProduct.type}</span>
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
              </>
            ) : (
              <>
                <span>{String(activeIndex + 1).padStart(2, "0")}</span>
                <span>{activeProduct.type}</span>
              </>
            )}
          </div>
        ) : null}

        {layoutMode === "Grid" ? (
          <div
            className={wheelStyles.gridTitle}
            data-visible={hoveredGridProduct !== null}
            aria-hidden={hoveredGridProduct === null}
          >
            <span className={wheelStyles.gridTitleType}>
              {hoveredGridProduct?.type ?? ""}
            </span>
            <span className={wheelStyles.gridTitleName}>
              {hoveredGridProduct?.name ?? ""}
            </span>
          </div>
        ) : null}
      </section>

      {layoutMode !== "Grid" ? (
        <nav
          data-boot
          className={frameStyles.categoryFilter}
          aria-label="Filter work by category"
        >
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              data-active={categoryFilter === cat}
              onClick={() => selectCategory(cat)}
            >
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </nav>
      ) : null}

      <footer data-boot className={frameStyles.footerLine}>
        <div className={frameStyles.layoutSwitch} aria-label={copy.layoutLabel}>
          {WORK_LAYOUTS.map((mode) => (
            <button
              key={mode}
              type="button"
              data-active={layoutMode === mode}
              onClick={() => selectLayout(mode)}
            >
              {layoutLabels[mode] ?? mode}
            </button>
          ))}
        </div>
        <span>{copy.rightsReserved}</span>
      </footer>
    </main>
  );
}
