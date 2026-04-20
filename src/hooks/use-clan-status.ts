"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  MartyState,
  StateSnapshot,
  EmotionalState,
  MonologueOutput,
  WsEvent,
} from "@/lib/types";
import { AGENTS, getAgentWsUrl } from "@/lib/agents";

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
  };
}

type ClanState = Record<string, MartyState>;

function createDefaultClan(): ClanState {
  const clan: ClanState = {};
  for (const agent of AGENTS) {
    clan[agent.id] = createDefaultState();
  }
  return clan;
}

export function useClanStatus(): ClanState {
  const [clan, setClan] = useState<ClanState>(createDefaultClan);
  const wsRefs = useRef<Record<string, WebSocket | null>>({});
  const reconnectRefs = useRef<
    Record<string, ReturnType<typeof setTimeout> | null>
  >({});
  const delayRefs = useRef<Record<string, number>>({});

  const connectAgent = useCallback((agentId: string, wsUrl: string) => {
    if (wsRefs.current[agentId]?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(wsUrl);
    wsRefs.current[agentId] = ws;

    ws.onopen = () => {
      delayRefs.current[agentId] = 1000;
      setClan((prev) => ({
        ...prev,
        [agentId]: { ...prev[agentId], connected: true },
      }));
    };

    ws.onclose = () => {
      setClan((prev) => ({
        ...prev,
        [agentId]: { ...prev[agentId], connected: false },
      }));
      const delay = delayRefs.current[agentId] ?? 1000;
      delayRefs.current[agentId] = Math.min(delay * 2, 30000);
      reconnectRefs.current[agentId] = setTimeout(
        () => connectAgent(agentId, wsUrl),
        delay,
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "state:snapshot") {
          const snapshot = data as StateSnapshot;
          setClan((prev) => ({
            ...prev,
            [agentId]: {
              ...prev[agentId],
              emotionalState: snapshot.data.emotionalState,
              driveState: snapshot.data.driveState,
              goalState: snapshot.data.goalState,
              workingMemory: snapshot.data.workingMemory,
              recentEpisodes: snapshot.data.recentEpisodes,
              soul: snapshot.data.soul,
              abilityRequests: snapshot.data.abilityRequests,
              capabilities: snapshot.data.capabilities ?? [],
              events: snapshot.history.slice(-50),
              thoughts: snapshot.history
                .filter((e) => e.type === "thought:produced")
                .slice(-5)
                .map((e) => e as WsEvent & { payload: MonologueOutput }),
              actions: snapshot.history
                .filter(
                  (e) =>
                    e.type === "action:decided" ||
                    e.type === "action:completed",
                )
                .slice(-50) as MartyState["actions"],
            },
          }));
          return;
        }

        // For clan, only track emotion changes, thoughts, and actions (lightweight)
        if (data.type === "emotion:changed") {
          setClan((prev) => ({
            ...prev,
            [agentId]: {
              ...prev[agentId],
              emotionalState: data.payload as EmotionalState,
            },
          }));
        }

        if (data.type === "thought:produced") {
          setClan((prev) => {
            const thoughts = [
              ...prev[agentId].thoughts,
              data as WsEvent & { payload: MonologueOutput },
            ].slice(-5);
            return {
              ...prev,
              [agentId]: { ...prev[agentId], thoughts },
            };
          });
        }

        // Track actions for comms tab aggregation
        if (
          data.type === "action:decided" ||
          data.type === "action:completed"
        ) {
          setClan((prev) => {
            const actions = [
              ...prev[agentId].actions,
              data as MartyState["actions"][number],
            ].slice(-50);
            return {
              ...prev,
              [agentId]: { ...prev[agentId], actions },
            };
          });
        }
      } catch {
        // Malformed message -- ignore
      }
    };
  }, []);

  useEffect(() => {
    for (const agent of AGENTS) {
      const wsUrl = getAgentWsUrl(agent);
      delayRefs.current[agent.id] = 1000;
      connectAgent(agent.id, wsUrl);
    }

    return () => {
      for (const agent of AGENTS) {
        const timeout = reconnectRefs.current[agent.id];
        if (timeout) clearTimeout(timeout);
        wsRefs.current[agent.id]?.close();
      }
    };
  }, [connectAgent]);

  return clan;
}
