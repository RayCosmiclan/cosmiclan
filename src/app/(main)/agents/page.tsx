"use client";

import Link from "next/link";
import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import { useClanStatus } from "@/hooks/use-clan-status";

const ROLES: Record<string, string> = {
  marty: "Chief of Staff",
  stark: "Money & Business",
  ryuzaki: "Knowledge & Research",
  donna: "Personal Life",
  todo: "Builder & Innovator",
  aryaa: "Professional Brand",
  jennie: "Creative Expression",
  ray: "Rax Tech International",
};

export default function Page() {
  const clanState = useClanStatus();

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--border)] px-6 py-5">
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-1">
          The clan, at a glance. Pick one to drop into their mind.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENTS.map((a) => {
            const state = clanState[a.id];
            const connected = state?.connected ?? false;
            const valence = state?.emotionalState?.mood?.valence;
            const topEmotion = state?.emotionalState?.activeEmotions?.[0];
            return (
              <Link
                key={a.id}
                href={`/agents/${a.id}`}
                className="group relative block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover,oklch(1_0_0/2%))] transition-colors"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-2)]">
                  <Image
                    src={a.image}
                    alt={a.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{
                      filter: connected
                        ? "none"
                        : "saturate(0.65) brightness(0.85)",
                    }}
                    unoptimized={a.image.startsWith("http")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-sm border"
                    style={{
                      borderColor: connected
                        ? "oklch(0.72 0.16 150 / 50%)"
                        : "oklch(1 0 0 / 15%)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: connected ? "#10b981" : "#71717a",
                        boxShadow: connected ? "0 0 6px #10b981" : "none",
                      }}
                    />
                    <span className="text-[10px] uppercase tracking-wider text-white/80 mono">
                      {connected ? "live" : "offline"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div
                      className="text-base font-semibold text-white tracking-tight"
                      style={{ color: a.colorHex }}
                    >
                      {a.name}
                    </div>
                    <div className="text-xs text-white/75 mt-0.5">
                      {ROLES[a.id] ?? `Port ${a.port}`}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-fg)] truncate">
                    {connected
                      ? topEmotion
                        ? `${topEmotion.type} · v${valence?.toFixed(2) ?? "–"}`
                        : `mood ${valence?.toFixed(2) ?? "–"}`
                      : `port ${a.port}`}
                  </span>
                  <span className="text-[var(--muted-fg)] opacity-0 group-hover:opacity-60 transition-opacity text-sm">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
