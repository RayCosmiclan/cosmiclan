"use client";

import { useState } from "react";
import type { InboxItem } from "@/hooks/useInbox";
import { ReplyComposer } from "./ReplyComposer";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "oklch(0.65 0.22 25)",
  important: "oklch(0.68 0.18 80)",
  fyi: "oklch(0.68 0.09 230)",
  junk: "oklch(0.55 0.02 260)",
};

export function InboxItemCard({
  item,
  onReply,
  onDismiss,
  onSnooze,
}: {
  item: InboxItem;
  onReply: (id: string, content: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
  onSnooze: (id: string, hours: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const color = PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.fyi!;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {item.senderName ?? item.sender}
              </span>
              <span className="text-xs text-[var(--muted-fg)]">
                {item.source}
              </span>
              <span className="text-xs text-[var(--muted-fg)] ml-auto">
                {new Date(item.receivedAt).toLocaleString()}
              </span>
            </div>
            {item.subject && (
              <div className="text-sm truncate mt-0.5">{item.subject}</div>
            )}
            <div className="text-xs text-[var(--muted-fg)] line-clamp-2 mt-1">
              {item.preview}
            </div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-[var(--border)] p-4 space-y-3">
          <div className="text-sm whitespace-pre-wrap">{item.body}</div>
          {item.reasoning && (
            <div className="text-xs text-[var(--muted-fg)]">
              triage: {item.reasoning}
            </div>
          )}
          {item.priority === "junk" && item.unsubscribeUrl && (
            <a
              href={item.unsubscribeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs rounded-md bg-[var(--surface-3)] px-3 py-1.5"
            >
              Unsubscribe
            </a>
          )}
          {(item.priority === "urgent" || item.priority === "important") && (
            <ReplyComposer
              initialDraft={item.replyDraft ?? ""}
              onSend={(c) => onReply(item.id, c)}
            />
          )}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => onDismiss(item.id)}
              className="rounded-md bg-[var(--surface-3)] px-3 py-1.5"
            >
              Dismiss
            </button>
            <button
              onClick={() => onSnooze(item.id, 2)}
              className="rounded-md bg-[var(--surface-3)] px-3 py-1.5"
            >
              Snooze 2h
            </button>
            <button
              onClick={() => onSnooze(item.id, 24)}
              className="rounded-md bg-[var(--surface-3)] px-3 py-1.5"
            >
              Snooze 1d
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
