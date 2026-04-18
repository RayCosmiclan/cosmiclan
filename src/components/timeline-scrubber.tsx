"use client";

import { useRef, useCallback, useMemo } from "react";
import type { WsEvent } from "@/lib/types";

interface TimelineScrubberProps {
  events: WsEvent[];
  isLive: boolean;
  scrubTimestamp: number | null;
  onScrub: (timestamp: number) => void;
  onSnapToLive: () => void;
}

const DENSITY_BUCKETS = 120;

function computeDensity(
  events: WsEvent[],
  startTs: number,
  endTs: number,
): number[] {
  const buckets = new Array<number>(DENSITY_BUCKETS).fill(0);
  const range = endTs - startTs;
  if (range <= 0) return buckets;
  for (const event of events) {
    const relPos = (event.timestamp - startTs) / range;
    const idx = Math.min(
      DENSITY_BUCKETS - 1,
      Math.max(0, Math.floor(relPos * DENSITY_BUCKETS)),
    );
    buckets[idx]++;
  }
  const max = Math.max(...buckets, 1);
  return buckets.map((b) => b / max);
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function TimelineScrubber({
  events,
  isLive,
  scrubTimestamp,
  onScrub,
  onSnapToLive,
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const startTs = events.length > 0 ? events[0].timestamp : Date.now() - 60_000;
  const endTs = isLive ? Date.now() : (events.at(-1)?.timestamp ?? Date.now());

  const density = useMemo(
    () => computeDensity(events, startTs, endTs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events.length, startTs, endTs],
  );

  // Handle position as fraction 0–1
  const handlePos =
    isLive || scrubTimestamp === null
      ? 1
      : Math.max(
          0,
          Math.min(
            1,
            (scrubTimestamp - startTs) / Math.max(1, endTs - startTs),
          ),
        );

  const tsFromPointer = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return endTs;
      const rect = track.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(startTs + pos * (endTs - startTs));
    },
    [startTs, endTs],
  );

  const trySetPosition = useCallback(
    (clientX: number) => {
      const ts = tsFromPointer(clientX);
      const pos = (ts - startTs) / Math.max(1, endTs - startTs);
      if (pos >= 0.97) {
        onSnapToLive();
      } else {
        onScrub(ts);
      }
    },
    [tsFromPointer, onScrub, onSnapToLive, startTs, endTs],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      trySetPosition(e.clientX);
    },
    [trySetPosition],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;
      trySetPosition(e.clientX);
    },
    [trySetPosition],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDraggingRef.current = false;
  }, []);

  const scrubLabel = scrubTimestamp !== null ? formatTs(scrubTimestamp) : null;

  return (
    <div className="shrink-0 border-t border-[oklch(1_0_0/12%)] bg-[oklch(0.10_0.005_260/95%)] backdrop-blur-sm">
      {/* VIEWING PAST banner */}
      {!isLive && (
        <div className="flex items-center justify-center gap-3 py-1 bg-[oklch(0.55_0.12_50/8%)] border-b border-[oklch(0.55_0.12_50/18%)]">
          <span className="text-xs font-medium text-[oklch(0.75_0.14_50)] tracking-wide">
            ◈ VIEWING PAST
          </span>
          {scrubLabel && (
            <span className="mono text-xs text-[oklch(0.6_0.1_50)]">
              {scrubLabel} IST
            </span>
          )}
          <button
            onClick={onSnapToLive}
            className="mono text-xs px-2.5 py-0.5 rounded border border-emerald-500/50 text-emerald-400 hover:bg-emerald-400/10 transition-colors"
          >
            → LIVE
          </button>
        </div>
      )}

      {/* Scrubber row */}
      <div className="h-10 flex items-center gap-3 px-4">
        {/* Start time */}
        <span className="mono text-sm text-[oklch(0.42_0_0)] shrink-0 w-14 text-right">
          {events.length > 0 ? formatTs(startTs) : "—"}
        </span>

        {/* Track */}
        <div
          ref={trackRef}
          className="relative flex-1 h-8 flex items-end cursor-pointer select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Density bars */}
          <div className="absolute bottom-0 left-0 right-0 h-5 flex items-end gap-[1px]">
            {density.map((d, i) => {
              const isBeforeHandle = i / DENSITY_BUCKETS <= handlePos;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-[1px]"
                  style={{
                    height: `${Math.max(8, d * 100)}%`,
                    backgroundColor: isBeforeHandle
                      ? isLive
                        ? `oklch(0.65 0.1 250 / ${Math.max(0.12, d * 0.65)})`
                        : `oklch(0.6 0.12 50 / ${Math.max(0.1, d * 0.55)})`
                      : `oklch(0.5 0 0 / ${Math.max(0.06, d * 0.2)})`,
                    transition: "background-color 0.3s",
                  }}
                />
              );
            })}
          </div>

          {/* Thin baseline rule */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[oklch(1_0_0/8%)]" />

          {/* Scrub handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none"
            style={{ left: `${handlePos * 100}%` }}
          >
            {/* Vertical tick on track */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-px h-5 bg-[oklch(1_0_0/20%)]" />
            {/* Handle dot */}
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 shadow-md ${
                isLive
                  ? "bg-emerald-400 border-emerald-200/80"
                  : "bg-[oklch(0.75_0.14_50)] border-[oklch(0.6_0.1_50)]"
              }`}
              style={
                isLive
                  ? { boxShadow: "0 0 8px #34d399, 0 0 2px #34d399" }
                  : { boxShadow: "0 0 6px oklch(0.55 0.12 50 / 0.5)" }
              }
            />
          </div>
        </div>

        {/* Live/now indicator */}
        <div className="shrink-0 flex items-center gap-2">
          {!isLive ? (
            <button
              onClick={onSnapToLive}
              className="mono text-xs px-2.5 py-1 rounded border border-emerald-500/40 text-emerald-400 hover:bg-emerald-400/10 transition-colors"
            >
              LIVE
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="mono text-xs text-emerald-400">NOW</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
