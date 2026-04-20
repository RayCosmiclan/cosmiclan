"use client";

import { useInbox } from "@/hooks/useInbox";
import { InboxItemCard } from "./InboxItemCard";

export function InboxList() {
  const { items, reply, dismiss, snooze } = useInbox();

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] p-10 text-center text-[var(--muted-fg)]">
        Inbox clear. Clan has handled the rest.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <InboxItemCard
          key={i.id}
          item={i}
          onReply={reply}
          onDismiss={dismiss}
          onSnooze={snooze}
        />
      ))}
    </div>
  );
}
