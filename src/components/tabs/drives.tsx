"use client";

import { useMemo } from "react";
import type { MartyState, Drive, Goal } from "@/lib/types";
import { CopyableId } from "@/components/copyable-id";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DrivesTabProps {
  state: MartyState;
}

const DRIVE_META: Record<
  string,
  { label: string; color: string; description: string }
> = {
  social: {
    label: "Social",
    color: "#f9a8d4",
    description: "connection, belonging, communication",
  },
  achievement: {
    label: "Achievement",
    color: "#fde68a",
    description: "accomplishment, progress, mastery",
  },
  curiosity: {
    label: "Curiosity",
    color: "#93c5fd",
    description: "exploration, learning, understanding",
  },
  care: {
    label: "Care",
    color: "#86efac",
    description: "empathy, support, nurturing",
  },
  selfExpression: {
    label: "Self-Expression",
    color: "#c4b5fd",
    description: "creativity, authenticity, voice",
  },
};

const GOAL_STATUS_STYLES: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  proposed: {
    label: "proposed",
    color: "#fde68a",
    bg: "#fde68a18",
  },
  active: { label: "active", color: "#86efac", bg: "#86efac18" },
  completed: { label: "done", color: "#6ee7b7", bg: "#6ee7b718" },
  abandoned: { label: "abandoned", color: "#71717a", bg: "#71717a18" },
  blocked: { label: "blocked", color: "#f87171", bg: "#f8717118" },
};

function timeUntilThreshold(drive: Drive): string {
  const remaining = drive.threshold - drive.value;
  if (remaining <= 0) return "exceeded";
  if (drive.growthRate <= 0) return "—";
  // growthRate is per millisecond typically, estimate in hours
  const msRemaining = remaining / drive.growthRate;
  const hours = msRemaining / (1000 * 60 * 60);
  if (hours < 1) return `${(hours * 60).toFixed(0)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function DriveBar({ drive, name }: { drive: Drive; name: string }) {
  const meta = DRIVE_META[name] ?? {
    label: name,
    color: "#94a3b8",
    description: "",
  };
  const pct = Math.min(drive.value * 100, 100);
  const thresholdPct = Math.min(drive.threshold * 100, 100);
  const exceeded = drive.value >= drive.threshold;
  const eta = timeUntilThreshold(drive);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm font-medium" style={{ color: meta.color }}>
            {meta.label}
          </span>
          <span className="ml-2 text-sm text-[oklch(0.50_0_0)]">
            {meta.description}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {exceeded && (
            <span className="text-sm font-medium" style={{ color: meta.color }}>
              ▲ threshold
            </span>
          )}
          <span className="mono text-sm text-[oklch(0.55_0_0)]">
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 rounded-full bg-[oklch(1_0_0/8%)]">
        <div
          className="drive-fill absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: meta.color,
            opacity: exceeded ? 1 : 0.7,
            boxShadow: exceeded ? `0 0 8px ${meta.color}60` : "none",
          }}
        />
        {/* Threshold line */}
        <div
          className="absolute top-0 w-0.5 h-full rounded-full bg-[oklch(1_0_0/40%)]"
          style={{ left: `${thresholdPct}%` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className="mono text-sm text-[oklch(0.45_0_0)]">
          growth ×{drive.growthRate.toFixed(4)}/ms
        </span>
        <span className="mono text-sm text-[oklch(0.45_0_0)]">
          {exceeded ? "ready to act" : `~${eta} to threshold`}
        </span>
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const statusStyle =
    GOAL_STATUS_STYLES[goal.status] ?? GOAL_STATUS_STYLES.active;
  const completedMilestones = goal.milestones.filter((m) => m.completed).length;

  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{
        borderColor: statusStyle.color + "30",
        backgroundColor: statusStyle.bg,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                color: statusStyle.color,
                backgroundColor: statusStyle.color + "20",
              }}
            >
              {statusStyle.label}
            </span>
            <Badge
              variant="outline"
              className="text-xs border-[oklch(1_0_0/15%)] text-[oklch(0.5_0_0)]"
            >
              {goal.scope}
            </Badge>
            {goal.status === "proposed" && (
              <span className="text-xs text-[#fde68a] animate-pulse font-medium">
                ← awaiting approval
              </span>
            )}
          </div>
          <p className="text-base font-medium text-[oklch(0.88_0_0)]">
            {goal.title}
          </p>
        </div>
        <CopyableId id={goal.id} />
      </div>

      {/* Description + motivation */}
      {goal.description && (
        <p className="text-sm text-[oklch(0.58_0_0)] leading-relaxed">
          {goal.description}
        </p>
      )}
      {goal.motivation && (
        <p className="text-sm text-[oklch(0.52_0_0)] italic">
          motivation: {goal.motivation}
        </p>
      )}

      {/* Progress bar */}
      {goal.status === "active" && (
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="mono text-sm text-[oklch(0.48_0_0)]">
              progress
            </span>
            <span className="mono text-sm" style={{ color: statusStyle.color }}>
              {(goal.progress * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[oklch(1_0_0/6%)]">
            <div
              className="drive-fill h-full rounded-full"
              style={{
                width: `${goal.progress * 100}%`,
                backgroundColor: statusStyle.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div className="space-y-1">
          <span className="mono text-sm text-[oklch(0.48_0_0)]">
            milestones {completedMilestones}/{goal.milestones.length}
          </span>
          <div className="space-y-1">
            {goal.milestones.map((ms) => (
              <div key={ms.id} className="flex items-start gap-2">
                <span
                  className="text-xs mt-0.5 shrink-0"
                  style={{
                    color: ms.completed ? "#86efac" : "oklch(0.35 0 0)",
                  }}
                >
                  {ms.completed ? "✓" : "○"}
                </span>
                <span
                  className={`text-sm leading-relaxed ${ms.completed ? "line-through text-[oklch(0.48_0_0)]" : "text-[oklch(0.65_0_0)]"}`}
                >
                  {ms.description}
                </span>
                <CopyableId id={ms.id} className="text-[10px] mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest reflection */}
      {goal.reflections.length > 0 && (
        <p className="text-sm text-[oklch(0.50_0_0)] italic border-l-2 border-[oklch(1_0_0/14%)] pl-3">
          "{goal.reflections[goal.reflections.length - 1]}"
        </p>
      )}
    </div>
  );
}

export function DrivesTab({ state }: DrivesTabProps) {
  const { driveState, goalState } = state;

  const shortTermGoals = useMemo(
    () => goalState?.goals.filter((g) => g.scope === "short-term") ?? [],
    [goalState],
  );

  const longTermGoals = useMemo(
    () => goalState?.goals.filter((g) => g.scope === "long-term") ?? [],
    [goalState],
  );

  const driveEntries = useMemo(() => {
    if (!driveState) return [];
    return Object.entries(driveState)
      .filter(([key]) => key !== "lastUpdated")
      .map(([key, drive]) => ({ key, drive: drive as Drive }))
      .sort((a, b) => b.drive.value - a.drive.value);
  }, [driveState]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Drive bars */}
      <div className="w-96 shrink-0 border-r border-[oklch(1_0_0/10%)] overflow-y-auto">
        <div className="p-6 space-y-6">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
            Drives
          </h3>

          {driveEntries.length === 0 ? (
            <p className="mono text-sm text-[oklch(0.42_0_0)]">
              {state.connected ? "waiting for drive data…" : "agent is offline"}
            </p>
          ) : (
            <div className="space-y-6">
              {driveEntries.map(({ key, drive }) => (
                <DriveBar key={key} name={key} drive={drive} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Goals */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 space-y-8">
          {/* Short-term goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
                Short-term goals
              </h3>
              <span className="mono text-sm text-[oklch(0.48_0_0)]">
                autonomous
              </span>
            </div>
            {shortTermGoals.length === 0 ? (
              <p className="mono text-sm text-[oklch(0.42_0_0)]">
                no short-term goals
              </p>
            ) : (
              <div className="space-y-3">
                {shortTermGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </div>

          {/* Long-term goals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
                Long-term goals
              </h3>
              {longTermGoals.some((g) => g.status === "proposed") && (
                <span className="text-xs text-[#fde68a] animate-pulse">
                  {longTermGoals.filter((g) => g.status === "proposed").length}{" "}
                  awaiting approval
                </span>
              )}
            </div>
            {longTermGoals.length === 0 ? (
              <p className="mono text-sm text-[oklch(0.42_0_0)]">
                no long-term goals
              </p>
            ) : (
              <div className="space-y-3">
                {/* Proposed first */}
                {[
                  ...longTermGoals.filter((g) => g.status === "proposed"),
                  ...longTermGoals.filter((g) => g.status !== "proposed"),
                ].map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
