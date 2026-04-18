"use client";

import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";

export function Composer({
  onSend,
  placeholder = "Message...",
}: {
  onSend: (text: string) => Promise<void> | void;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    const t = val.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await onSend(t);
      setVal("");
      if (ref.current) ref.current.style.height = "auto";
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t border-[var(--border)] p-3">
      <div className="relative flex flex-col rounded-md border border-[var(--border)] bg-[var(--surface-2)] shadow-sm focus-within:ring-1 focus-within:ring-[var(--accent)]/40 transition-all">
        <textarea
          ref={ref}
          rows={1}
          value={val}
          placeholder={placeholder}
          onChange={(e) => {
            setVal(e.target.value);
            const ta = e.currentTarget;
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          className="min-h-[52px] max-h-[160px] resize-none border-0 bg-transparent px-4 pt-3.5 pb-12 text-sm focus-visible:outline-none leading-relaxed"
        />
        <button
          onClick={submit}
          disabled={!val.trim() || sending}
          className="absolute bottom-2 right-2 h-8 w-8 rounded-md bg-[var(--accent)] text-white disabled:opacity-40 grid place-items-center"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
