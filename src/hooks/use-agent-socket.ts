"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  MartyState,
  WsEvent,
  StateSnapshot,
  EmotionalState,
  DriveState,
  GoalState,
  MonologueOutput,
  AgentConfig,
  AgentStatus,
} from "@/lib/types";
import { getAgentWsUrl } from "@/lib/agents";

const MAX_EVENTS = 5000;

function createDefaultState(): MartyState {
  return {
    connected: false,
    emotionalState: null,
    driveState: null,
    goalState: null,
    workingMemory: [],
    recentEpisodes: [],
    soul: null,
    abilityRequests: [],
    capabilities: [],
    events: [],
    thoughts: [],
    actions: [],
    status: null,
  };
}

export function useAgentSocket(agent: AgentConfig) {
  const [state, setState] = useState<MartyState>(createDefaultState);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectDelayRef = useRef(1000);

  const connect = useCallback((wsUrl: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelayRef.current = 1000;
      setState((prev) => ({ ...prev, connected: true }));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
      const delay = reconnectDelayRef.current;
      reconnectDelayRef.current = Math.min(delay * 2, 30000);
      reconnectTimeoutRef.current = setTimeout(() => connect(wsUrl), delay);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "state:snapshot") {
          const snapshot = data as StateSnapshot;
          setState((prev) => ({
            ...prev,
            emotionalState: snapshot.data.emotionalState,
            driveState: snapshot.data.driveState,
            goalState: snapshot.data.goalState,
            workingMemory: snapshot.data.workingMemory,
            recentEpisodes: snapshot.data.recentEpisodes,
            soul: snapshot.data.soul,
            abilityRequests: snapshot.data.abilityRequests,
            capabilities: snapshot.data.capabilities ?? [],
            events: snapshot.history,
            thoughts: snapshot.history
              .filter((e) => e.type === "thought:produced")
              .map((e) => e as WsEvent & { payload: MonologueOutput }),
            actions: snapshot.history.filter(
              (e) =>
                e.type === "action:decided" || e.type === "action:completed",
            ) as MartyState["actions"],
          }));
          return;
        }

        const wsEvent = data as WsEvent;
        setState((prev) => {
          const events = [...prev.events, wsEvent];
          if (events.length > MAX_EVENTS)
            events.splice(0, events.length - MAX_EVENTS);

          const next = { ...prev, events };

          switch (wsEvent.type) {
            case "emotion:changed":
              next.emotionalState = wsEvent.payload as EmotionalState;
              break;
            case "thought:produced":
              next.thoughts = [
                ...prev.thoughts,
                wsEvent as WsEvent & { payload: MonologueOutput },
              ];
              break;
            case "action:decided":
            case "action:completed":
              next.actions = [
                ...prev.actions,
                wsEvent as MartyState["actions"][number],
              ];
              break;
            case "goal:created":
            case "goal:updated":
            case "goal:completed":
            case "goal:proposed":
              if (prev.goalState) {
                const existingIdx = prev.goalState.goals.findIndex(
                  (g) => g.id === (wsEvent.payload as { id: string }).id,
                );
                const updatedGoals = [...prev.goalState.goals];
                if (existingIdx >= 0) {
                  updatedGoals[existingIdx] =
                    wsEvent.payload as GoalState["goals"][number];
                } else {
                  updatedGoals.push(
                    wsEvent.payload as GoalState["goals"][number],
                  );
                }
                next.goalState = {
                  ...prev.goalState,
                  goals: updatedGoals,
                };
              }
              break;
            case "ability:requested":
              next.abilityRequests = [
                ...prev.abilityRequests,
                wsEvent.payload as MartyState["abilityRequests"][number],
              ];
              break;
            case "agent:status":
              next.status = wsEvent.payload as AgentStatus;
              break;
          }

          return next;
        });
      } catch {
        // Malformed message -- ignore
      }
    };
  }, []);

  // Reconnect when agent changes
  useEffect(() => {
    const wsUrl = getAgentWsUrl(agent);

    // Reset state for new agent
    setState(createDefaultState());
    reconnectDelayRef.current = 1000;

    // Clean up any existing connection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;

    connect(wsUrl);

    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [agent.id, connect]);

  return state;
}
