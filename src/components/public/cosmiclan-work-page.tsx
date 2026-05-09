"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { copyText } from "./copy-text";
import { markCosmiclanPublicSeen } from "./cosmiclan-public-session";
import type { Product } from "./cosmiclan-site-data";
import styles from "./cosmiclan-work.module.css";

gsap.registerPlugin(ScrollTrigger);

const CONTACT_EMAIL = "gabrielantony56@gmail.com";

type ProductWithMedia = Product & {
  screenshot?: string;
  screenshots?: string[];
  video?: string;
  poster?: string;
};

function getParallaxSpeed(index: number): number {
  const speeds = [1.0, 1.12, 0.88, 1.06, 0.94, 1.18, 0.82, 1.08];
  return speeds[index % speeds.length];
}

function buildScreenStack(screenshots: string[]): string[] {
  if (screenshots.length === 0) return [];
  const minImages = 10;
  const result: string[] = [];
  while (result.length < minImages) {
    result.push(...screenshots);
  }
  return result;
}

export function CosmiclanWorkPage({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const contactTimerRef = useRef<number | null>(null);
  const [timeLabel, setTimeLabel] = useState("");
  const [contactCopied, setContactCopied] = useState(false);
  const mediaProduct = product as ProductWithMedia;
  const videoSrc = mediaProduct.video;
  const videoPoster = mediaProduct.poster ?? mediaProduct.screenshot;
  const screenshots = useMemo(
    () =>
      mediaProduct.screenshots ??
      (mediaProduct.screenshot ? [mediaProduct.screenshot] : []),
    [mediaProduct.screenshots, mediaProduct.screenshot],
  );
  const screenStack = useMemo(
    () => buildScreenStack(screenshots),
    [screenshots],
  );

  const pageRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const screensRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    markCosmiclanPublicSeen();

    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const tick = () => setTimeLabel(`IST ${formatter.format(new Date())}`);
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(timer);
      if (contactTimerRef.current) {
        window.clearTimeout(contactTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalHtmlHeight = html.style.height;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyHeight = body.style.height;

    html.style.overflow = "visible";
    html.style.height = "auto";
    body.style.overflow = "visible";
    body.style.height = "auto";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      html.style.height = originalHtmlHeight;
      body.style.overflow = originalBodyOverflow;
      body.style.height = originalBodyHeight;
    };
  }, []);

  useEffect(() => {
    if (!pageRef.current || !railRef.current || !stackRef.current) return;
    if (screenStack.length === 0) return;
    if (typeof window !== "undefined" && window.innerWidth <= 920) return;

    const pageEl = pageRef.current;
    const railEl = railRef.current;
    const stackEl = stackRef.current;

    let lenis: Lenis | null = null;
    let ctx: gsap.Context | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    function updateSpacerHeight() {
      if (!spacerRef.current || !stackEl || !railEl) return;
      const stackHeight = stackEl.scrollHeight;
      const railHeight = railEl.clientHeight;
      const scrollDistance = Math.max(
        stackHeight - railHeight + 120,
        stackHeight * 0.6,
      );
      spacerRef.current.style.height = `${scrollDistance + window.innerHeight}px`;
      return scrollDistance;
    }

    function initScrollEffects() {
      if (ctx) {
        ctx.revert();
        ctx = null;
      }
      ScrollTrigger.getAll().forEach((st) => st.kill());

      if (tickerCallback && lenis) {
        gsap.ticker.remove(tickerCallback);
      }

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });

      lenis.on("scroll", ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);

      const scrollDistance = updateSpacerHeight();
      if (!scrollDistance) return;

      ctx = gsap.context(() => {
        gsap.to(stackEl, {
          y: () => -(stackEl.scrollHeight - railEl.clientHeight + 40),
          ease: "none",
          scrollTrigger: {
            trigger: pageEl,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });

        const screenEls = screensRef.current.filter(Boolean) as HTMLElement[];
        screenEls.forEach((screenEl, i) => {
          const speed = getParallaxSpeed(i);
          const direction = i % 2 === 0 ? 1 : -1;
          const offset = 35 * speed * direction;

          gsap.to(screenEl, {
            y: offset,
            ease: "none",
            scrollTrigger: {
              trigger: pageEl,
              start: "top top",
              end: () => `+=${scrollDistance}`,
              scrub: 1.4 + i * 0.05,
              invalidateOnRefresh: true,
            },
          });
        });
      }, pageEl);

      return () => {
        ctx?.revert();
        if (tickerCallback) {
          gsap.ticker.remove(tickerCallback);
        }
        lenis?.destroy();
      };
    }

    initScrollEffects();

    resizeObserver = new ResizeObserver(() => {
      updateSpacerHeight();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(stackEl);
    resizeObserver.observe(railEl);

    return () => {
      ctx?.revert();
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      lenis?.destroy();
      resizeObserver?.disconnect();
    };
  }, [screenStack.length]);

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
    <main className={styles.workPage} ref={pageRef}>
      <nav className={styles.nav} aria-label="Cosmiclan navigation">
        <div className={styles.navGroup}>
          <Link href="/">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/blogs">Blogs</Link>
        </div>
        <span className={styles.navCenter} suppressHydrationWarning>
          {timeLabel}
        </span>
        <button
          type="button"
          className={styles.contactButton}
          onClick={copyContact}
        >
          {contactCopied ? "Copied" : "Contact"}
        </button>
      </nav>

      <Link
        href="/"
        className={styles.mark}
        aria-label="Back to Cosmiclan work"
      >
        <Image
          src="/images/brand/cosmiclan-square-logo.png?v=transparent"
          alt="Cosmiclan"
          fill
          priority
          unoptimized
          sizes="92px"
        />
      </Link>

      <article className={styles.projectCopy}>
        <span>
          {String(index + 1).padStart(2, "0")} / {product.type}
        </span>
        <h1>{product.name}</h1>
        <p>{product.text}</p>
      </article>

      {videoSrc ? (
        <section
          className={styles.screenRail}
          ref={railRef}
          aria-label={`${product.name} film`}
        >
          <video
            className={styles.filmPlayer}
            controls
            playsInline
            preload="metadata"
            poster={videoPoster}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </section>
      ) : screenStack.length > 0 ? (
        <section
          className={styles.screenRail}
          ref={railRef}
          aria-label={`${product.name} screens`}
        >
          <div className={styles.screenStack} ref={stackRef}>
            {screenStack.map((screenshot, screenIndex) => (
              <figure
                className={styles.screen}
                key={`${screenshot}-${screenIndex}`}
                ref={(el) => {
                  screensRef.current[screenIndex] = el;
                }}
                style={{ willChange: "transform" }}
              >
                <Image
                  src={screenshot}
                  alt=""
                  fill
                  priority={screenIndex === 0}
                  loading={screenIndex === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 920px) 122vw, 62vw"
                />
              </figure>
            ))}
          </div>
        </section>
      ) : (
        <section className={styles.pending}>
          <span>Product source pending</span>
        </section>
      )}

      <div className={styles.scrollSpacer} ref={spacerRef} aria-hidden="true" />

      <footer className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          Back
        </Link>
        <span>All rights reserved. © 2026 Cosmiclan</span>
      </footer>
    </main>
  );
}
