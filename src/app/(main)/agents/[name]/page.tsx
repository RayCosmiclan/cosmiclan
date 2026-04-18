"use client";

import { useParams } from "next/navigation";
import { AGENTS } from "@/lib/agents";
import { AgentView } from "@/components/AgentView";

export default function Page() {
  const { name } = useParams<{ name: string }>();
  const agent = AGENTS.find(
    (a) =>
      a.name.toLowerCase().replace(/\s+/g, "") === name?.toLowerCase() ||
      a.id === name?.toLowerCase(),
  );
  if (!agent) {
    return (
      <div className="p-6 text-sm text-[var(--muted-fg)]">Unknown agent.</div>
    );
  }
  return <AgentView agent={agent} />;
}
