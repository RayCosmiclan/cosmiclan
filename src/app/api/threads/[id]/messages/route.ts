import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";

function findAgent(id: string) {
  const norm = id.toLowerCase().replace(/\s+/g, "");
  return AGENTS.find(
    (a) => a.id === norm || a.name.toLowerCase().replace(/\s+/g, "") === norm,
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const agentParam = url.searchParams.get("agent");
  if (!agentParam) {
    return NextResponse.json(
      { error: "agent query param required" },
      { status: 400 },
    );
  }
  const agent = findAgent(agentParam);
  if (!agent)
    return NextResponse.json({ error: "unknown agent" }, { status: 400 });

  const limit = url.searchParams.get("limit") ?? "200";
  try {
    const r = await fetch(
      `http://localhost:${agent.port}/api/threads/${encodeURIComponent(id)}/messages?limit=${limit}`,
      { signal: AbortSignal.timeout(5000) },
    );
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: `agent ${agent.id} unreachable`,
        detail: (err as Error).message,
      },
      { status: 502 },
    );
  }
}
