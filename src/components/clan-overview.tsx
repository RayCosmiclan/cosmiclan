"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AGENTS } from "@/lib/agents";
import { CopyableId } from "@/components/copyable-id";
import { useClanStatus } from "@/hooks/use-clan-status";
import type { AgentConfig, MartyState } from "@/lib/types";

interface ClanOverviewProps {
  activeAgentId: string;
  onSelectAgent: (agent: AgentConfig) => void;
}

function getMoodColor(valence: number): string {
  if (valence > 0.6) return "#86efac";
  if (valence > 0.3) return "#6ee7b7";
  if (valence > -0.1) return "#94a3b8";
  if (valence > -0.4) return "#93c5fd";
  return "#f87171";
}

function MiniAgentCard({
  agent,
  state,
  isActive,
  onClick,
}: {
  agent: AgentConfig;
  state: MartyState;
  isActive: boolean;
  onClick: () => void;
}) {
  const dominantEmotion = useMemo(() => {
    if (!state.emotionalState?.activeEmotions?.length) return null;
    return [...state.emotionalState.activeEmotions].sort(
      (a, b) => b.intensity - a.intensity,
    )[0];
  }, [state.emotionalState]);

  const highestDrive = useMemo(() => {
    if (!state.driveState) return null;
    const drives = [
      state.driveState.social,
      state.driveState.achievement,
      state.driveState.curiosity,
      state.driveState.care,
      state.driveState.selfExpression,
    ];
    return drives.reduce((best, d) => (d.value > best.value ? d : best));
  }, [state.driveState]);

  const valence = state.emotionalState?.mood?.valence ?? 0;
  const moodColor = getMoodColor(valence);
  const lastThought =
    state.thoughts.length > 0
      ? state.thoughts[state.thoughts.length - 1]
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="relative rounded-lg border p-4 text-left transition-all hover:bg-[oklch(1_0_0/4%)] group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
      style={{
        borderColor: isActive ? agent.colorHex + "50" : "oklch(1 0 0 / 8%)",
        backgroundColor: isActive ? agent.colorHex + "08" : "transparent",
      }}
    >
      {/* Header: image + name + connection */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border"
          style={{ borderColor: agent.colorHex + "60" }}
        >
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="28px"
            unoptimized={agent.image.startsWith("http")}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: agent.colorHex }}>
          {agent.name}
        </span>
        <div className="flex-1" />
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: state.connected ? "#34d399" : "oklch(0.3 0 0)",
            boxShadow: state.connected ? "0 0 4px #34d399" : "none",
          }}
        />
      </div>

      {/* Mood dot + dominant emotion */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: state.connected ? moodColor : "oklch(0.2 0 0)",
            boxShadow: state.connected ? `0 0 4px ${moodColor}` : "none",
          }}
        />
        {dominantEmotion && state.connected ? (
          <span className="text-sm capitalize text-[oklch(0.62_0_0)]">
            {dominantEmotion.type}{" "}
            <span className="mono text-[oklch(0.50_0_0)]">
              {(dominantEmotion.intensity * 100).toFixed(0)}%
            </span>
          </span>
        ) : (
          <span className="mono text-sm text-[oklch(0.40_0_0)]">
            {state.connected ? "neutral" : "offline"}
          </span>
        )}
      </div>

      {/* Highest drive mini-bar */}
      {highestDrive && state.connected && (
        <div className="flex items-center gap-2 mb-1.5">
          <span className="mono text-sm text-[oklch(0.48_0_0)] capitalize w-14 truncate">
            {highestDrive.type}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-[oklch(1_0_0/10%)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(highestDrive.value * 100, 100)}%`,
                backgroundColor: agent.colorHex,
                opacity: 0.7,
              }}
            />
          </div>
        </div>
      )}

      {/* Last thought snippet */}
      {lastThought && state.connected ? (
        <div className="flex items-center gap-1.5 mt-1.5">
          <CopyableId id={lastThought.id} className="text-[10px]" />
          <p className="text-sm text-[oklch(0.50_0_0)] line-clamp-1 leading-relaxed">
            {(lastThought.payload as { reasoning: string }).reasoning}
          </p>
        </div>
      ) : (
        <p className="mono text-sm text-[oklch(0.38_0_0)] mt-1.5">
          {state.connected ? "waiting for thoughts..." : "no connection"}
        </p>
      )}

      {/* Active ring */}
      {isActive && (
        <motion.div
          layoutId="clan-active-ring"
          className="absolute inset-0 rounded-lg border-2 pointer-events-none"
          style={{ borderColor: agent.colorHex + "60" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        />
      )}
    </div>
  );
}

export function ClanOverview({
  activeAgentId,
  onSelectAgent,
}: ClanOverviewProps) {
  const clanState = useClanStatus();

  return (
    <div className="p-5 bg-[oklch(0.10_0.005_260/90%)] backdrop-blur-sm">
      <div className="grid grid-cols-4 gap-3 max-w-5xl mx-auto">
        {AGENTS.map((agent) => (
          <MiniAgentCard
            key={agent.id}
            agent={agent}
            state={clanState[agent.id]}
            isActive={agent.id === activeAgentId}
            onClick={() => onSelectAgent(agent)}
          />
        ))}
      </div>
    </div>
  );
}
