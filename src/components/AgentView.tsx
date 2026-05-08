"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentSocket } from "@/hooks/use-agent-socket";
import { useTimeline } from "@/hooks/use-timeline";
import { StatusBar } from "@/components/status-bar";
import { AgentSwitcher } from "@/components/agent-switcher";
import { TimelineScrubber } from "@/components/timeline-scrubber";
import { AgentRoleOverview } from "@/components/agent-role-overview";
import { MindTab } from "@/components/tabs/mind";
import { EmotionsTab } from "@/components/tabs/emotions";
import { DrivesTab } from "@/components/tabs/drives";
import { MemoryTab } from "@/components/tabs/memory";
import { ActionsTab } from "@/components/tabs/actions";
import { SoulTab } from "@/components/tabs/soul";
import { AbilitiesTab } from "@/components/tabs/abilities";
import { CommsTab } from "@/components/tabs/comms";
import type { AgentConfig, MartyState } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "mind", label: "Mind" },
  { id: "emotions", label: "Emotions" },
  { id: "drives", label: "Drives" },
  { id: "memory", label: "Memory" },
  { id: "actions", label: "Actions" },
  { id: "soul", label: "Soul" },
  { id: "abilities", label: "Abilities" },
  { id: "comms", label: "Comms" },
];

function TabContent({
  activeTab,
  state,
  activeAgent,
}: {
  activeTab: string;
  state: MartyState;
  activeAgent: AgentConfig;
}) {
  switch (activeTab) {
    case "overview":
      return <AgentRoleOverview agent={activeAgent} state={state} />;
    case "mind":
      return <MindTab state={state} />;
    case "emotions":
      return <EmotionsTab state={state} />;
    case "drives":
      return <DrivesTab state={state} />;
    case "memory":
      return <MemoryTab state={state} />;
    case "actions":
      return <ActionsTab state={state} />;
    case "soul":
      return <SoulTab state={state} />;
    case "abilities":
      return <AbilitiesTab state={state} />;
    case "comms":
      return <CommsTab activeAgent={activeAgent} />;
    default:
      return null;
  }
}

export function AgentView({ agent }: { agent: AgentConfig }) {
  const [activeTab, setActiveTab] = useState("overview");
  const liveState = useAgentSocket(agent);
  const { displayState, isLive, scrubTimestamp, scrubTo, snapToLive } =
    useTimeline(liveState);

  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const valence = displayState.emotionalState?.mood?.valence ?? 0;
    const arousal = displayState.emotionalState?.mood?.arousal ?? 0.5;
    const moodHue = 220 + valence * -180;
    const blendedHue = moodHue * 0.7 + agent.colorHue * 0.3;
    const chroma = (0.02 + Math.abs(valence) * 0.06).toFixed(3);
    const speed = `${Math.max(2, 8 - arousal * 6).toFixed(1)}s`;
    rootRef.current.style.setProperty("--mood-hue", blendedHue.toFixed(0));
    rootRef.current.style.setProperty("--mood-chroma", chroma);
    rootRef.current.style.setProperty("--arousal-speed", speed);
  }, [displayState.emotionalState, agent.colorHue]);

  const handleTabChange = useCallback((val: string) => {
    setActiveTab(val);
  }, []);

  return (
    <div ref={rootRef} className="mood-bg flex h-full flex-col overflow-hidden">
      <AgentSwitcher activeId={agent.id} />
      <StatusBar
        state={displayState}
        connected={liveState.connected}
        agentName={agent.name}
        agentColor={agent.colorHex}
        agentImage={agent.image}
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <TabsList className="h-10 shrink-0 justify-start gap-1 rounded-none border-b border-[oklch(1_0_0/8%)] bg-transparent px-4">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-sm px-3 py-1.5 text-sm text-[oklch(0.45_0_0)] transition-colors hover:text-[oklch(0.65_0_0)] data-[state=active]:bg-[oklch(1_0_0/6%)] data-[state=active]:text-[oklch(0.88_0_0)] data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${agent.id}-${activeTab}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute inset-0 overflow-hidden"
            >
              <TabContent
                activeTab={activeTab}
                state={displayState}
                activeAgent={agent}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>

      <TimelineScrubber
        events={liveState.events}
        isLive={isLive}
        scrubTimestamp={scrubTimestamp}
        onScrub={scrubTo}
        onSnapToLive={snapToLive}
      />
    </div>
  );
}
