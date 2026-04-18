"use client";

import { useEffect, useRef, useState } from "react";
import { useFleetStatus } from "./use-fleet-status";

interface Msg {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  channel: string;
}

interface ChannelInfo {
  id: string;
  name: string;
  description?: string;
  members: string;
}

export function useChannel(channelId: string) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [channel, setChannel] = useState<ChannelInfo | null>(null);
  const fleet = useFleetStatus();
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch(
        `/api/comms/channel?id=${encodeURIComponent(channelId)}`,
      );
      if (!r.ok) return;
      const j = (await r.json()) as {
        messages: Msg[];
        channel: ChannelInfo | null;
      };
      if (!cancelled) {
        for (const m of j.messages) seenIds.current.add(m.id);
        setMessages(j.messages);
        setChannel(j.channel);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [channelId]);

  useEffect(() => {
    // Watch all agent states for new channel messages
    for (const agentState of Object.values(fleet)) {
      const events = agentState.events;
      if (!events.length) continue;
      const last = events[events.length - 1]!;
      if (last.type !== "comms:received" && last.type !== "comms:sent")
        continue;
      const m = last.payload as {
        id?: string;
        from: string;
        to: string;
        content: string;
        timestamp: number;
        channelId?: string;
      };
      if (!m || m.channelId !== `channel:${channelId}`) continue;
      const msgId = m.id ?? `${m.from}:${m.timestamp}`;
      if (seenIds.current.has(msgId)) continue;
      seenIds.current.add(msgId);
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          sender: m.from,
          content: m.content,
          timestamp: m.timestamp,
          channel: channelId,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fleet, channelId]);

  async function send(content: string) {
    const r = await fetch("/api/channel-send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channel: channelId, content }),
    });
    const { message } = (await r.json()) as { message?: Msg };
    if (message && !seenIds.current.has(message.id)) {
      seenIds.current.add(message.id);
      setMessages((prev) => [...prev, { ...message, sender: "gabriel" }]);
    }
  }

  return { messages, channel, send };
}
