"use client";
import Link from "next/link";
import { useClanStatus } from "@/hooks/use-clan-status";
import { useInbox } from "@/hooks/useInbox";
import { AGENTS } from "@/lib/agents";

export function MissionControl() {
  const clanState = useClanStatus();
  const { items } = useInbox();
  const topPending = items
    .filter((i) => i.priority === "urgent" || i.priority === "important")
    .slice(0, 5);

  const activeGoals = AGENTS.flatMap((a) => {
    const goals = clanState[a.id]?.goalState?.goals ?? [];
    return goals
      .filter(
        (g: { status?: string }) =>
          g.status === "in_progress" || g.status === "active",
      )
      .map((g: { id?: string; title?: string; progress?: number }) => ({
        agentId: a.id,
        agentName: a.name,
        colorHue: a.colorHue,
        id: g.id,
        title: g.title,
        progress: g.progress,
      }));
  }).slice(0, 8);

  const recentThoughts = AGENTS.flatMap((a) => {
    const thoughts = clanState[a.id]?.thoughts ?? [];
    return thoughts
      .slice(-3)
      .map(
        (t: {
          timestamp?: number;
          reasoning?: string;
          conclusion?: string;
        }) => ({
          agentId: a.id,
          agentName: a.name,
          colorHue: a.colorHue,
          timestamp: t.timestamp,
          text: t.conclusion || t.reasoning || "",
        }),
      );
  })
    .filter((t) => t.text && t.timestamp)
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Mission Control
        </h1>
        <p className="text-sm text-[var(--muted-fg)]">The clan at a glance.</p>
      </header>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
            Needs you now
          </h2>
          {items.length > 0 && (
            <Link
              href="/inbox"
              className="text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            >
              {items.length} pending →
            </Link>
          )}
        </div>
        {topPending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--muted-fg)]">
            Inbox clear. Clan has handled the rest.
          </div>
        ) : (
          <div className="space-y-2">
            {topPending.map((i) => (
              <Link
                key={i.id}
                href="/inbox"
                className="block rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        i.priority === "urgent"
                          ? "oklch(0.65 0.22 25)"
                          : "oklch(0.68 0.18 80)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-sm font-medium text-[var(--foreground)]">
                        {i.senderName ?? i.sender}
                      </span>
                      <span className="text-xs text-[var(--muted-fg)]">
                        {i.source}
                      </span>
                    </div>
                    {i.subject && (
                      <div className="truncate text-sm text-[var(--foreground)]">
                        {i.subject}
                      </div>
                    )}
                    <div className="line-clamp-1 text-xs text-[var(--muted-fg)]">
                      {i.preview}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Clan pulse
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {AGENTS.map((a) => {
            const state = clanState[a.id];
            const connected = state?.connected ?? false;
            const valence = state?.emotionalState?.mood?.valence;
            const topEmotion = state?.emotionalState?.activeEmotions?.[0];
            return (
              <Link
                key={a.id}
                href={`/conversations/${a.id}`}
                className="block rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 hover:bg-[var(--surface-3)]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: connected
                        ? a.colorHex
                        : "oklch(0.4 0 0)",
                    }}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {a.name}
                  </span>
                </div>
                <div className="mt-2 text-xs text-[var(--muted-fg)]">
                  {connected
                    ? topEmotion
                      ? `${topEmotion.type} · ${valence?.toFixed(2) ?? "–"}`
                      : `mood ${valence?.toFixed(2) ?? "–"}`
                    : "offline"}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Active goals
        </h2>
        {activeGoals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--muted-fg)]">
            No active goals. Boot more agents to see goals here.
          </div>
        ) : (
          <div className="space-y-2">
            {activeGoals.map((g) => (
              <div
                key={`${g.agentId}-${g.id}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3"
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: `oklch(0.65 0.18 ${g.colorHue})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-wide text-[var(--muted-fg)]">
                      {g.agentName}
                    </span>
                    <span className="truncate text-sm text-[var(--foreground)]">
                      {g.title}
                    </span>
                  </div>
                  {typeof g.progress === "number" && (
                    <div className="mt-1 h-1 w-full rounded-full bg-[var(--surface-3)]">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          width: `${Math.round(g.progress * 100)}%`,
                          backgroundColor: `oklch(0.65 0.18 ${g.colorHue})`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Today
        </h2>
        {recentThoughts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-6 text-center text-sm text-[var(--muted-fg)]">
            No recent clan activity.
          </div>
        ) : (
          <div className="space-y-2">
            {recentThoughts.map((t, idx) => (
              <div
                key={`${t.agentId}-${t.timestamp}-${idx}`}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3"
              >
                <span
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: `oklch(0.65 0.18 ${t.colorHue})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-wide text-[var(--muted-fg)]">
                      {t.agentName}
                    </span>
                    <span className="ml-auto text-xs text-[var(--muted-fg)]">
                      {t.timestamp
                        ? new Date(t.timestamp).toLocaleTimeString()
                        : ""}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]">
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
