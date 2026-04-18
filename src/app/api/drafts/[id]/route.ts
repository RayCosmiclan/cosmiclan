import { readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const DRAFTS_DIR = join(process.cwd(), "data", "drafts");

interface Draft {
  id: string;
  agentId: string;
  status: "pending" | "approved" | "rejected" | "posted";
  approvedAt?: number | null;
  rejectionReason?: string | null;
  [key: string]: unknown;
}

interface DraftsFile {
  drafts: Draft[];
}

async function findAndUpdateDraft(
  draftId: string,
  update: Partial<Draft>,
): Promise<Draft | null> {
  const files = await readdir(DRAFTS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  for (const file of jsonFiles) {
    const filePath = join(DRAFTS_DIR, file);
    try {
      const raw = await readFile(filePath, "utf-8");
      const data = JSON.parse(raw) as DraftsFile;

      if (!data.drafts || !Array.isArray(data.drafts)) continue;

      const idx = data.drafts.findIndex((d) => d.id === draftId);
      if (idx === -1) continue;

      // Update the draft
      data.drafts[idx] = { ...data.drafts[idx], ...update };
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      return data.drafts[idx];
    } catch {
      // Skip malformed files
    }
  }

  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body as {
      status: "approved" | "rejected";
      rejectionReason?: string;
    };

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'approved' or 'rejected'." },
        { status: 400 },
      );
    }

    const update: Partial<Draft> = {
      status,
      approvedAt: Date.now(),
      rejectionReason:
        status === "rejected"
          ? (rejectionReason ?? "Rejected by Gabriel")
          : null,
    };

    const updated = await findAndUpdateDraft(id, update);

    if (!updated) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft: updated });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
