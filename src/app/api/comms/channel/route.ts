import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "node:path";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ messages: [], channel: null });
  const db = new Database(
    path.join(process.env.HOME!, "Documents/agents/comms.db"),
    { readonly: true },
  );
  const messages = db
    .prepare(
      `SELECT id, sender, recipient, content, timestamp, channel
       FROM messages
       WHERE channel = ?
       ORDER BY timestamp ASC LIMIT 500`,
    )
    .all(id);
  const channel = db
    .prepare(`SELECT id, name, description, members FROM channels WHERE id=?`)
    .get(id);
  db.close();
  return NextResponse.json({ messages, channel });
}
