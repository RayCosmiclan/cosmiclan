import { AGENTS, GABRIEL_CONFIG } from "@/lib/agents";

interface Msg {
  id?: string;
  sender: string;
  content: string;
  timestamp: number;
}

export function MessageBubble({ msg }: { msg: Msg }) {
  const isMe = msg.sender === "gabriel";
  const agent = isMe
    ? GABRIEL_CONFIG
    : AGENTS.find(
        (a) =>
          a.id === msg.sender.toLowerCase().replace(/\s+/g, "") ||
          a.name.toLowerCase() === msg.sender.toLowerCase(),
      );
  const accent = agent ? agent.color : "oklch(0.65 0.15 260)";

  return (
    <div
      className={`flex gap-2 mb-3 ${isMe ? "justify-end" : "justify-start"}`}
    >
      {!isMe && (
        <div
          className="w-7 h-7 rounded-full mt-1 flex-shrink-0"
          style={{ backgroundColor: accent }}
        />
      )}
      <div
        className={`max-w-[70%] p-3 ${
          isMe
            ? "bg-[var(--accent)] text-white rounded-lg rounded-br-sm"
            : "bg-[var(--surface-2)] border border-[var(--border)] rounded-lg rounded-bl-sm"
        }`}
      >
        {!isMe && (
          <div className="text-xs mb-1 font-medium" style={{ color: accent }}>
            {agent?.name ?? msg.sender}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {msg.content}
        </div>
      </div>
      {isMe && (
        <div className="w-7 h-7 rounded-full mt-1 flex-shrink-0 bg-[var(--surface-3)]" />
      )}
    </div>
  );
}
