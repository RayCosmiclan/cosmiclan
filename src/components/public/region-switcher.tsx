"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { LocaleKey } from "./cosmiclan-site-data";
import styles from "./region-switcher.module.css";

type Region = { key: LocaleKey; label: string; hint: string };

// Order top→bottom in the upward-opening menu.
const REGIONS: Region[] = [
  { key: "default", label: "Global", hint: "EN" },
  { key: "eu", label: "Europe", hint: "EN" },
  { key: "id", label: "Indonesia", hint: "ID" },
  { key: "ar", label: "العربية", hint: "AR" },
];

const HTML_LANG: Record<LocaleKey, string> = {
  default: "en",
  eu: "en",
  id: "id",
  ar: "ar",
};

export function RegionSwitcher({
  locale,
  rightsText,
}: {
  locale: LocaleKey;
  rightsText: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const current = REGIONS.find((r) => r.key === locale) ?? REGIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(key: LocaleKey) {
    setOpen(false);
    if (key === locale) return;
    document.cookie = `cosmiclan-locale=${key}; path=/; max-age=31536000; samesite=lax`;
    // Apply direction/lang instantly so RTL switches without waiting on refresh.
    document.documentElement.lang = HTML_LANG[key];
    document.documentElement.dir = key === "ar" ? "rtl" : "ltr";
    // Re-render server components (page copy) with the new locale cookie.
    router.refresh();
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <span className={styles.rights}>{rightsText}</span>
      <span className={styles.sep} aria-hidden="true">
        ·
      </span>
      <button
        type="button"
        className={styles.trigger}
        data-open={open}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose region"
      >
        {current.label}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            className={styles.menu}
            role="listbox"
            aria-label="Region"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              show: {
                transition: { staggerChildren: 0.045, staggerDirection: -1 },
              },
              hidden: {
                transition: { staggerChildren: 0.03, staggerDirection: 1 },
              },
            }}
          >
            {REGIONS.map((r) => (
              <motion.li
                key={r.key}
                role="option"
                aria-selected={r.key === locale}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  data-active={r.key === locale}
                  onClick={() => choose(r.key)}
                >
                  <span className={styles.label}>{r.label}</span>
                  <span className={styles.hint}>{r.hint}</span>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
