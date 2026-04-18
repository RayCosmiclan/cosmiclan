"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

interface Msg {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export function MessageList({ messages }: { messages: Msg[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} msg={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
