"use client";

import { useMemo, useState } from "react";
import { AGENTS, getAgent } from "@/lib/agents";
import { CopyableId } from "@/components/copyable-id";
import { DraftsPanel } from "@/components/drafts-panel";
import type {
  AgentConfig,
  MartyState,
  AbilityRequest,
  OutgoingAction,
  MonologueOutput,
} from "@/lib/types";

type ClanState = Record<string, MartyState>;

interface HomeViewProps {
  clanState: ClanState;
  onSelectAgent: (agent: AgentConfig) => void;
}

/* ── helpers ────────────────────────────────────────────────── */

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

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* ── inter-agent comms message ─────────────────────────────── */

interface CommsMessage {
  id: string;
  timestamp: number;
  senderId: string;
  senderName: string;
  senderColor: string;
  senderImage: string;
  recipientId: string | null;
  recipientName: string | null;
  channel: string;
  content: string;
}

function extractCommsMessages(clanState: ClanState): CommsMessage[] {
  const msgs: CommsMessage[] = [];

  for (const agent of AGENTS) {
    const agentState = clanState[agent.id];
    if (!agentState) continue;

    for (const action of agentState.actions) {
      const payload = action.payload as OutgoingAction & {
        success?: boolean;
      };
      if (!payload.channel || payload.type === "none") continue;

      let recipientId: string | null = null;
      let recipientName: string | null = null;

      if (payload.replyToId) {
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
      });
    }
  }

  return msgs.sort((a, b) => b.timestamp - a.timestamp);
}

/* ── Requests for Gabriel ──────────────────────────────────── */

function RequestsForGabriel({ messages }: { messages: CommsMessage[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const gabrielMessages = useMemo(() => {
    const keywords = ["gabriel", "marty"];
    return messages
      .filter((m) => {
        const lower = m.content.toLowerCase();
        const recipientMatch =
          m.recipientId === "marty" ||
          m.recipientName?.toLowerCase() === "marty";
        const contentMatch = keywords.some((kw) => lower.includes(kw));
        return recipientMatch || contentMatch;
      })
      .slice(0, 10);
  }, [messages]);

  if (gabrielMessages.length === 0) {
    return (
      <Section
        title="Requests for Gabriel"
        accentClass="border-l-amber-500/60"
        bgClass="bg-amber-500/[0.03]"
      >
        <p className="mono text-sm text-[oklch(0.45_0_0)] py-5 text-center">
          No requests yet. Agents will surface them here.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Requests for Gabriel"
      count={gabrielMessages.length}
      accentClass="border-l-amber-500/60"
      bgClass="bg-amber-500/[0.03]"
    >
      <div className="space-y-0.5 p-1">
        {gabrielMessages.map((msg) => {
          const isExpanded = expandedId === msg.id;
          return (
            <div
              key={msg.id}
              role="button"
              tabIndex={0}
              onClick={() => setExpandedId(isExpanded ? null : msg.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(isExpanded ? null : msg.id);
                }
              }}
              className="w-full text-left px-4 py-3.5 hover:bg-[oklch(1_0_0/5%)] transition-colors rounded-md border border-transparent hover:border-[oklch(1_0_0/8%)] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-sm font-medium shrink-0"
                  style={{ color: msg.senderColor }}
                >
                  {msg.senderName}
                </span>
                <CopyableId id={msg.id} className="text-[10px]" />
                <p
                  className={`text-sm text-[oklch(0.68_0_0)] leading-relaxed flex-1 min-w-0 ${isExpanded ? "" : "truncate"}`}
                >
                  {msg.content}
                </p>
                <span className="mono text-sm text-[oklch(0.40_0_0)] shrink-0">
                  {formatRelativeTime(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── Ability Requests (all agents) ─────────────────────────── */

interface AggregatedAbilityRequest extends AbilityRequest {
  agentId: string;
  agentName: string;
  agentColor: string;
}

function AbilityRequestsSection({ clanState }: { clanState: ClanState }) {
  const openRequests = useMemo(() => {
    const reqs: AggregatedAbilityRequest[] = [];
    for (const agent of AGENTS) {
      const state = clanState[agent.id];
      if (!state) continue;
      for (const req of state.abilityRequests) {
        if (req.status === "open") {
          reqs.push({
            ...req,
            agentId: agent.id,
            agentName: agent.name,
            agentColor: agent.colorHex,
          });
        }
      }
    }
    return reqs.sort((a, b) => b.createdAt - a.createdAt);
  }, [clanState]);

  if (openRequests.length === 0) {
    return (
      <Section
        title="Ability Requests"
        accentClass="border-l-violet-500/60"
        bgClass="bg-violet-500/[0.02]"
      >
        <p className="mono text-sm text-[oklch(0.45_0_0)] py-5 text-center">
          No open ability requests.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Ability Requests"
      count={openRequests.length}
      accentClass="border-l-violet-500/60"
      bgClass="bg-violet-500/[0.02]"
    >
      <div className="space-y-0.5 p-1">
        {openRequests.map((req) => (
          <div
            key={req.id}
            className="px-4 py-3.5 hover:bg-[oklch(1_0_0/5%)] transition-colors rounded-md border border-transparent hover:border-[oklch(1_0_0/8%)]"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className="text-sm font-medium shrink-0 mt-0.5"
                style={{ color: req.agentColor }}
              >
                {req.agentName}
              </span>
              <CopyableId id={req.id} className="text-[10px] mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[oklch(0.68_0_0)] leading-relaxed">
                  {req.description}
                </p>
                {req.reason && (
                  <p className="text-sm text-[oklch(0.50_0_0)] mt-0.5 italic">
                    {req.reason}
                  </p>
                )}
              </div>
              <span className="mono text-sm text-[oklch(0.40_0_0)] shrink-0">
                {formatRelativeTime(req.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Latest Comms ──────────────────────────────────────────── */

function LatestComms({ messages }: { messages: CommsMessage[] }) {
  const latest = messages.slice(0, 10);

  if (latest.length === 0) {
    return (
      <Section
        title="Latest Comms"
        accentClass="border-l-sky-500/60"
        bgClass="bg-sky-500/[0.02]"
      >
        <p className="mono text-sm text-[oklch(0.45_0_0)] py-5 text-center">
          No communications yet.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Latest Comms"
      accentClass="border-l-sky-500/60"
      bgClass="bg-sky-500/[0.02]"
    >
      <div className="space-y-0">
        {latest.map((msg) => {
          const recipient = msg.recipientId ? getAgent(msg.recipientId) : null;
          return (
            <div
              key={msg.id}
              className="px-4 py-2.5 hover:bg-[oklch(1_0_0/3%)] transition-colors rounded"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="text-sm font-medium shrink-0"
                  style={{ color: msg.senderColor }}
                >
                  {msg.senderName}
                </span>
                <span className="text-sm text-[oklch(0.40_0_0)]">
                  {"\u2192"}
                </span>
                <span
                  className="text-sm font-medium shrink-0"
                  style={{
                    color: recipient?.colorHex ?? "oklch(0.55 0 0)",
                  }}
                >
                  {recipient?.name ?? "all"}
                </span>
                <CopyableId id={msg.id} className="text-[10px]" />
                <p className="text-sm text-[oklch(0.58_0_0)] truncate flex-1 min-w-0 ml-1">
                  {msg.content}
                </p>
                <span className="mono text-sm text-[oklch(0.40_0_0)] shrink-0">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* ── Recent Thoughts ───────────────────────────────────────── */

function RecentThoughts({ clanState }: { clanState: ClanState }) {
  const latestThoughts = useMemo(() => {
    const thoughts: Array<{
      id: string;
      agentId: string;
      agentName: string;
      agentColor: string;
      timestamp: number;
      reasoning: string;
      conclusion: string;
    }> = [];

    for (const agent of AGENTS) {
      const state = clanState[agent.id];
      if (!state?.thoughts?.length) continue;
      const last = state.thoughts[state.thoughts.length - 1];
      const payload = last.payload as MonologueOutput;
      thoughts.push({
        id: last.id,
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.colorHex,
        timestamp: last.timestamp,
        reasoning: payload.reasoning ?? "",
        conclusion: payload.conclusion ?? "",
      });
    }

    return thoughts.sort((a, b) => b.timestamp - a.timestamp);
  }, [clanState]);

  if (latestThoughts.length === 0) {
    return (
      <Section
        title="Recent Thoughts"
        accentClass="border-l-indigo-500/60"
        bgClass="bg-indigo-500/[0.02]"
      >
        <p className="mono text-sm text-[oklch(0.45_0_0)] py-5 text-center">
          No thoughts yet.
        </p>
      </Section>
    );
  }

  return (
    <Section
      title="Recent Thoughts"
      accentClass="border-l-indigo-500/60"
      bgClass="bg-indigo-500/[0.02]"
    >
      <div className="space-y-0">
        {latestThoughts.map((thought) => (
          <div
            key={thought.agentId}
            className="px-4 py-3 hover:bg-[oklch(1_0_0/3%)] transition-colors rounded"
          >
            <div className="flex items-start gap-3 min-w-0">
              <span
                className="text-sm font-medium shrink-0 mt-0.5"
                style={{ color: thought.agentColor }}
              >
                {thought.agentName}
              </span>
              <CopyableId id={thought.id} className="text-[10px] mt-0.5" />
              <p className="text-sm text-[oklch(0.62_0_0)] leading-relaxed flex-1 min-w-0 line-clamp-2">
                {thought.conclusion || thought.reasoning}
              </p>
              <span className="mono text-sm text-[oklch(0.40_0_0)] shrink-0">
                {formatRelativeTime(thought.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Section wrapper ───────────────────────────────────────── */

function Section({
  title,
  count,
  accentClass,
  bgClass,
  children,
}: {
  title: string;
  count?: number;
  accentClass: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border border-[oklch(1_0_0/12%)] ${bgClass} overflow-hidden`}
    >
      <div className={`border-l-2 ${accentClass}`}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[oklch(1_0_0/8%)]">
          <h3 className="text-sm text-[oklch(0.58_0_0)] uppercase tracking-widest font-semibold">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="mono text-sm text-amber-400/80 font-medium">
              {count}
            </span>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ── Main HomeView ─────────────────────────────────────────── */

export function HomeView({ clanState }: HomeViewProps) {
  const allMessages = useMemo(
    () => extractCommsMessages(clanState),
    [clanState],
  );

  const connectedCount = useMemo(
    () => AGENTS.filter((a) => clanState[a.id]?.connected).length,
    [clanState],
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-[oklch(0.78_0_0)] tracking-wide">
            Command Center
          </h2>
          <span className="mono text-sm text-[oklch(0.50_0_0)]">
            {connectedCount}/{AGENTS.length} agents online
          </span>
        </div>

        {/* Priority: Requests for Gabriel */}
        <RequestsForGabriel messages={allMessages} />

        {/* Drafts Review Panel */}
        <DraftsPanel />

        {/* Ability Requests */}
        <AbilityRequestsSection clanState={clanState} />

        {/* Latest Comms */}
        <LatestComms messages={allMessages} />

        {/* Recent Thoughts */}
        <RecentThoughts clanState={clanState} />
      </div>
    </div>
  );
}
