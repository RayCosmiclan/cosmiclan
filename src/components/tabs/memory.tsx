"use client";

import { useMemo } from "react";
import type {
  MartyState,
  EpisodicMemory,
  WsEvent,
  MonologueOutput,
} from "@/lib/types";
import { CopyableId } from "@/components/copyable-id";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemoryTabProps {
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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const MEMORY_TYPE_COLORS: Record<string, string> = {
  interaction: "#93c5fd",
  observation: "#86efac",
  decision: "#fde68a",
  journal: "#c4b5fd",
  reflection: "#f9a8d4",
};

function memoryTypeColor(type: string): string {
  return MEMORY_TYPE_COLORS[type.toLowerCase()] ?? "#94a3b8";
}

function ImportanceBar({ value }: { value: number }) {
  const pct = Math.min(Math.max(value / 10, 0), 1) * 100;
  const color = value >= 8 ? "#f87171" : value >= 5 ? "#fde68a" : "#94a3b8";

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-[oklch(1_0_0/6%)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="mono text-xs" style={{ color }}>
        {value}/10
      </span>
    </div>
  );
}

function EpisodeCard({ episode }: { episode: EpisodicMemory }) {
  const typeColor = memoryTypeColor(episode.type);

  return (
    <div className="group py-4 border-b border-[oklch(1_0_0/8%)] hover:bg-[oklch(1_0_0/2%)] rounded px-3 -mx-3 transition-colors">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="mono text-sm text-[oklch(0.45_0_0)]">
          {formatDate(episode.timestamp)}
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded capitalize"
          style={{
            color: typeColor,
            backgroundColor: typeColor + "18",
          }}
        >
          {episode.type}
        </span>
        {episode.channel && (
          <Badge
            variant="outline"
            className="text-xs border-[oklch(1_0_0/12%)] text-[oklch(0.45_0_0)]"
          >
            {episode.channel}
          </Badge>
        )}
        <CopyableId id={episode.id} />
      </div>

      {/* Content */}
      <p className="text-base leading-relaxed text-[oklch(0.78_0_0)] mb-2 line-clamp-3">
        {episode.content}
      </p>

      {/* Metadata row */}
      <div className="flex items-center gap-4 flex-wrap">
        <ImportanceBar value={episode.importance} />
        <span className="mono text-sm text-[oklch(0.48_0_0)]">
          retrieved {episode.retrievalCount}×
        </span>
        <span className="mono text-sm text-[oklch(0.45_0_0)]">
          V{episode.moodAtEncoding.valence.toFixed(2)} A
          {episode.moodAtEncoding.arousal.toFixed(2)}
        </span>
        {episode.emotionalIntensity > 0 && (
          <span className="mono text-sm text-[oklch(0.48_0_0)]">
            emo {(episode.emotionalIntensity * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Tags */}
      {episode.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {episode.tags.map((tag) => (
            <span
              key={tag}
              className="mono text-sm px-1.5 py-0.5 rounded bg-[oklch(1_0_0/6%)] text-[oklch(0.50_0_0)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RetrievalSpotlight({
  latestThought,
  episodes,
}: {
  latestThought: (WsEvent & { payload: MonologueOutput }) | undefined;
  episodes: EpisodicMemory[];
}) {
  if (!latestThought) {
    return (
      <div className="p-4">
        <p className="mono text-sm text-[oklch(0.42_0_0)]">
          no retrieval data yet
        </p>
      </div>
    );
  }

  const payload = latestThought.payload;
  const memOps = payload.memoryOperations ?? [];
  const savedContent = memOps
    .filter((op) => op.op === "save" || op.op === "update")
    .slice(0, 3);

  const recentEps = episodes.slice(0, 3);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="mono text-sm text-[oklch(0.45_0_0)]">
          {formatTimestamp(latestThought.timestamp)}
        </span>
        <CopyableId id={latestThought.id} />
      </div>

      {savedContent.length > 0 && (
        <div className="space-y-2">
          <span className="mono text-sm text-[oklch(0.48_0_0)]">
            memory ops this thought
          </span>
          {savedContent.map((op, i) => (
            <div
              key={i}
              className="rounded p-2 bg-[oklch(1_0_0/4%)] border border-[oklch(1_0_0/10%)]"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="mono text-xs text-[#86efac]">{op.op}</span>
                {op.type && (
                  <span
                    className="text-xs capitalize"
                    style={{ color: memoryTypeColor(op.type) }}
                  >
                    {op.type}
                  </span>
                )}
                {op.importance !== undefined && (
                  <span className="mono text-sm text-[oklch(0.48_0_0)]">
                    imp {op.importance}
                  </span>
                )}
              </div>
              <p className="text-sm text-[oklch(0.60_0_0)] leading-relaxed line-clamp-2">
                {op.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {recentEps.length > 0 && (
        <div className="space-y-1">
          <span className="mono text-sm text-[oklch(0.48_0_0)]">
            recently active memories
          </span>
          {recentEps.map((ep) => (
            <div
              key={ep.id}
              className="flex items-center gap-2 py-1 border-b border-[oklch(1_0_0/8%)]"
            >
              <span
                className="text-xs capitalize shrink-0"
                style={{ color: memoryTypeColor(ep.type) }}
              >
                {ep.type}
              </span>
              <span className="text-sm text-[oklch(0.58_0_0)] truncate flex-1">
                {ep.content.slice(0, 80)}
                {ep.content.length > 80 ? "…" : ""}
              </span>
              <CopyableId id={ep.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryStats({ episodes }: { episodes: EpisodicMemory[] }) {
  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ep of episodes) {
      counts[ep.type] = (counts[ep.type] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [episodes]);

  const avgImportance =
    episodes.length > 0
      ? (
          episodes.reduce((sum, ep) => sum + ep.importance, 0) / episodes.length
        ).toFixed(1)
      : "—";

  const totalRetrievals = episodes.reduce(
    (sum, ep) => sum + ep.retrievalCount,
    0,
  );

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
        Memory stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg p-3 bg-[oklch(1_0_0/4%)] border border-[oklch(1_0_0/10%)]">
          <p className="mono text-sm text-[oklch(0.48_0_0)] mb-1">episodes</p>
          <p className="text-xl font-light text-[oklch(0.88_0_0)]">
            {episodes.length}
          </p>
        </div>
        <div className="rounded-lg p-3 bg-[oklch(1_0_0/4%)] border border-[oklch(1_0_0/10%)]">
          <p className="mono text-sm text-[oklch(0.48_0_0)] mb-1">
            avg importance
          </p>
          <p className="text-xl font-light text-[oklch(0.88_0_0)]">
            {avgImportance}
          </p>
        </div>
        <div className="rounded-lg p-3 bg-[oklch(1_0_0/4%)] border border-[oklch(1_0_0/10%)]">
          <p className="mono text-sm text-[oklch(0.48_0_0)] mb-1">
            total retrievals
          </p>
          <p className="text-xl font-light text-[oklch(0.88_0_0)]">
            {totalRetrievals}
          </p>
        </div>
        <div className="rounded-lg p-3 bg-[oklch(1_0_0/4%)] border border-[oklch(1_0_0/10%)]">
          <p className="mono text-sm text-[oklch(0.48_0_0)] mb-1">
            unique tags
          </p>
          <p className="text-xl font-light text-[oklch(0.88_0_0)]">
            {new Set(episodes.flatMap((ep) => ep.tags)).size}
          </p>
        </div>
      </div>

      {byType.length > 0 && (
        <div className="space-y-2">
          <span className="mono text-sm text-[oklch(0.48_0_0)]">by type</span>
          {byType.map(([type, count]) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className="text-xs capitalize w-24 shrink-0"
                style={{ color: memoryTypeColor(type) }}
              >
                {type}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-[oklch(1_0_0/6%)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(count / episodes.length) * 100}%`,
                    backgroundColor: memoryTypeColor(type),
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="mono text-sm text-[oklch(0.48_0_0)] w-6 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MemoryTab({ state }: MemoryTabProps) {
  const { recentEpisodes, thoughts, connected } = state;

  const latestThought = useMemo(
    () => (thoughts.length > 0 ? thoughts[thoughts.length - 1] : undefined),
    [thoughts],
  );

  const sortedEpisodes = useMemo(
    () => [...recentEpisodes].sort((a, b) => b.timestamp - a.timestamp),
    [recentEpisodes],
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Episodes list */}
      <ScrollArea className="flex-1 min-h-0 border-r border-[oklch(1_0_0/10%)]">
        <div className="p-6">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
            Recent episodes
          </h3>

          {sortedEpisodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[oklch(0.45_0_0)]">
              <div className="text-4xl mb-3 opacity-15">◫</div>
              <p className="mono text-base">
                {connected ? "no episodes loaded" : "agent is offline"}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {sortedEpisodes.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Right: Spotlight + Stats */}
      <div className="w-80 shrink-0 flex flex-col overflow-hidden">
        {/* Retrieval spotlight */}
        <div className="border-b border-[oklch(1_0_0/10%)]">
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
              Retrieval spotlight
            </h3>
          </div>
          <RetrievalSpotlight
            latestThought={latestThought}
            episodes={sortedEpisodes}
          />
        </div>

        {/* Stats */}
        <ScrollArea className="flex-1 min-h-0">
          <MemoryStats episodes={recentEpisodes} />

          {/* Entities placeholder */}
          <div className="px-6 pb-6 space-y-3 border-t border-[oklch(1_0_0/10%)] pt-6">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
              Entities &amp; Relationships
            </h3>
            <p className="mono text-sm text-[oklch(0.42_0_0)] leading-relaxed">
              entity graph data streams in via ws events — not yet available in
              this snapshot
            </p>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
