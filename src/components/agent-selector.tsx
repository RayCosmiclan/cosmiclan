"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AGENTS } from "@/lib/agents";
import type { AgentConfig } from "@/lib/types";

interface AgentSelectorProps {
  activeAgent: AgentConfig;
  connectionStatus: Record<string, boolean>;
  onSelect: (agent: AgentConfig) => void;
  fleetOpen: boolean;
  onToggleFleet: () => void;
  homeOpen: boolean;
  onToggleHome: () => void;
}

export function AgentSelector({
  activeAgent,
  connectionStatus,
  onSelect,
  fleetOpen,
  onToggleFleet,
  homeOpen,
  onToggleHome,
}: AgentSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[oklch(1_0_0/12%)] bg-[oklch(0.10_0.005_260/95%)] backdrop-blur-sm shrink-0">
      {/* Agent pills */}
      <div className="flex items-center gap-1">
        {AGENTS.map((agent) => {
          const isActive = agent.id === activeAgent.id;
          const isConnected = connectionStatus[agent.id] ?? false;

          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent)}
              className="relative flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:bg-[oklch(1_0_0/6%)]"
              style={
                isActive
                  ? {
                      backgroundColor: agent.color.replace(")", " / 12%)"),
                      boxShadow: `inset 0 0 0 1px ${agent.colorHex}40`,
                    }
                  : undefined
              }
            >
              {/* Agent image */}
              <div
                className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border"
                style={{
                  borderColor: isActive
                    ? agent.colorHex + "80"
                    : "oklch(1 0 0 / 8%)",
                }}
              >
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  sizes="20px"
                  unoptimized={agent.image.startsWith("http")}
                />
              </div>

              {/* Name */}
              <span
                className="text-sm font-medium transition-colors"
                style={{
                  color: isActive ? agent.colorHex : "oklch(0.55 0 0)",
                }}
              >
                {agent.name}
              </span>

              {/* Connection dot */}
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: isConnected ? "#34d399" : "oklch(0.3 0 0)",
                  boxShadow: isConnected ? "0 0 4px #34d399" : "none",
                }}
              />

              {/* Active indicator underline */}
              {isActive && (
                <motion.div
                  layoutId="agent-active-indicator"
                  className="absolute bottom-0 left-2 right-2 h-px"
                  style={{ backgroundColor: agent.colorHex }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-[oklch(1_0_0/12%)] mx-1.5" />

      {/* View toggles */}
      <button
        onClick={onToggleHome}
        className={`mono text-xs px-2.5 py-1 rounded-md border transition-all ${
          homeOpen
            ? "border-[oklch(0.7_0.14_50/60%)] text-[oklch(0.75_0.14_50)] bg-[oklch(0.7_0.14_50/10%)]"
            : "border-[oklch(1_0_0/10%)] text-[oklch(0.45_0_0)] hover:border-[oklch(1_0_0/18%)] hover:text-[oklch(0.55_0_0)]"
        }`}
      >
        HOME
      </button>
      <button
        onClick={onToggleFleet}
        className={`mono text-xs px-2.5 py-1 rounded-md border transition-all ${
          fleetOpen
            ? "border-[oklch(0.7_0.12_250/60%)] text-[oklch(0.7_0.12_250)] bg-[oklch(0.7_0.12_250/10%)]"
            : "border-[oklch(1_0_0/10%)] text-[oklch(0.45_0_0)] hover:border-[oklch(1_0_0/18%)] hover:text-[oklch(0.55_0_0)]"
        }`}
      >
        FLEET
      </button>
    </div>
  );
}
