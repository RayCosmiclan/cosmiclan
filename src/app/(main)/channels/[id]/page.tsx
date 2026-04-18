"use client";

import { useParams } from "next/navigation";
import { useChannel } from "@/hooks/useChannel";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { AGENTS } from "@/lib/agents";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { messages, channel, send } = useChannel(id);

  let members: string[] = [];
  if (channel?.members) {
    try {
      members =
        typeof channel.members === "string"
          ? (JSON.parse(channel.members) as string[])
          : (channel.members as unknown as string[]);
    } catch {
      members = [];
    }
  }
  const agentMembers = members.filter((m) => m !== "gabriel");

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div>
          <h1 className="text-base font-semibold">#{channel?.name ?? id}</h1>
          {channel?.description && (
            <p className="mt-0.5 text-xs text-[var(--muted-fg)]">
              {channel.description}
            </p>
          )}
        </div>
        {agentMembers.length > 0 && (
          <div className="flex items-center gap-1.5">
            {agentMembers.map((memberId) => {
              const normalized = memberId.toLowerCase().replace(/\s+/g, "");
              const agent = AGENTS.find(
                (a) =>
                  a.id === normalized ||
                  a.name.toLowerCase().replace(/\s+/g, "") === normalized,
              );
              if (!agent) return null;
              return (
                <div
                  key={agent.id}
                  title={agent.name}
                  className="h-6 w-6 rounded-full border border-[var(--border)]"
                  style={{ backgroundColor: agent.colorHex }}
                />
              );
            })}
          </div>
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
