"use client";

import type { MartyState, SoulSummary } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SoulTabProps {
  state: MartyState;
}

const BIG_FIVE_META: Record<
  keyof SoulSummary["personality"],
  { label: string; low: string; high: string; color: string }
> = {
  openness: {
    label: "Openness",
    low: "conventional",
    high: "inventive",
    color: "#93c5fd",
  },
  conscientiousness: {
    label: "Conscientiousness",
    low: "spontaneous",
    high: "disciplined",
    color: "#86efac",
  },
  extraversion: {
    label: "Extraversion",
    low: "introverted",
    high: "outgoing",
    color: "#fde68a",
  },
  agreeableness: {
    label: "Agreeableness",
    low: "challenging",
    high: "cooperative",
    color: "#f9a8d4",
  },
  neuroticism: {
    label: "Neuroticism",
    low: "resilient",
    high: "sensitive",
    color: "#fb923c",
  },
};

function BigFiveBar({
  trait,
  value,
}: {
  trait: keyof SoulSummary["personality"];
  value: number;
}) {
  const meta = BIG_FIVE_META[trait];
  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="mono text-sm text-[oklch(0.55_0_0)]">
          {(value * 100).toFixed(0)}
        </span>
      </div>
      <div className="relative h-2.5 rounded-full bg-[oklch(1_0_0/6%)]">
        <div
          className="drive-fill absolute left-0 top-0 h-full rounded-full opacity-80"
          style={{ width: `${pct}%`, backgroundColor: meta.color }}
        />
      </div>
      <div className="flex justify-between">
        <span className="mono text-sm text-[oklch(0.45_0_0)]">{meta.low}</span>
        <span className="mono text-sm text-[oklch(0.45_0_0)]">{meta.high}</span>
      </div>
    </div>
  );
}

function VADDisplay({
  label,
  vad,
}: {
  label: string;
  vad: SoulSummary["restingState"];
}) {
  return (
    <div className="rounded-lg p-4 bg-[oklch(1_0_0/4%)] border border-[oklch(1_0_0/10%)]">
      <p className="mono text-sm text-[oklch(0.48_0_0)] mb-3">{label}</p>
      <div className="space-y-2 mono text-sm">
        <div className="flex justify-between items-center">
          <span className="text-[oklch(0.45_0_0)]">valence</span>
          <span className="text-[#86efac]">
            {(vad.valence >= 0 ? "+" : "") + vad.valence.toFixed(3)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[oklch(0.45_0_0)]">arousal</span>
          <span className="text-[#93c5fd]">{vad.arousal.toFixed(3)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[oklch(0.45_0_0)]">dominance</span>
          <span className="text-[#c4b5fd]">
            {(vad.dominance >= 0 ? "+" : "") + vad.dominance.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SoulTab({ state }: SoulTabProps) {
  const { soul, connected } = state;

  if (!soul) {
    return (
      <div className="flex items-center justify-center h-full text-[oklch(0.45_0_0)]">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-15">◈</div>
          <p className="mono text-base">
            {connected ? "loading soul data…" : "agent is offline"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Personality + Resting state */}
      <div className="w-80 shrink-0 border-r border-[oklch(1_0_0/10%)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Name + description */}
          <div>
            <h2 className="text-lg font-light text-[oklch(0.88_0_0)] mb-1">
              {soul.name}
            </h2>
            {soul.description && (
              <p className="text-sm text-[oklch(0.55_0_0)] leading-relaxed italic">
                {soul.description}
              </p>
            )}
          </div>

          {/* Big Five */}
          <div>
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
              Personality — Big Five
            </h3>
            <div className="space-y-5">
              {(
                Object.keys(BIG_FIVE_META) as Array<
                  keyof SoulSummary["personality"]
                >
              ).map((trait) => (
                <BigFiveBar
                  key={trait}
                  trait={trait}
                  value={soul.personality[trait]}
                />
              ))}
            </div>
          </div>

          {/* Resting VAD */}
          {soul.restingState && (
            <div>
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-3">
                Resting state
              </h3>
              <VADDisplay label="baseline mood (VAD)" vad={soul.restingState} />
            </div>
          )}
        </div>
      </div>

      {/* Right: Values, voice anchors, tendencies, boundaries */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 space-y-10 max-w-2xl">
          {/* Values */}
          {soul.values.length > 0 && (
            <section>
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
                Values
              </h3>
              <ol className="space-y-2">
                {soul.values.map((value, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="mono text-sm text-[oklch(0.45_0_0)] w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-base text-[oklch(0.78_0_0)]">
                      {value}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Voice anchors */}
          {soul.voiceAnchors.length > 0 && (
            <section>
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
                Voice anchors
              </h3>
              <div className="space-y-3">
                {soul.voiceAnchors.map((anchor, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4 border border-[oklch(1_0_0/12%)] bg-[oklch(1_0_0/4%)]"
                  >
                    <p className="mono text-sm text-[oklch(0.50_0_0)] mb-2 capitalize">
                      when {anchor.state}
                    </p>
                    <p className="text-base text-[oklch(0.75_0_0)] leading-relaxed italic">
                      &ldquo;{anchor.phrase}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Emotional tendencies */}
          {soul.emotionalTendencies && (
            <section>
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
                Emotional tendencies
              </h3>
              <div className="space-y-4">
                <TendencyGroup
                  label="excited by"
                  items={soul.emotionalTendencies.excitedBy}
                  color="#fde68a"
                />
                <TendencyGroup
                  label="annoyed by"
                  items={soul.emotionalTendencies.annoyedBy}
                  color="#f87171"
                />
                <TendencyGroup
                  label="goes quiet when"
                  items={soul.emotionalTendencies.quietWhen}
                  color="#94a3b8"
                />
                <TendencyGroup
                  label="feels confident when"
                  items={soul.emotionalTendencies.confidentWhen}
                  color="#86efac"
                />
                <TendencyGroup
                  label="reflective when"
                  items={soul.emotionalTendencies.reflectiveWhen}
                  color="#c4b5fd"
                />
              </div>
            </section>
          )}

          {/* Hard boundaries */}
          {soul.hardBoundaries.length > 0 && (
            <section>
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
                Hard boundaries
              </h3>
              <div className="rounded-lg border border-[#f87171]/20 bg-[#f87171]/5 p-4 space-y-2">
                {soul.hardBoundaries.map((boundary, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs text-[#f87171] shrink-0 mt-0.5">
                      ⊘
                    </span>
                    <p className="text-base text-[oklch(0.72_0_0)] leading-relaxed">
                      {boundary}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function TendencyGroup({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <p className="mono text-sm mb-2" style={{ color }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="text-sm px-2.5 py-1 rounded-full border"
            style={{
              color,
              borderColor: color + "30",
              backgroundColor: color + "0f",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
