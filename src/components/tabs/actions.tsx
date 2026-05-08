"use client";

import { useMemo, useState } from "react";
import type { MartyState, OutgoingAction } from "@/lib/types";
import { CopyableId } from "@/components/copyable-id";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActionsTabProps {
  state: MartyState;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

const ACTION_TYPE_COLORS: Record<string, string> = {
  respond: "#86efac",
  post: "#93c5fd",
  dm: "#f9a8d4",
  create_media: "#fde68a",
  write_blog: "#c4b5fd",
  none: "#71717a",
};

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: "#86efac",
  twitter: "#7dd3fc",
  telegram: "#6ee7b7",
  linkedin: "#fbbf24",
};

function actionTypeColor(type: string | undefined): string {
  if (!type) return "#94a3b8";
  return ACTION_TYPE_COLORS[type.toLowerCase()] ?? "#94a3b8";
}

function channelColor(channel: string | undefined): string {
  if (!channel) return "#94a3b8";
  return CHANNEL_COLORS[channel.toLowerCase()] ?? "#94a3b8";
}

type ActionEvent = MartyState["actions"][number];

function ActionRow({ event }: { event: ActionEvent }) {
  const action = event.payload as OutgoingAction & {
    success?: boolean;
    blockedReason?: string;
  };
  const isBlocked = !!action.blockedReason;
  const isFailed = action.success === false && !isBlocked;
  const isSuccess = action.success === true;

  return (
    <div
      className={`group py-4 border-b border-[oklch(1_0_0/8%)] px-3 -mx-3 rounded transition-colors hover:bg-[oklch(1_0_0/2%)] ${
        isBlocked ? "border-l-2 border-l-[#f87171]/40 -ml-2 pl-2" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="mono text-sm text-[oklch(0.45_0_0)]">
          {formatTimestamp(event.timestamp)}
        </span>
        <CopyableId id={event.id} />

        {/* Action type */}
        <span
          className="text-xs px-1.5 py-0.5 rounded capitalize"
          style={{
            color: actionTypeColor(action.type),
            backgroundColor: actionTypeColor(action.type) + "18",
          }}
        >
          {action.type}
        </span>

        {/* Channel */}
        {action.channel && (
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: channelColor(action.channel) + "40",
              color: channelColor(action.channel),
            }}
          >
            {action.channel}
          </Badge>
        )}

        {/* Status */}
        {isBlocked && (
          <span className="text-xs text-[#f87171] font-medium">⊘ blocked</span>
        )}
        {isFailed && (
          <span className="text-xs text-[#fb923c] font-medium">✗ failed</span>
        )}
        {isSuccess && <span className="text-xs text-[#86efac]">✓ sent</span>}
      </div>

      {/* Content */}
      {action.content && action.type !== "none" && (
        <p className="text-base text-[oklch(0.72_0_0)] leading-relaxed mb-2 line-clamp-3">
          {action.content}
        </p>
      )}

      {/* Block reason */}
      {isBlocked && action.blockedReason && (
        <div className="rounded p-2 bg-[#f87171]/8 border border-[#f87171]/20 mb-2">
          <span className="mono text-xs text-[#f87171]">blocked: </span>
          <span className="text-sm text-[oklch(0.62_0_0)]">
            {action.blockedReason}
          </span>
        </div>
      )}

      {/* Linked IDs */}
      <div className="flex items-center gap-3 flex-wrap">
        {action.goalId && (
          <div className="flex items-center gap-1">
            <span className="mono text-sm text-[oklch(0.48_0_0)]">goal</span>
            <CopyableId id={action.goalId} />
          </div>
        )}
        {event.type === "action:completed" && (
          <span className="mono text-sm text-[oklch(0.45_0_0)]">completed</span>
        )}
      </div>
    </div>
  );
}

export function ActionsTab({ state }: ActionsTabProps) {
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const { actions, connected } = state;

  const sortedActions = useMemo(() => [...actions].reverse(), [actions]);

  const filteredActions = useMemo(
    () =>
      showBlockedOnly
        ? sortedActions.filter(
            (a) =>
              !!(a.payload as OutgoingAction & { blockedReason?: string })
                .blockedReason,
          )
        : sortedActions,
    [sortedActions, showBlockedOnly],
  );

  const blockedCount = useMemo(
    () =>
      actions.filter(
        (a) =>
          !!(a.payload as OutgoingAction & { blockedReason?: string })
            .blockedReason,
      ).length,
    [actions],
  );

  const sentCount = useMemo(
    () =>
      actions.filter(
        (a) =>
          (a.payload as OutgoingAction & { success?: boolean }).success ===
          true,
      ).length,
    [actions],
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main action log */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6">
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
              Action log
            </h3>
            <span className="mono text-sm text-[oklch(0.48_0_0)]">
              {actions.length} total
            </span>
            <button
              onClick={() => setShowBlockedOnly((v) => !v)}
              className={`mono text-xs px-2 py-0.5 rounded border transition-colors ${
                showBlockedOnly
                  ? "border-[#f87171]/60 text-[#f87171] bg-[#f87171]/10"
                  : "border-[oklch(1_0_0/12%)] text-[oklch(0.4_0_0)] hover:border-[oklch(1_0_0/20%)]"
              }`}
            >
              guardrail blocks only ({blockedCount})
            </button>
          </div>

          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[oklch(0.45_0_0)]">
              <div className="text-4xl mb-3 opacity-15">◉</div>
              <p className="mono text-base">
                {!connected
                  ? "agent is offline"
                  : showBlockedOnly
                    ? "no blocked actions"
                    : "no actions yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredActions.map((event) => (
                <ActionRow key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Right: Rate limit panel */}
      <div className="w-64 shrink-0 border-l border-[oklch(1_0_0/10%)] flex flex-col">
        <div className="p-5 border-b border-[oklch(1_0_0/10%)]">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
            Session stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[oklch(0.58_0_0)]">sent</span>
              <span className="mono text-sm text-[#86efac]">{sentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[oklch(0.58_0_0)]">blocked</span>
              <span className="mono text-sm text-[#f87171]">
                {blockedCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[oklch(0.58_0_0)]">total</span>
              <span className="mono text-sm text-[oklch(0.7_0_0)]">
                {actions.length}
              </span>
            </div>
          </div>
        </div>

        {/* By channel */}
        <div className="p-5 border-b border-[oklch(1_0_0/10%)]">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
            By channel
          </h3>
          <ChannelBreakdown actions={actions} />
        </div>

        {/* By type */}
        <div className="p-5">
          <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold mb-4">
            By type
          </h3>
          <TypeBreakdown actions={actions} />
        </div>
      </div>
    </div>
  );
}

function ChannelBreakdown({ actions }: { actions: MartyState["actions"] }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of actions) {
      const ch = (a.payload as OutgoingAction).channel ?? "none";
      c[ch] = (c[ch] ?? 0) + 1;
    }
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [actions]);

  if (counts.length === 0) {
    return <p className="mono text-sm text-[oklch(0.42_0_0)]">no data yet</p>;
  }

  return (
    <div className="space-y-2">
      {counts.map(([channel, count]) => (
        <div key={channel} className="flex items-center justify-between">
          <span
            className="text-xs capitalize"
            style={{ color: channelColor(channel) }}
          >
            {channel}
          </span>
          <span className="mono text-sm text-[oklch(0.58_0_0)]">{count}</span>
        </div>
      ))}
    </div>
  );
}

function TypeBreakdown({ actions }: { actions: MartyState["actions"] }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of actions) {
      const t = (a.payload as OutgoingAction).type ?? "unknown";
      c[t] = (c[t] ?? 0) + 1;
    }
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [actions]);

  if (counts.length === 0) {
    return <p className="mono text-sm text-[oklch(0.42_0_0)]">no data yet</p>;
  }

  return (
    <div className="space-y-2">
      {counts.map(([type, count]) => (
        <div key={type} className="flex items-center justify-between">
          <span
            className="text-xs capitalize"
            style={{ color: actionTypeColor(type) }}
          >
            {type}
          </span>
          <span className="mono text-sm text-[oklch(0.58_0_0)]">{count}</span>
        </div>
      ))}
    </div>
  );
}
