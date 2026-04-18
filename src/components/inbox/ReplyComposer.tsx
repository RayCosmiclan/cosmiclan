"use client";

import { useState } from "react";

export function ReplyComposer({
  initialDraft,
  onSend,
}: {
  initialDraft: string;
  onSend: (content: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [sending, setSending] = useState(false);
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--surface-3)] p-3 space-y-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        className="w-full bg-transparent text-sm resize-y focus:outline-none"
      />
      <button
        disabled={sending || !draft.trim()}
        onClick={async () => {
          setSending(true);
          try {
            await onSend(draft);
          } finally {
            setSending(false);
          }
        }}
        className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-xs text-white disabled:opacity-40"
      >
        {sending ? "Sending..." : "Send reply"}
      </button>
    </div>
  );
}
