"use client";

import { useParams } from "next/navigation";
import { useChannel } from "@/hooks/useChannel";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { messages, channel, send } = useChannel(id);
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--border)] px-5 py-4 flex-shrink-0">
        <h1 className="text-base font-semibold">#{channel?.name ?? id}</h1>
        {channel?.description && (
          <p className="text-xs text-[var(--muted-fg)] mt-0.5">
            {channel.description}
          </p>
        )}
      </header>
      <MessageList messages={messages} />
      <Composer
        onSend={send}
        placeholder={`Message #${channel?.name ?? id}...`}
      />
    </div>
  );
}
