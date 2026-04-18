"use client";
import { useEffect } from "react";
import { useInbox } from "@/hooks/useInbox";
import { InboxItemCard } from "@/components/inbox/InboxItemCard";

export default function Page() {
  const { items, reply, dismiss, snooze } = useInbox();

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;
      const w = window as unknown as { __TAURI_INTERNALS__?: unknown };
      if (!w.__TAURI_INTERNALS__) return;
      const { invoke } = await import("@tauri-apps/api/core");
      try {
        await invoke("set_badge", { count: items.length });
      } catch {}
    })();
  }, [items.length]);

  return (
    <div className="flex h-screen flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Cosmicfleet</div>
          <div className="text-xs text-[var(--muted-fg)]">
            {items.length} pending
          </div>
        </div>
        <button
          onClick={async () => {
            const w = window as unknown as { __TAURI_INTERNALS__?: unknown };
            if (!w.__TAURI_INTERNALS__) return;
            const { getCurrentWebviewWindow } =
              await import("@tauri-apps/api/webviewWindow");
            await getCurrentWebviewWindow().hide();
            const { WebviewWindow } =
              await import("@tauri-apps/api/webviewWindow");
            (await WebviewWindow.getByLabel("main"))?.setFocus();
          }}
          className="text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)]"
        >
          Open →
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 && (
          <div className="p-8 text-center text-xs text-[var(--muted-fg)]">
            Inbox clear.
          </div>
        )}
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
    </div>
  );
}
