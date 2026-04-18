"use client";

import { useMemo, useState } from "react";
import type { MartyState, MonologueOutput } from "@/lib/types";
import { CopyableId } from "@/components/copyable-id";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface MindTabProps {
  state: MartyState;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getActionLabel(action: MonologueOutput["action"]): string | null {
  if (!action || action.type === "none") return null;
  return `${action.type}${action.channel ? ` → ${action.channel}` : ""}`;
}

export function MindTab({ state }: MindTabProps) {
  const [search, setSearch] = useState("");

  const thoughts = useMemo(
    () => [...state.thoughts].reverse(),
    [state.thoughts],
  );

  const filteredThoughts = useMemo(() => {
    if (!search.trim()) return thoughts;
    const q = search.toLowerCase();
    return thoughts.filter((t) => {
      const p = t.payload as MonologueOutput;
      return (
        p.reasoning?.toLowerCase().includes(q) ||
        p.conclusion?.toLowerCase().includes(q)
      );
    });
  }, [thoughts, search]);

  const latestThought = filteredThoughts[0];
  const previousThoughts = filteredThoughts.slice(1);

  if (thoughts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <OfflineState connected={state.connected} />
      </div>
    );
  }

  const latest = latestThought
    ? (latestThought.payload as MonologueOutput)
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search bar */}
      <div className="shrink-0 px-8 pt-5 pb-0">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search thoughts..."
          className="max-w-sm h-9 bg-[oklch(1_0_0/4%)] border-[oklch(1_0_0/12%)] text-base text-[oklch(0.85_0_0)] placeholder:text-[oklch(0.45_0_0)]"
        />
      </div>

      {/* Current thought — hero display */}
      {latest && latestThought ? (
        <div className="shrink-0 px-8 py-8 border-b border-[oklch(1_0_0/8%)]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="mono text-sm text-[oklch(0.48_0_0)]">
                {formatTimestamp(latestThought.timestamp)}
              </span>
              <CopyableId id={latestThought.id} />
              {latest.model && <ModelBadge model={latest.model} />}
              {getActionLabel(latest.action) && (
                <Badge
                  variant="outline"
                  className="text-sm border-[oklch(0.7_0.12_250/40%)] text-[oklch(0.7_0.12_250)]"
                >
                  {getActionLabel(latest.action)}
                </Badge>
              )}
            </div>

            {/* Reasoning — large cinematic text */}
            <p className="thought-enter text-xl leading-relaxed text-[oklch(0.90_0_0)] font-light tracking-wide">
              {latest.reasoning}
            </p>

            {/* Conclusion — slightly dimmer, different weight */}
            {latest.conclusion && (
              <p className="mt-5 text-base leading-relaxed text-[oklch(0.62_0_0)] border-l-2 border-[oklch(1_0_0/14%)] pl-4">
                {latest.conclusion}
              </p>
            )}

            {/* Emotion reaction if present */}
            {latest.emotionalReaction && (
              <div className="mt-4 flex items-center gap-2">
                <span className="mono text-sm text-[oklch(0.48_0_0)]">
                  felt
                </span>
                <span className="text-sm capitalize text-[oklch(0.7_0.1_250)]">
                  {latest.emotionalReaction.type}
                </span>
                <span className="mono text-sm text-[oklch(0.48_0_0)]">
                  {(latest.emotionalReaction.intensity * 100).toFixed(0)}%
                </span>
                <span className="text-sm text-[oklch(0.48_0_0)] italic">
                  — {latest.emotionalReaction.cause}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : search.trim() ? (
        <div className="shrink-0 px-8 py-8 border-b border-[oklch(1_0_0/8%)]">
          <p className="mono text-base text-[oklch(0.45_0_0)]">
            no thoughts matching &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : null}

      {/* Thought history */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-8 py-5 space-y-1">
          {previousThoughts.length === 0 && !search.trim() ? (
            <p className="mono text-sm text-[oklch(0.42_0_0)] py-5">
              no previous thoughts this session
            </p>
          ) : (
            previousThoughts.map((thought) => {
              const t = thought.payload as MonologueOutput;
              const actionLabel = getActionLabel(t.action);
              return (
                <div
                  key={thought.id}
                  className="group flex gap-3 py-3.5 border-b border-[oklch(1_0_0/6%)] hover:bg-[oklch(1_0_0/2%)] rounded px-2 -mx-2 transition-colors"
                >
                  {/* Time + ID + Model */}
                  <div className="shrink-0 pt-0.5 flex flex-col items-end gap-1 w-20">
                    <span className="mono text-sm text-[oklch(0.45_0_0)]">
                      {formatTimestamp(thought.timestamp)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CopyableId id={thought.id} />
                      {t.model && <ModelBadge model={t.model} size="sm" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-base leading-relaxed text-[oklch(0.72_0_0)] line-clamp-3">
                      {t.reasoning}
                    </p>
                    {t.conclusion && (
                      <p className="mt-1.5 text-sm text-[oklch(0.52_0_0)] line-clamp-1 italic">
                        → {t.conclusion}
                      </p>
                    )}
                  </div>

                  {/* Action badge */}
                  {actionLabel && (
                    <div className="shrink-0 pt-0.5">
                      <Badge
                        variant="outline"
                        className="text-sm border-[oklch(0.7_0.12_250/30%)] text-[oklch(0.60_0.08_250)]"
                      >
                        {actionLabel}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

const MODEL_COLORS: Record<string, { border: string; text: string }> = {
  haiku: {
    border: "border-[oklch(0.65_0.12_160/40%)]",
    text: "text-[oklch(0.65_0.12_160)]",
  },
  sonnet: {
    border: "border-[oklch(0.65_0.12_280/40%)]",
    text: "text-[oklch(0.65_0.12_280)]",
  },
  opus: {
    border: "border-[oklch(0.65_0.15_30/40%)]",
    text: "text-[oklch(0.65_0.15_30)]",
  },
};

function ModelBadge({
  model,
  size = "md",
}: {
  model: string;
  size?: "sm" | "md";
}) {
  const colors = MODEL_COLORS[model] ?? MODEL_COLORS.haiku!;
  const cls =
    size === "sm" ? `text-[10px] px-1 py-0 leading-4` : `text-xs px-1.5 py-0.5`;
  return (
    <span
      className={`mono border rounded ${colors.border} ${colors.text} ${cls}`}
    >
      {model}
    </span>
  );
}

function OfflineState({ connected }: { connected: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-[oklch(0.45_0_0)]">
      <div className="text-5xl opacity-15">◎</div>
      <p className="mono text-base">
        {connected ? "waiting for first thought…" : "agent is offline"}
      </p>
    </div>
  );
}
