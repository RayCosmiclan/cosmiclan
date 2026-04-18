import { NextRequest, NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const channelId = String(body.channel ?? "");
  // Simplified v1: write to Marty only; channel polling on other agents picks it up
  const marty = AGENTS.find((a) => a.id === "marty")!;
  const r = await fetch(`http://localhost:${marty.port}/api/send`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sender: "gabriel",
      content: body.content,
      channel: channelId,
    }),
  });
  const j = await r.json();
  return NextResponse.json(j, { status: r.status });
}
