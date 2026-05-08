"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { AGENTS } from "@/lib/agents";
import { useClanStatus } from "@/hooks/use-clan-status";

export function AgentSwitcher({ activeId }: { activeId: string }) {
  const clanState = useClanStatus();

  return (
    <div className="flex items-center gap-1 px-4 py-1.5 border-b border-[oklch(1_0_0/8%)] bg-[oklch(0.10_0.005_260/80%)] backdrop-blur-sm shrink-0 overflow-x-auto">
      {AGENTS.map((agent) => {
        const isActive = agent.id === activeId;
        const isConnected = clanState[agent.id]?.connected ?? false;
        return (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="relative flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-[oklch(1_0_0/6%)] shrink-0"
            style={
              isActive
                ? {
                    backgroundColor: `oklch(from ${agent.colorHex} l c h / 12%)`,
                    boxShadow: `inset 0 0 0 1px ${agent.colorHex}40`,
                  }
                : undefined
            }
          >
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
                sizes="20px"
                className="object-cover"
                unoptimized={agent.image.startsWith("http")}
              />
            </div>
            <span
              className="text-sm font-medium transition-colors"
              style={{
                color: isActive ? agent.colorHex : "oklch(0.55 0 0)",
              }}
            >
              {agent.name}
            </span>
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: isConnected ? "#34d399" : "oklch(0.3 0 0)",
                boxShadow: isConnected ? "0 0 4px #34d399" : "none",
              }}
            />
            {isActive && (
              <motion.div
                layoutId="agent-switcher-active"
                className="absolute bottom-0 left-2 right-2 h-px"
                style={{ backgroundColor: agent.colorHex }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
