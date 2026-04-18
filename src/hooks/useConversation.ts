"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS } from "@/lib/agents";
import { useAgentSocket } from "./use-agent-socket";

interface Msg {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export function useConversation(agentName: string) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const agentConfig = AGENTS.find(
    (a) =>
      a.name.toLowerCase() === agentName.toLowerCase() ||
      a.id === agentName.toLowerCase().replace(/\s+/g, ""),
  );
  const agentState = useAgentSocket(agentConfig ?? AGENTS[0]!);
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch(
        `/api/comms/direct?agent=${encodeURIComponent(agentName.toLowerCase())}`,
      );
      if (!r.ok) return;
      const { messages: rows } = (await r.json()) as { messages: Msg[] };
      if (!cancelled) {
        for (const m of rows) seenIds.current.add(m.id);
        setMessages(rows);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [agentName]);

  useEffect(() => {
    const events = agentState.events;
    if (!events.length) return;
    const last = events[events.length - 1]!;
    if (last.type !== "comms:received" && last.type !== "comms:sent") return;
    const m = last.payload as {
      id?: string;
      from: string;
      to: string;
      content: string;
      timestamp: number;
      channelId?: string;
    };
    if (!m || m.channelId?.startsWith("channel:")) return;
    const agentLower = agentName.toLowerCase();
    const isRelevant =
      (m.from === agentLower && m.to === "gabriel") ||
      (m.from === "gabriel" && m.to === agentLower);
    if (!isRelevant) return;
    const msgId = m.id ?? `${m.from}:${m.timestamp}`;
    if (seenIds.current.has(msgId)) return;
    seenIds.current.add(msgId);
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        sender: m.from,
        content: m.content,
        timestamp: m.timestamp,
      },
    ]);
  }, [agentState.events, agentName]);

  async function send(content: string) {
    const agentId =
      agentConfig?.id ?? agentName.toLowerCase().replace(/\s+/g, "");
    const r = await fetch("/api/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent: agentId, content }),
    });
    const { message } = (await r.json()) as { message: Msg };
    if (message) {
      if (!seenIds.current.has(message.id)) {
        seenIds.current.add(message.id);
        setMessages((prev) => [...prev, { ...message, sender: "gabriel" }]);
      }
    }
  }

  return { messages, send };
}
