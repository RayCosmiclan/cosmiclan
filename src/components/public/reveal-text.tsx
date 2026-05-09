"use client";

import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type RevealEffect = "words" | "chars" | "kicker";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div" | "strong" | "em";

type RevealTextProps = {
  as?: Tag;
  effect?: RevealEffect;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  /** When true, animates as soon as the element mounts instead of on scroll. */
  immediate?: boolean;
  /** Extra accent class applied to certain words to draw attention. */
  accentWords?: string[];
  children: string;
};

const ACCENT_RX = (words: string[]) =>
  words.length === 0
    ? null
    : new RegExp(
        `^(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})[.,!?:;]?$`,
        "i",
      );

function splitNodes(
  text: string,
  effect: RevealEffect,
  accentWords?: string[],
): ReactNode[] {
  const accentRx = ACCENT_RX(accentWords ?? []);

  if (effect === "chars") {
    const out: ReactNode[] = [];
    let charIdx = 0;
    const words = text.split(/(\s+)/);
    for (const part of words) {
      if (/^\s+$/.test(part)) {
        out.push(part);
        continue;
      }
      out.push(
        <span
          key={`w${charIdx}`}
          className="reveal-char-word"
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            paddingBottom: "0.08em",
            marginBottom: "-0.08em",
          }}
        >
          {[...part].map((c, i) => {
            const node = (
              <span
                key={`${charIdx}-${i}`}
                className="reveal-char"
                style={{
                  display: "inline-block",
                  willChange: "transform, opacity",
                  // No transform here — GSAP fully owns it. Inline transform
                  // values like translateY(110%) compete with GSAP's matrix
                  // and the chars end up stuck off-screen.
                  opacity: 0,
                }}
              >
                {c}
              </span>
            );
            charIdx += 1;
            return node;
          })}
        </span>,
      );
    }
    return out;
  }

  // words / kicker
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (/^\s+$/.test(part)) return part;
    const accent = accentRx ? accentRx.test(part) : false;
    return (
      <span
        key={i}
        className={`reveal-word${accent ? " reveal-word-accent" : ""}`}
        style={{
          display: "inline-block",
          willChange: "transform, opacity, filter",
          // Only opacity is set inline — GSAP owns transform/filter so
          // the from state and animation matrix don't fight inline css.
          opacity: 0,
        }}
      >
        {part}
      </span>
    );
  });
}

export function RevealText({
  as: Tag = "p",
  effect = "words",
  delay = 0,
  className,
  style,
  immediate = false,
  accentWords,
  children,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  const splat = useMemo(
    () => splitNodes(children, effect, accentWords),
    [children, effect, accentWords],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const charTargets = el.querySelectorAll<HTMLElement>(".reveal-char");
    const wordTargets = el.querySelectorAll<HTMLElement>(".reveal-word");

    const run = () => {
      if (reduceMotion) {
        gsap.set(charTargets, { yPercent: 0, opacity: 1 });
        gsap.set(wordTargets, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
        });
        return;
      }
      if (effect === "chars" && charTargets.length > 0) {
        gsap.fromTo(
          charTargets,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.78,
            ease: "power3.out",
            stagger: 0.018,
            delay,
          },
        );
      } else if (wordTargets.length > 0) {
        gsap.fromTo(
          wordTargets,
          {
            y: 10,
            opacity: 0,
            filter: effect === "kicker" ? "blur(0px)" : "blur(6px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: effect === "kicker" ? 0.5 : 0.66,
            ease: "power2.out",
            stagger: effect === "kicker" ? 0.04 : 0.022,
            delay,
          },
        );
      }
    };

    if (immediate) {
      run();
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run();
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, effect, immediate]);

  // Cast required because Tag is dynamic; ref typing through generic JSX is messy.
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      style={style}
    >
      {splat}
    </Tag>
  );
}

/**
 * A short inline highlight: an animated underline-marker draws in beneath
 * the wrapped text once it enters view. Use to emphasize a phrase inside a
 * paragraph that's already animated by RevealText.
 */
export function Highlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.lit = "true";
            if (reduceMotion) el.style.transition = "none";
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className={`reveal-highlight ${className ?? ""}`.trim()}>
      {children}
    </span>
  );
}
