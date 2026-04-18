"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentSocket } from "@/hooks/use-agent-socket";
import { useTimeline } from "@/hooks/use-timeline";
import { StatusBar } from "@/components/status-bar";
import { AgentSelector } from "@/components/agent-selector";
import { FleetOverview } from "@/components/fleet-overview";
import { HomeView } from "@/components/home-view";
import { TimelineScrubber } from "@/components/timeline-scrubber";
import { MindTab } from "@/components/tabs/mind";
import { EmotionsTab } from "@/components/tabs/emotions";
import { DrivesTab } from "@/components/tabs/drives";
import { MemoryTab } from "@/components/tabs/memory";
import { ActionsTab } from "@/components/tabs/actions";
import { SoulTab } from "@/components/tabs/soul";
import { AbilitiesTab } from "@/components/tabs/abilities";
import { CommsTab } from "@/components/tabs/comms";
import { useFleetStatus } from "@/hooks/use-fleet-status";
import { DEFAULT_AGENT } from "@/lib/agents";
import type { AgentConfig, MartyState } from "@/lib/types";

const TABS = [
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("mind");
  const [activeAgent, setActiveAgent] = useState<AgentConfig>(DEFAULT_AGENT);
  const [fleetOpen, setFleetOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, boolean>
  >({});

  // Fleet state for home view (connects to all agent WS ports)
  const fleetState = useFleetStatus();

  // Live state from WebSocket for the active agent
  const liveState = useAgentSocket(activeAgent);

  // Track connection status for active agent
  useEffect(() => {
    setConnectionStatus((prev) => ({
      ...prev,
      [activeAgent.id]: liveState.connected,
    }));
  }, [activeAgent.id, liveState.connected]);

  // Timeline scrubber
  const { isLive, scrubTimestamp, displayState, scrubTo, snapToLive } =
    useTimeline(liveState);

  const rootRef = useRef<HTMLDivElement>(null);

  // Mood-reactive + agent-themed CSS vars
  useEffect(() => {
    if (!rootRef.current) return;
    const valence = displayState.emotionalState?.mood?.valence ?? 0;
    const arousal = displayState.emotionalState?.mood?.arousal ?? 0.5;

    // Blend mood hue with agent's base hue (70% mood, 30% agent)
    const moodHue = 220 + valence * -180;
    const blendedHue = moodHue * 0.7 + activeAgent.colorHue * 0.3;
    const chroma = (0.02 + Math.abs(valence) * 0.06).toFixed(3);
    const speed = `${Math.max(2, 8 - arousal * 6).toFixed(1)}s`;

    rootRef.current.style.setProperty("--mood-hue", blendedHue.toFixed(0));
    rootRef.current.style.setProperty("--mood-chroma", chroma);
    rootRef.current.style.setProperty("--arousal-speed", speed);
  }, [displayState.emotionalState, activeAgent.colorHue]);

  const handleSelectAgent = useCallback(
    (agent: AgentConfig) => {
      if (agent.id === activeAgent.id && !homeOpen) return;
      setActiveAgent(agent);
      setFleetOpen(false);
      setHomeOpen(false);
      // Snap to live when switching agents -- past state is not transferable
      snapToLive();
    },
    [activeAgent.id, homeOpen, snapToLive],
  );

  const handleToggleFleet = useCallback(() => {
    setFleetOpen((prev) => !prev);
  }, []);

  const handleToggleHome = useCallback(() => {
    setHomeOpen((prev) => !prev);
  }, []);

  return (
    <div ref={rootRef} className="mood-bg flex flex-col h-dvh overflow-hidden">
      {/* Agent selector strip */}
      <AgentSelector
        activeAgent={activeAgent}
        connectionStatus={connectionStatus}
        onSelect={handleSelectAgent}
        fleetOpen={fleetOpen}
        onToggleFleet={handleToggleFleet}
        homeOpen={homeOpen}
        onToggleHome={handleToggleHome}
      />

      {/* Fleet overview overlay */}
      <AnimatePresence>
        {fleetOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden shrink-0 border-b border-[oklch(1_0_0/6%)]"
          >
            <FleetOverview
              activeAgentId={activeAgent.id}
              onSelectAgent={handleSelectAgent}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional: Home view OR agent-specific view */}
      {homeOpen ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <HomeView fleetState={fleetState} onSelectAgent={handleSelectAgent} />
        </div>
      ) : (
        <>
          {/* Status bar */}
          <StatusBar
            state={displayState}
            connected={liveState.connected}
            agentName={activeAgent.name}
            agentColor={activeAgent.colorHex}
          />

          {/* Tab navigation + content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            <TabsList className="shrink-0 rounded-none border-b border-[oklch(1_0_0/8%)] bg-transparent h-10 px-4 justify-start gap-1">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-sm px-3 py-1.5 text-sm text-[oklch(0.45_0_0)] data-[state=active]:text-[oklch(0.88_0_0)] data-[state=active]:bg-[oklch(1_0_0/6%)] data-[state=active]:shadow-none hover:text-[oklch(0.65_0_0)] transition-colors"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 min-h-0 overflow-hidden relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${activeAgent.id}-${activeTab}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute inset-0 overflow-hidden"
                >
                  <TabContent
                    activeTab={activeTab}
                    state={displayState}
                    activeAgent={activeAgent}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </>
      )}

      {/* Timeline scrubber */}
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
