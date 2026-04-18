"use client";

import { useMemo } from "react";
import type { MartyState, AbilityRequest } from "@/lib/types";
import { CopyableId } from "@/components/copyable-id";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AbilitiesTabProps {
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

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type CapabilityStatus =
  | "connected"
  | "disconnected"
  | "errored"
  | "stub"
  | "unknown";

interface Capability {
  name: string;
  description: string;
  status: CapabilityStatus;
  capability: string;
}

interface CapabilityCategory {
  label: string;
  color: string;
  items: Capability[];
}

const CAPABILITY_MAP: CapabilityCategory[] = [
  {
    label: "Communication",
    color: "#93c5fd",
    items: [
      {
        name: "Discord",
        description: "messages, threads, DMs",
        status: "unknown",
        capability: "discord-adapter",
      },
      {
        name: "Telegram",
        description: "messages, channels",
        status: "unknown",
        capability: "telegram-adapter",
      },
      {
        name: "Twitter / X",
        description: "posts, replies, DMs",
        status: "unknown",
        capability: "twitter-adapter",
      },
    ],
  },
  {
    label: "Media",
    color: "#fde68a",
    items: [
      {
        name: "Image generation",
        description: "Higgsfield, Fal AI",
        status: "unknown",
        capability: "image-generation",
      },
      {
        name: "Video generation",
        description: "Higgsfield video",
        status: "unknown",
        capability: "video-generation",
      },
      {
        name: "Voice synthesis",
        description: "TTS output",
        status: "unknown",
        capability: "voice-synthesis",
      },
    ],
  },
  {
    label: "Integrations",
    color: "#86efac",
    items: [
      {
        name: "Google Workspace",
        description: "Gmail, Calendar",
        status: "unknown",
        capability: "google-workspace",
      },
      {
        name: "Browser sessions",
        description: "Playwright automation",
        status: "unknown",
        capability: "browser-sessions",
      },
    ],
  },
  {
    label: "Cognition",
    color: "#c4b5fd",
    items: [
      {
        name: "Claude Service",
        description: "AI inference engine",
        status: "unknown",
        capability: "claude-service",
      },
      {
        name: "Memory system",
        description: "SQLite episodic + semantic",
        status: "unknown",
        capability: "memory-system",
      },
      {
        name: "Goals system",
        description: "autonomous goal tracking",
        status: "unknown",
        capability: "goals-system",
      },
    ],
  },
];

const STATUS_STYLES: Record<
  CapabilityStatus,
  { label: string; color: string; dot: string }
> = {
  connected: { label: "connected", color: "#86efac", dot: "bg-[#86efac]" },
  disconnected: {
    label: "disconnected",
    color: "#71717a",
    dot: "bg-[#71717a]",
  },
  errored: { label: "errored", color: "#f87171", dot: "bg-[#f87171]" },
  stub: { label: "stub", color: "#fde68a", dot: "bg-[#fde68a]" },
  unknown: { label: "unknown", color: "#52525b", dot: "bg-[#52525b]" },
};

const REQUEST_STATUS_STYLES: Record<
  AbilityRequest["status"],
  { label: string; color: string }
> = {
  open: { label: "open", color: "#fde68a" },
  addressed: { label: "addressed", color: "#86efac" },
  dismissed: { label: "dismissed", color: "#71717a" },
};

function resolveStatus(
  capability: string,
  requests: AbilityRequest[],
): CapabilityStatus {
  // Check for addressed requests (approved capabilities)
  const hasAddressedRequest = requests.some(
    (r) => r.capability === capability && r.status === "addressed",
  );
  if (hasAddressedRequest) return "connected";

  // If there's an open request for this capability, it's disconnected/missing
  const hasOpenRequest = requests.some(
    (r) => r.capability === capability && r.status === "open",
  );
  if (hasOpenRequest) return "disconnected";

  return "unknown";
}

function CapabilityRow({
  item,
  categoryColor,
  requests,
}: {
  item: Capability;
  categoryColor: string;
  requests: AbilityRequest[];
}) {
  const status = resolveStatus(item.capability, requests);
  const style = STATUS_STYLES[status];

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[oklch(1_0_0/8%)]">
      {/* Status dot */}
      <div
        className={`w-2 h-2 rounded-full shrink-0 ${style.dot} ${
          status === "connected" ? "shadow-[0_0_6px_currentColor]" : ""
        }`}
        style={
          status === "connected" ? { boxShadow: `0 0 6px ${style.color}` } : {}
        }
      />

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <span className="text-base text-[oklch(0.80_0_0)]">{item.name}</span>
        <span className="ml-2 text-sm text-[oklch(0.50_0_0)]">
          {item.description}
        </span>
      </div>

      {/* Status label */}
      <span className="mono text-xs shrink-0" style={{ color: style.color }}>
        {style.label}
      </span>
    </div>
  );
}

function AbilityRequestCard({ request }: { request: AbilityRequest }) {
  const statusStyle =
    REQUEST_STATUS_STYLES[request.status] ?? REQUEST_STATUS_STYLES.open;

  return (
    <div className="rounded-lg border border-[oklch(1_0_0/8%)] bg-[oklch(1_0_0/3%)] p-4 space-y-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              color: statusStyle.color,
              backgroundColor: statusStyle.color + "18",
            }}
          >
            {statusStyle.label}
          </span>
          <Badge
            variant="outline"
            className="text-xs border-[oklch(1_0_0/12%)] text-[oklch(0.45_0_0)]"
          >
            {request.capability}
          </Badge>
        </div>
        <CopyableId id={request.id} />
      </div>

      {/* Description */}
      <p className="text-base text-[oklch(0.75_0_0)] leading-relaxed">
        {request.description}
      </p>

      {/* Reason */}
      {request.reason && (
        <p className="text-sm text-[oklch(0.55_0_0)] italic leading-relaxed border-l-2 border-[oklch(1_0_0/14%)] pl-3">
          {request.reason}
        </p>
      )}

      {/* Timestamps */}
      <div className="flex items-center gap-3 mono text-sm text-[oklch(0.45_0_0)]">
        <span>requested {formatDate(request.createdAt)}</span>
        {request.addressedAt && (
          <span>· addressed {formatTimestamp(request.addressedAt)}</span>
        )}
      </div>
    </div>
  );
}

export function AbilitiesTab({ state }: AbilitiesTabProps) {
  const { abilityRequests, connected } = state;

  const openRequests = useMemo(
    () => abilityRequests.filter((r) => r.status === "open"),
    [abilityRequests],
  );

  const sortedRequests = useMemo(
    () => [...abilityRequests].sort((a, b) => b.createdAt - a.createdAt),
    [abilityRequests],
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Capability map */}
      <div className="w-96 shrink-0 border-r border-[oklch(1_0_0/10%)] overflow-y-auto">
        <div className="p-6 space-y-8">
          <div className="flex items-center gap-3">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
              Capability map
            </h3>
            {!connected && (
              <span className="mono text-sm text-[oklch(0.45_0_0)]">
                offline
              </span>
            )}
          </div>

          {CAPABILITY_MAP.map((category) => (
            <div key={category.label}>
              <h4
                className="text-xs font-medium mb-3 uppercase tracking-wider"
                style={{ color: category.color }}
              >
                {category.label}
              </h4>
              <div>
                {category.items.map((item) => (
                  <CapabilityRow
                    key={item.capability}
                    item={item}
                    categoryColor={category.color}
                    requests={abilityRequests}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Ability requests */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-sm text-[oklch(0.50_0_0)] uppercase tracking-widest font-semibold">
              Ability requests
            </h3>
            {openRequests.length > 0 && (
              <span className="text-xs text-[#fde68a] animate-pulse font-medium">
                {openRequests.length} open
              </span>
            )}
          </div>

          {sortedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[oklch(0.45_0_0)]">
              <div className="text-4xl mb-3 opacity-15">◌</div>
              <p className="mono text-base">
                {connected ? "no ability requests yet" : "agent is offline"}
              </p>
              <p className="mono text-sm mt-2 text-[oklch(0.40_0_0)] text-center max-w-48 leading-relaxed">
                requests appear when the agent tries to do something it
                can&apos;t
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Open requests first */}
              {[
                ...sortedRequests.filter((r) => r.status === "open"),
                ...sortedRequests.filter((r) => r.status !== "open"),
              ].map((request) => (
                <AbilityRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
