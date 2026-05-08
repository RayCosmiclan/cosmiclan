"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { useAgentThreads } from "@/hooks/use-threads";
import type { ThreadOfOperation } from "@/lib/types";

function findAgent(id: string | undefined) {
  if (!id) return null;
  const norm = id.toLowerCase().replace(/\s+/g, "");
  return AGENTS.find(
    (a) => a.id === norm || a.name.toLowerCase().replace(/\s+/g, "") === norm,
  );
}

const STATUS_COLOR: Record<ThreadOfOperation["status"], string> = {
  active: "#86efac",
  "paused-for-input": "#fbbf24",
  "idle-watching": "#94a3b8",
  completed: "#475569",
  cancelled: "#64748b",
};

const STATUS_LABEL: Record<ThreadOfOperation["status"], string> = {
  active: "Active",
  "paused-for-input": "Needs you",
  "idle-watching": "Watching",
  completed: "Done",
  cancelled: "Cancelled",
};

function formatRelative(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export default function Page() {
  const { agent: agentParam } = useParams<{ agent: string }>();
  const agent = findAgent(agentParam);
  const { threads, error, loading, refresh } = useAgentThreads(agent?.id ?? "");
  const [newThread, setNewThread] = useState("");
  const [creating, setCreating] = useState(false);

  if (!agent) {
    return (
      <div className="p-6 text-sm text-[var(--muted-fg)]">Unknown agent.</div>
    );
  }

  const open = threads.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled",
  );
  const closed = threads.filter(
    (t) => t.status === "completed" || t.status === "cancelled",
  );
  const pausedForInput = open.filter((t) => t.status === "paused-for-input");
  const otherOpen = open.filter((t) => t.status !== "paused-for-input");

  const createThread = async () => {
    const content = newThread.trim();
    if (!content || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent: agent.id,
          title: content.slice(0, 80),
          content,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewThread("");
      await refresh();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center gap-3">
        <Link
          href="/conversations"
          className="text-sm text-[var(--muted-fg)] hover:text-[var(--fg)]"
        >
          ← Agents
        </Link>
        <div
          className="relative w-7 h-7 rounded-full overflow-hidden border"
          style={{
            borderColor: `oklch(from ${agent.colorHex} l c h / 35%)`,
          }}
        >
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            sizes="28px"
            className="object-cover"
            unoptimized={agent.image.startsWith("http")}
          />
        </div>
        <h1 className="text-base font-semibold">{agent.name}</h1>
        <span className="text-sm text-[var(--muted-fg)]">
          · {open.length} active thread{open.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              value={newThread}
              onChange={(event) => setNewThread(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void createThread();
                }
              }}
              placeholder={`Start a thread with ${agent.name}`}
              className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-transparent px-3 text-sm outline-none focus:ring-1 focus:ring-ring/40"
            />
            <button
              onClick={() => void createThread()}
              disabled={!newThread.trim() || creating}
              className="h-9 rounded-md border border-[var(--border)] px-3 text-sm disabled:opacity-40"
            >
              Start thread
            </button>
          </div>
        </section>

        {loading && threads.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">Loading threads…</p>
        ) : error ? (
          <p className="text-sm text-red-400">Error: {error}</p>
        ) : threads.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">
            No threads yet. {agent.name} will spawn threads as they become
            relevant.
          </p>
        ) : null}

        {pausedForInput.length > 0 && (
          <Section title="Paused, needs you" emphasized>
            {pausedForInput.map((t) => (
              <ThreadCard key={t.id} agentId={agent.id} thread={t} />
            ))}
          </Section>
        )}

        {otherOpen.length > 0 && (
          <Section title="Active">
            {otherOpen.map((t) => (
              <ThreadCard key={t.id} agentId={agent.id} thread={t} />
            ))}
          </Section>
        )}

        {closed.length > 0 && (
          <details className="space-y-2">
            <summary className="text-sm text-[var(--muted-fg)] cursor-pointer">
              Completed ({closed.length})
            </summary>
            <div className="mt-2 space-y-2">
              {closed.map((t) => (
                <ThreadCard key={t.id} agentId={agent.id} thread={t} dimmed />
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  emphasized,
  children,
}: {
  title: string;
  emphasized?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2
        className={
          emphasized
            ? "text-sm font-semibold text-amber-400 uppercase tracking-wide"
            : "text-sm font-semibold text-[var(--muted-fg)] uppercase tracking-wide"
        }
      >
        {title}
      </h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ThreadCard({
  agentId,
  thread,
  dimmed,
}: {
  agentId: string;
  thread: ThreadOfOperation;
  dimmed?: boolean;
}) {
  const color = STATUS_COLOR[thread.status];
  return (
    <Link
      href={`/conversations/${agentId}/${thread.id}`}
      className={`block rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[oklch(1_0_0/2%)] px-4 py-3 transition-colors ${dimmed ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-2 h-2 rounded-full mt-2 shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="font-semibold text-base truncate">{thread.title}</h3>
            <span
              className="text-xs rounded-full px-1.5 py-0.5 border shrink-0"
              style={{
                borderColor: color + "60",
                color,
                backgroundColor: color + "15",
              }}
            >
              {STATUS_LABEL[thread.status]}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-fg)] truncate">
            {thread.currentActivity}
          </p>
          <p className="mono text-xs text-[oklch(0.42_0_0)] mt-1">
            {formatRelative(thread.lastActivityAt)}
            {thread.goalId ? ` · goal ${thread.goalId.slice(0, 16)}` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
