"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { useThread } from "@/hooks/use-threads";
import type {
  ThreadMessage,
  ThreadMessageKind,
  ThreadWorker,
} from "@/lib/types";

function findAgent(id: string | undefined) {
  if (!id) return null;
  const norm = id.toLowerCase().replace(/\s+/g, "");
  return AGENTS.find(
    (a) => a.id === norm || a.name.toLowerCase().replace(/\s+/g, "") === norm,
  );
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Page() {
  const { agent: agentParam, threadId } = useParams<{
    agent: string;
    threadId: string;
  }>();
  const agent = findAgent(agentParam);
  const { thread, messages, workers, error, send } = useThread(
    agent?.id ?? "",
    threadId ?? "",
  );
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!agent)
    return (
      <div className="p-6 text-sm text-[var(--muted-fg)]">Unknown agent.</div>
    );

  const handleSend = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await send(draft);
      setDraft("");
    } catch (err) {
      console.error("send failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Thread header */}
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-start gap-3">
        <Link
          href={`/conversations/${agent.id}`}
          className="text-sm text-[var(--muted-fg)] hover:text-[var(--fg)] mt-1"
        >
          ←
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold leading-tight">
            {thread?.title ?? "Loading…"}
          </h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            {thread ? (
              <>
                <span className="capitalize">
                  {thread.status.replace(/-/g, " ")}
                </span>
                {" · "}
                {thread.currentActivity}
              </>
            ) : (
              "Loading…"
            )}
          </p>
          {thread?.goalId && (
            <p className="mono text-xs text-[oklch(0.42_0_0)] mt-1">
              Goal: {thread.goalId}
            </p>
          )}
        </div>
        <div
          className="w-2 h-2 rounded-full mt-2 shrink-0"
          style={{
            backgroundColor: agent.colorHex,
            boxShadow: `0 0 6px ${agent.colorHex}`,
          }}
        />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
        {error && <p className="text-sm text-red-400 mb-3">Error: {error}</p>}
        {workers.length > 0 && <WorkerPanel workers={workers} />}
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--muted-fg)]">
            Thread is empty. Send a message below to start the conversation.
          </p>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {messages.map((m) => (
              <MessageRow key={m.id} message={m} agentName={agent.name} />
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="relative flex flex-col rounded-md border border-[var(--border)] bg-[var(--card)] shadow-sm focus-within:ring-1 focus-within:ring-ring/40 transition-all max-w-3xl">
          <textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const ta = e.target as HTMLTextAreaElement;
              ta.style.height = "auto";
              ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder={`Send a message into this thread…`}
            className="min-h-[52px] max-h-[160px] resize-none border-0 bg-transparent px-4 pt-3.5 pb-12 text-sm focus:outline-none leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="absolute bottom-2 right-2 h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            aria-label="Send"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkerPanel({ workers }: { workers: ThreadWorker[] }) {
  return (
    <section className="mb-4 max-w-3xl rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted-fg)]">
          Code Workers
        </h2>
        <span className="mono text-xs text-[var(--muted-fg)]">
          {workers.length} total
        </span>
      </div>
      <div className="space-y-2">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="grid gap-2 rounded border border-[var(--border)] px-2 py-2 text-xs md:grid-cols-[92px_120px_1fr]"
          >
            <span className="mono text-[var(--muted-fg)]">
              {worker.id.slice(0, 8)}
            </span>
            <span
              className={`font-medium ${workerStatusClass(worker.status)}`}
            >
              {worker.status.replace(/_/g, " ")}
            </span>
            <span className="min-w-0 truncate text-[var(--muted-fg)]">
              {worker.summary || worker.workDir || "No summary yet"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function workerStatusClass(status: ThreadWorker["status"]): string {
  switch (status) {
    case "completed":
      return "text-emerald-300";
    case "failed":
    case "rejected":
      return "text-red-400";
    case "analysis_ready":
      return "text-amber-300";
    case "dispatched":
    default:
      return "text-[oklch(0.72_0.1_250)]";
  }
}

function MessageRow({
  message,
  agentName,
}: {
  message: ThreadMessage;
  agentName: string;
}) {
  const time = formatTime(message.timestamp);

  switch (message.kind as ThreadMessageKind) {
    case "monologue":
      return (
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[oklch(0.7_0.1_250)]">
              {agentName}
            </span>
            <span className="mono text-xs text-[oklch(0.45_0_0)]">{time}</span>
          </div>
          <p className="text-base leading-relaxed text-[var(--fg)] whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      );

    case "question":
      return (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-amber-400">
              {agentName} asks:
            </span>
            <span className="mono text-xs text-amber-400/60">{time}</span>
          </div>
          <p className="text-base leading-relaxed text-[var(--fg)]">
            {message.content}
          </p>
        </div>
      );

    case "reply":
      return (
        <div className="flex justify-end">
          <div className="max-w-[70%] space-y-1">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="mono text-xs text-[oklch(0.45_0_0)]">
                {time}
              </span>
              <span className="text-sm font-semibold">You</span>
            </div>
            <div className="rounded-lg rounded-br-sm bg-primary text-primary-foreground p-3 text-sm">
              {message.content}
            </div>
          </div>
        </div>
      );

    case "worker_dispatched":
      return (
        <details className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <summary className="text-xs text-[var(--muted-fg)] cursor-pointer flex items-center gap-2">
            <span>🔧</span>
            <span className="mono">{time}</span>
            <span>{message.content}</span>
          </summary>
          {message.metadata && (
            <pre className="mt-2 text-xs text-[var(--muted-fg)] overflow-x-auto">
              {JSON.stringify(message.metadata, null, 2)}
            </pre>
          )}
        </details>
      );

    case "worker_analysis":
      return (
        <details className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <summary className="text-xs text-amber-300 cursor-pointer flex items-center gap-2">
            <span>🔍</span>
            <span className="mono">{time}</span>
            <span className="truncate">{message.content.slice(0, 100)}</span>
          </summary>
          <div className="mt-2 text-xs text-[var(--muted-fg)] whitespace-pre-wrap">
            {message.content}
          </div>
          {message.metadata && (
            <pre className="mt-2 text-xs text-[var(--muted-fg)] overflow-x-auto">
              {JSON.stringify(message.metadata, null, 2)}
            </pre>
          )}
        </details>
      );

    case "worker_completed":
      return (
        <details className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
          <summary className="text-xs text-emerald-300 cursor-pointer flex items-center gap-2">
            <span>✅</span>
            <span className="mono">{time}</span>
            <span className="truncate">{message.content.slice(0, 100)}</span>
          </summary>
          <div className="mt-2 text-xs text-[var(--muted-fg)] whitespace-pre-wrap">
            {message.content}
          </div>
          {message.metadata && (
            <pre className="mt-2 text-xs text-[var(--muted-fg)] overflow-x-auto">
              {JSON.stringify(message.metadata, null, 2)}
            </pre>
          )}
        </details>
      );

    case "worker_failed":
      return (
        <details className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2">
          <summary className="text-xs text-red-400 cursor-pointer flex items-center gap-2">
            <span>❌</span>
            <span className="mono">{time}</span>
            <span>{message.content}</span>
          </summary>
        </details>
      );

    case "action_summary":
    case "system":
    default:
      return (
        <p className="text-xs text-[var(--muted-fg)] italic">
          <span className="mono">{time}</span> · {message.content}
        </p>
      );
  }
}
