"use client";

import { useEffect, useState } from "react";
import { AGENTS } from "@/lib/agents";
import { useAgentSocket } from "./use-agent-socket";

export interface InboxItem {
  id: string;
  source: string;
  sender: string;
  senderName?: string | null;
  subject?: string | null;
  preview: string;
  body: string;
  priority: "urgent" | "important" | "fyi" | "junk";
  category?: string | null;
  suggestedAction?: string | null;
  replyDraft?: string | null;
  unsubscribeUrl?: string | null;
  status: string;
  reasoning?: string | null;
  receivedAt: number;
}

export function useInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const martyConfig = AGENTS.find((a) => a.id === "marty")!;
  const martyState = useAgentSocket(martyConfig);

  async function refresh() {
    const r = await fetch("/api/inbox?status=pending");
    if (!r.ok) return;
    const j = (await r.json()) as { items?: InboxItem[] };
    setItems(j.items ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const events = martyState.events;
    if (!events.length) return;
    const last = events[events.length - 1]!;
    if (last.type === "inbox:item_pending") {
      const item = last.payload as InboxItem;
      setItems((prev) =>
        prev.some((p) => p.id === item.id) ? prev : [item, ...prev],
      );
    } else if (last.type === "inbox:item_updated") {
      const updated = last.payload as InboxItem;
      setItems((prev) =>
        updated.status === "pending"
          ? prev.map((p) => (p.id === updated.id ? updated : p))
          : prev.filter((p) => p.id !== updated.id),
      );
    }
  }, [martyState.events]);

  async function reply(id: string, content: string) {
    await fetch(`/api/inbox/${id}/reply`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
    });
    await refresh();
  }

  async function dismiss(id: string) {
    await fetch(`/api/inbox/${id}/dismiss`, { method: "POST" });
    await refresh();
  }

  async function snooze(id: string, hours: number) {
    await fetch(`/api/inbox/${id}/snooze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ untilTs: Date.now() + hours * 3_600_000 }),
    });
    await refresh();
  }

  return { items, reply, dismiss, snooze, refresh };
}
