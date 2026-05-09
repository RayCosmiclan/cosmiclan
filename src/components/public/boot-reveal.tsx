"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

/**
 * Mounts inside a page section and fades in every descendant marked with
 * `data-boot` using the same staggered animation as the landing page.
 * Place it as a sibling of the elements you want revealed; it scopes the
 * selector to its parent so unrelated subtrees aren't touched.
 */
export function BootReveal() {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const root = anchor.parentElement ?? document.body;
    const targets = root.querySelectorAll("[data-boot]");
    if (targets.length === 0) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
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
  }, []);

  return <span ref={anchorRef} aria-hidden="true" hidden />;
}
