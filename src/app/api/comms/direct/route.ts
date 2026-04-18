import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "node:path";

export async function GET(req: NextRequest) {
  const agent = req.nextUrl.searchParams.get("agent");
  if (!agent) return NextResponse.json({ messages: [] });
  const db = new Database(
    path.join(process.env.HOME!, "Documents/agents/comms.db"),
    { readonly: true },
  );
  const messages = db
    .prepare(
      `SELECT id, sender, recipient, content, timestamp
       FROM messages
       WHERE channel IS NULL
         AND ((sender='gabriel' AND recipient=?) OR (sender=? AND recipient='gabriel'))
       ORDER BY timestamp ASC
       LIMIT 300`,
    )
    .all(agent, agent);
  db.close();
  return NextResponse.json({ messages });
}
