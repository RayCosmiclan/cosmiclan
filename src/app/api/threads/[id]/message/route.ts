import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";

function findAgent(id: string) {
  const norm = id.toLowerCase().replace(/\s+/g, "");
  return AGENTS.find(
    (a) => a.id === norm || a.name.toLowerCase().replace(/\s+/g, "") === norm,
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const agent = findAgent(String(body.agent ?? ""));
  if (!agent)
    return NextResponse.json({ error: "unknown agent" }, { status: 400 });

  try {
    const r = await fetch(
      `http://localhost:${agent.port}/api/threads/${encodeURIComponent(id)}/message`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: body.content }),
        signal: AbortSignal.timeout(8000),
      },
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
