"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ThreadOfOperation,
  ThreadMessage,
  ThreadWorker,
} from "@/lib/types";

const POLL_INTERVAL_MS = 3000;

export function useAgentThreads(agentId: string) {
  const [threads, setThreads] = useState<ThreadOfOperation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/threads?agent=${encodeURIComponent(agentId)}&includeCompleted=true`,
      );
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? `HTTP ${r.status}`);
        return;
      }
      const data = (await r.json()) as { threads: ThreadOfOperation[] };
      setThreads(data.threads ?? []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refresh]);

  return { threads, error, loading, refresh };
}

export function useThread(agentId: string, threadId: string) {
  const [thread, setThread] = useState<ThreadOfOperation | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [workers, setWorkers] = useState<ThreadWorker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/threads/${encodeURIComponent(threadId)}/messages?agent=${encodeURIComponent(agentId)}&limit=500`,
      );
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setError(j.error ?? `HTTP ${r.status}`);
        return;
      }
      const data = (await r.json()) as {
        thread: ThreadOfOperation | null;
        messages: ThreadMessage[];
        workers?: ThreadWorker[];
      };
      setThread(data.thread);
      setMessages(data.messages ?? []);
      setWorkers(data.workers ?? []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [agentId, threadId]);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      const r = await fetch(
        `/api/threads/${encodeURIComponent(threadId)}/message`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ agent: agentId, content: trimmed }),
        },
      );
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      // Optimistic refresh after send
      await refresh();
    },
    [agentId, threadId, refresh],
  );

  useEffect(() => {
    refresh();
    timer.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [refresh]);

  return { thread, messages, workers, error, loading, refresh, send };
}
