"use client";
import { useFleetStatus } from "@/hooks/use-fleet-status";
import { AGENTS } from "@/lib/agents";

export function MissionControl() {
  const fleetState = useFleetStatus();

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Mission Control
        </h1>
        <p className="text-sm text-[var(--muted-fg)]">The fleet at a glance.</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Needs you now
        </h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-sm text-[var(--muted-fg)]">
            Inbox preview — filled by Stream D.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Fleet pulse
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {AGENTS.map((a) => {
            const state = fleetState.agents[a.id];
            const valence = state?.emotionalState?.mood?.valence;
            return (
              <div
                key={a.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: state?.connected
                        ? `oklch(0.6 0.18 ${a.colorHue})`
                        : "oklch(0.4 0 0)",
                    }}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {a.name}
                  </span>
                </div>
                <div className="mt-2 text-xs text-[var(--muted-fg)]">
                  {valence != null ? `mood ${valence.toFixed(2)}` : "–"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Active goals
        </h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted-fg)]">
          Populated from agents&apos; goals.json — see Stream D.
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Today
        </h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted-fg)]">
          Activity feed — Stream D.
        </div>
      </section>
    </div>
  );
}
