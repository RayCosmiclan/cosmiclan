import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";

function findAgent(id: string) {
  const norm = id.toLowerCase().replace(/\s+/g, "");
  return AGENTS.find(
    (a) => a.id === norm || a.name.toLowerCase().replace(/\s+/g, "") === norm,
  );
}

export async function GET(req: NextRequest) {
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

  const includeCompleted = url.searchParams.get("includeCompleted") === "true";
  try {
    const r = await fetch(
      `http://localhost:${agent.port}/api/threads?includeCompleted=${includeCompleted}`,
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

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    agent?: string;
    title?: string;
    content?: string;
  };
  if (!body.agent) {
    return NextResponse.json(
      { error: "agent is required" },
      { status: 400 },
    );
  }
  const agent = findAgent(body.agent);
  if (!agent)
    return NextResponse.json({ error: "unknown agent" }, { status: 400 });

  try {
    const r = await fetch(`http://localhost:${agent.port}/api/threads`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: body.title,
        content: body.content,
      }),
      signal: AbortSignal.timeout(5000),
    });
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
