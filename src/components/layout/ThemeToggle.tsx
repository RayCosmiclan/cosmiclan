"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="flex items-center gap-2">
      {(["light", "dark", "system"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            theme === t
              ? "bg-[var(--surface-3)] text-[var(--foreground)]"
              : "text-[var(--muted-fg)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
          }`}
        >
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
