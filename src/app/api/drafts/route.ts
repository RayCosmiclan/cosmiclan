import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const DRAFTS_DIR = join(process.cwd(), "data", "drafts");

export async function GET() {
  try {
    const files = await readdir(DRAFTS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const allDrafts = [];

    for (const file of jsonFiles) {
      try {
        const raw = await readFile(join(DRAFTS_DIR, file), "utf-8");
        const data = JSON.parse(raw);
        if (data.drafts && Array.isArray(data.drafts)) {
          allDrafts.push(...data.drafts);
        }
      } catch {
        // Skip malformed files
      }
    }

    return NextResponse.json({ drafts: allDrafts });
  } catch {
    return NextResponse.json({ drafts: [] });
  }
}
