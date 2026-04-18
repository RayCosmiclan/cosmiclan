"use client";

import { useState, useMemo, useCallback } from "react";
import type {
  MartyState,
  WsEvent,
  EmotionalState,
  GoalState,
  Goal,
} from "@/lib/types";

/**
 * Replays the event buffer up to targetTs, reconstructing:
 * - emotionalState: last emotion:changed before targetTs
 * - goalState: replaying all goal events before targetTs
 * - thoughts / actions: filtered to before targetTs
 * - driveState: approximated with current live state (no full snapshots in event stream)
 */
function reconstructStateAt(
  events: WsEvent[],
  targetTs: number,
  liveState: MartyState,
): MartyState {
  const pastEvents = events.filter((e) => e.timestamp <= targetTs);

  // Emotional state — last emotion:changed event before targetTs
  let emotionalState: EmotionalState | null = null;
  for (let i = pastEvents.length - 1; i >= 0; i--) {
    if (pastEvents[i].type === "emotion:changed") {
      emotionalState = pastEvents[i].payload as EmotionalState;
      break;
    }
  }

  // Goal state — replay all goal events in order
  const goalGoals: Goal[] = [];
  let lastReviewedAt = 0;
  for (const event of pastEvents) {
    if (
      event.type === "goal:created" ||
      event.type === "goal:proposed" ||
      event.type === "goal:updated" ||
      event.type === "goal:completed"
    ) {
      const goal = event.payload as Goal;
      const idx = goalGoals.findIndex((g) => g.id === goal.id);
      if (idx >= 0) {
        goalGoals[idx] = goal;
      } else {
        goalGoals.push(goal);
      }
    }
  }
  const goalState: GoalState | null =
    liveState.goalState !== null ? { goals: goalGoals, lastReviewedAt } : null;

  // Filter thoughts and actions to before targetTs
  const thoughts = liveState.thoughts.filter(
    (t) => t.timestamp <= targetTs,
  ) as MartyState["thoughts"];

  const actions = liveState.actions.filter(
    (a) => a.timestamp <= targetTs,
  ) as MartyState["actions"];

  // Working memory — filter to before targetTs
  const workingMemory = liveState.workingMemory.filter(
    (m) => m.timestamp <= targetTs,
  );

  return {
    ...liveState,
    emotionalState,
    goalState,
    thoughts,
    actions,
    workingMemory,
    events: pastEvents,
    // driveState: not reconstructible from events alone — use live approximation
    driveState: liveState.driveState,
  };
}

export interface TimelineControls {
  isLive: boolean;
  scrubTimestamp: number | null;
  displayState: MartyState;
  scrubTo: (timestamp: number) => void;
  snapToLive: () => void;
}

export function useTimeline(liveState: MartyState): TimelineControls {
  const [scrubTimestamp, setScrubTimestamp] = useState<number | null>(null);

  const isLive = scrubTimestamp === null;

  const displayState = useMemo(() => {
    if (isLive || scrubTimestamp === null) return liveState;
    return reconstructStateAt(liveState.events, scrubTimestamp, liveState);
  }, [isLive, scrubTimestamp, liveState]);

  const scrubTo = useCallback((ts: number) => {
    setScrubTimestamp(ts);
  }, []);

  const snapToLive = useCallback(() => {
    setScrubTimestamp(null);
  }, []);

  return { isLive, scrubTimestamp, displayState, scrubTo, snapToLive };
}
