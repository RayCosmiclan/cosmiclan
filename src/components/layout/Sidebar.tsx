"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Inbox,
  MessageSquare,
  Hash,
  Users,
  Settings,
} from "lucide-react";

const TOP_NAV = [
  { href: "/mission", label: "Mission Control", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: "inbox" },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/channels", label: "Channels", icon: Hash },
  { href: "/agents", label: "Agents", icon: Users },
];

export function Sidebar({ pendingCount }: { pendingCount?: number }) {
  const pathname = usePathname();
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-2)] md:flex">
      <div className="p-4 text-base font-semibold tracking-tight text-[var(--foreground)]">
        Cosmiclan
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 pb-4">
        {TOP_NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--surface-3)] text-[var(--foreground)]"
                  : "text-[var(--muted-fg)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{item.label}</span>
              {item.badge === "inbox" &&
                pendingCount != null &&
                pendingCount > 0 && (
                  <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">
                    {pendingCount}
                  </span>
                )}
            </Link>
          );
        })}
        <div className="mx-3 my-3 h-px bg-[var(--border)]" />
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-[var(--surface-3)] text-[var(--foreground)]"
              : "text-[var(--muted-fg)] hover:bg-[var(--surface-3)] hover:text-[var(--foreground)]"
          }`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
