"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ITEMS = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/connections", label: "Connected channels" },
  { href: "/settings/autonomy", label: "Autonomy rules" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/appearance", label: "Appearance" },
  { href: "/settings/clan", label: "Clan" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full">
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface-2)] p-3">
        <div className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Settings
        </div>
        <nav className="flex flex-col gap-1">
          {ITEMS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                pathname === i.href
                  ? "bg-[var(--surface-3)] text-[var(--foreground)]"
                  : "text-[var(--muted-fg)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
              }`}
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
