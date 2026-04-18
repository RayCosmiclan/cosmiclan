import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agentId = String(body.agent ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");
  const agent = AGENTS.find(
    (a) =>
      a.id === agentId || a.name.toLowerCase().replace(/\s+/g, "") === agentId,
  );
  if (!agent)
    return NextResponse.json({ error: "unknown agent" }, { status: 400 });
  const r = await fetch(`http://localhost:${agent.port}/api/send`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sender: "gabriel", content: body.content }),
  });
  const j = await r.json();
  return NextResponse.json(j, { status: r.status });
}
