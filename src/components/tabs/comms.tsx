"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CopyableId } from "@/components/copyable-id";
import { AGENTS, GABRIEL_CONFIG, getAgent } from "@/lib/agents";
import { useClanStatus } from "@/hooks/use-clan-status";
import type { AgentConfig, OutgoingAction } from "@/lib/types";

interface CommsTabProps {
  activeAgent: AgentConfig;
}

interface CommsMessage {
  id: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  senderColor: string;
  senderImage: string;
  recipientId: string | null; // null = broadcast to all
  recipientName: string | null;
  channel: string;
  content: string;
  type: string;
  success?: boolean;
}

/** Unique key for an agent pair, order-independent */
function pairKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

const GENERAL_KEY = "__general__";

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
  });
}

function MessageBubble({ msg }: { msg: CommsMessage }) {
  const isGabriel = msg.senderId === "gabriel";

  if (isGabriel) {
    return (
      <div className="flex gap-3 py-3 px-3 hover:bg-[oklch(1_0_0/2%)] rounded transition-colors justify-end">
        {/* Content — right-aligned for Gabriel */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center gap-2 mb-1 flex-wrap justify-end">
            {msg.channel && (
              <Badge
                variant="outline"
                className="text-xs py-0 h-4 border-amber-500/30 text-amber-400/70"
              >
                {msg.channel}
              </Badge>
            )}
            <CopyableId id={msg.id} className="text-[10px]" />
            <span className="mono text-sm text-[oklch(0.42_0_0)]">
              {formatTimestamp(msg.timestamp)}
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: GABRIEL_CONFIG.colorHex }}
            >
              Gabriel
            </span>
          </div>
          <p className="text-base text-[oklch(0.78_0_0)] leading-relaxed">
            {msg.content}
          </p>
        </div>

        {/* Gabriel avatar */}
        <div
          className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border"
          style={{ borderColor: GABRIEL_CONFIG.colorHex + "50" }}
        >
          <Image
            src={GABRIEL_CONFIG.image}
            alt="Gabriel"
            fill
            className="object-cover"
            sizes="28px"
            unoptimized
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3 px-3 hover:bg-[oklch(1_0_0/2%)] rounded transition-colors">
      {/* Sender avatar */}
      <div
        className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border"
        style={{ borderColor: msg.senderColor + "50" }}
      >
        <Image
          src={msg.senderImage}
          alt={msg.senderName}
          fill
          className="object-cover"
          sizes="28px"
          unoptimized={msg.senderImage.startsWith("http")}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className="text-sm font-medium"
            style={{ color: msg.senderColor }}
          >
            {msg.senderName}
          </span>
          <span className="mono text-sm text-[oklch(0.42_0_0)]">
            {formatTimestamp(msg.timestamp)}
          </span>
          <CopyableId id={msg.id} className="text-[10px]" />
          {msg.channel && (
            <Badge
              variant="outline"
              className="text-xs py-0 h-4 border-[oklch(1_0_0/10%)] text-[oklch(0.45_0_0)]"
            >
              {msg.channel}
            </Badge>
          )}
        </div>
        <p className="text-base text-[oklch(0.72_0_0)] leading-relaxed">
          {msg.content}
        </p>
      </div>

      {/* Success indicator */}
      {msg.success !== undefined && (
        <div className="shrink-0 pt-1">
          <span
            className="mono text-xs"
            style={{ color: msg.success ? "#86efac" : "#f87171" }}
          >
            {msg.success ? "sent" : "failed"}
          </span>
        </div>
      )}
    </div>
  );
}

interface ThreadInfo {
  key: string;
  label: string;
  agents: [string, string] | null; // null for General/broadcast
  lastTimestamp: number;
  messageCount: number;
  lastPreview: string;
}

function ThreadSidebar({
  threads,
  activeThread,
  onSelect,
}: {
  threads: ThreadInfo[];
  activeThread: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold px-1">
        Threads
      </h3>
      <div className="space-y-0.5">
        {threads.map((thread) => {
          const isActive = activeThread === thread.key;
          const isGeneral = thread.key === GENERAL_KEY;

          // For pair threads, get agent colors
          const agentColors = thread.agents
            ? thread.agents.map((id) => getAgent(id).colorHex)
            : null;

          return (
            <button
              key={thread.key}
              onClick={() => onSelect(thread.key)}
              className={`w-full text-left px-2.5 py-2.5 rounded transition-colors ${
                isActive ? "bg-[oklch(1_0_0/8%)]" : "hover:bg-[oklch(1_0_0/4%)]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-medium truncate ${
                    isActive
                      ? "text-[oklch(0.85_0_0)]"
                      : "text-[oklch(0.55_0_0)]"
                  }`}
                >
                  {isGeneral ? (
                    <span className="text-[oklch(0.6_0.08_155)]">General</span>
                  ) : agentColors ? (
                    <>
                      <span style={{ color: agentColors[0] }}>
                        {getAgent(thread.agents![0]).name}
                      </span>
                      <span className="text-[oklch(0.35_0_0)]"> ↔ </span>
                      <span style={{ color: agentColors[1] }}>
                        {getAgent(thread.agents![1]).name}
                      </span>
                    </>
                  ) : (
                    thread.label
                  )}
                </span>
                <span className="mono text-sm text-[oklch(0.42_0_0)] shrink-0 ml-2">
                  {thread.messageCount}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-[oklch(0.48_0_0)] truncate leading-relaxed">
                  {thread.lastPreview}
                </p>
                <span className="mono text-sm text-[oklch(0.40_0_0)] shrink-0">
                  {formatRelativeTime(thread.lastTimestamp)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CommsTab({ activeAgent }: CommsTabProps) {
  const clanState = useClanStatus();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Aggregate all action events from all agents into CommsMessages
  const allMessages = useMemo(() => {
    const msgs: CommsMessage[] = [];

    for (const agent of AGENTS) {
      const agentState = clanState[agent.id];
      if (!agentState) continue;

      for (const action of agentState.actions) {
        const payload = action.payload as OutgoingAction & {
          success?: boolean;
        };
        if (!payload.channel || payload.type === "none") continue;

        // Determine recipient -- if replyToId references another agent, that's the recipient
        // For broadcast/general: recipientId is null
        let recipientId: string | null = null;
        let recipientName: string | null = null;

        if (payload.replyToId) {
          // Try to find which agent this is replying to
          for (const otherAgent of AGENTS) {
            if (otherAgent.id === agent.id) continue;
            const otherState = clanState[otherAgent.id];
            if (!otherState) continue;
            const isTarget = otherState.actions.some(
              (a) => a.id === payload.replyToId,
            );
            if (isTarget) {
              recipientId = otherAgent.id;
              recipientName = otherAgent.name;
              break;
            }
          }
        }

        msgs.push({
          id: action.id,
          timestamp: action.timestamp,
          senderId: agent.id,
          senderName: agent.name,
          senderColor: agent.colorHex,
          senderImage: agent.image,
          recipientId,
          recipientName,
          channel: payload.channel,
          content: payload.content,
          type: payload.type,
          success: payload.success,
        });
      }
    }

    return msgs.sort((a, b) => a.timestamp - b.timestamp);
  }, [clanState]);

  // Group messages into threads
  const { threads, threadMessages } = useMemo(() => {
    const threadMap = new Map<string, CommsMessage[]>();

    for (const msg of allMessages) {
      let key: string;
      if (!msg.recipientId) {
        // Broadcast / no specific recipient -> General
        key = GENERAL_KEY;
      } else {
        key = pairKey(msg.senderId, msg.recipientId);
      }
      const existing = threadMap.get(key) ?? [];
      existing.push(msg);
      threadMap.set(key, existing);
    }

    const threadInfos: ThreadInfo[] = [];
    for (const [key, msgs] of threadMap) {
      const last = msgs[msgs.length - 1];
      if (key === GENERAL_KEY) {
        threadInfos.push({
          key: GENERAL_KEY,
          label: "General",
          agents: null,
          lastTimestamp: last.timestamp,
          messageCount: msgs.length,
          lastPreview:
            last.content.length > 60
              ? last.content.slice(0, 60) + "..."
              : last.content,
        });
      } else {
        const [a, b] = key.split(":");
        threadInfos.push({
          key,
          label: `${getAgent(a).name} ↔ ${getAgent(b).name}`,
          agents: [a, b],
          lastTimestamp: last.timestamp,
          messageCount: msgs.length,
          lastPreview:
            last.content.length > 60
              ? last.content.slice(0, 60) + "..."
              : last.content,
        });
      }
    }

    // Sort by most recent first
    threadInfos.sort((a, b) => b.lastTimestamp - a.lastTimestamp);

    return { threads: threadInfos, threadMessages: threadMap };
  }, [allMessages]);

  // Resolve which thread to show
  const selectedThread = activeThread ?? threads[0]?.key ?? null;

  // Get messages for the selected thread, filtered by search
  const displayMessages = useMemo(() => {
    if (!selectedThread) return [];
    const msgs = threadMessages.get(selectedThread) ?? [];
    if (!search.trim()) return msgs;
    const q = search.toLowerCase();
    return msgs.filter((m) => m.content.toLowerCase().includes(q));
  }, [selectedThread, threadMessages, search]);

  const connectedCount = useMemo(
    () => AGENTS.filter((a) => clanState[a.id]?.connected).length,
    [clanState],
  );

  // Empty state: no messages at all
  if (allMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[oklch(0.45_0_0)]">
        <div className="text-4xl opacity-15">&#x25C7;</div>
        <p className="mono text-base">
          {connectedCount === 0
            ? "no agents connected"
            : "No inter-agent communications yet."}
        </p>
        <p className="mono text-sm text-[oklch(0.40_0_0)] text-center max-w-72 leading-relaxed">
          Agents will start talking as they think.
        </p>
      </div>
    );
  }

  const selectedInfo = threads.find((t) => t.key === selectedThread);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar: thread list */}
      <div className="w-64 shrink-0 border-r border-[oklch(1_0_0/10%)] overflow-y-auto">
        <ThreadSidebar
          threads={threads}
          activeThread={selectedThread}
          onSelect={setActiveThread}
        />
      </div>

      {/* Right: message thread */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Thread header with search */}
        <div className="shrink-0 px-6 py-4 border-b border-[oklch(1_0_0/10%)] flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-[oklch(0.78_0_0)]">
                {selectedInfo?.key === GENERAL_KEY ? (
                  <span className="text-[oklch(0.6_0.08_155)]">General</span>
                ) : selectedInfo?.agents ? (
                  <>
                    <span
                      style={{
                        color: getAgent(selectedInfo.agents[0]).colorHex,
                      }}
                    >
                      {getAgent(selectedInfo.agents[0]).name}
                    </span>
                    <span className="text-[oklch(0.35_0_0)]"> ↔ </span>
                    <span
                      style={{
                        color: getAgent(selectedInfo.agents[1]).colorHex,
                      }}
                    >
                      {getAgent(selectedInfo.agents[1]).name}
                    </span>
                  </>
                ) : (
                  "Thread"
                )}
              </h3>
              <span className="mono text-sm text-[oklch(0.45_0_0)]">
                {selectedInfo?.messageCount ?? 0} messages
              </span>
              <span className="mono text-sm text-[oklch(0.45_0_0)]">
                {connectedCount}/{AGENTS.length} connected
              </span>
            </div>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-56 h-8 bg-[oklch(1_0_0/4%)] border-[oklch(1_0_0/12%)] text-sm text-[oklch(0.85_0_0)] placeholder:text-[oklch(0.45_0_0)]"
          />
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-0">
            {displayMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[oklch(0.45_0_0)]">
                <p className="mono text-base">
                  {search.trim()
                    ? `no messages matching "${search}"`
                    : "no messages in this thread"}
                </p>
              </div>
            ) : (
              displayMessages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
