"use client";

import { useParams } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { useConversation } from "@/hooks/useConversation";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";

export default function Page() {
  const { agent } = useParams<{ agent: string }>();
  const a = AGENTS.find(
    (x) =>
      x.id === agent?.toLowerCase() ||
      x.name.toLowerCase().replace(/\s+/g, "") === agent?.toLowerCase(),
  );
  if (!a)
    return <div className="p-6 text-[var(--muted-fg)]">Unknown agent.</div>;
  const { messages, send } = useConversation(a.name);
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--border)] px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: a.color }}
        />
        <h1 className="text-base font-semibold">{a.name}</h1>
      </header>
      <MessageList messages={messages} />
      <Composer onSend={send} placeholder={`Message ${a.name}...`} />
    </div>
  );
}
