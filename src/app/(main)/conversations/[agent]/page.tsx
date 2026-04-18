import { AGENTS } from "@/lib/agents";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ agent: string }>;
}) {
  const { agent } = await params;
  const a = AGENTS.find(
    (x) =>
      x.name.toLowerCase().replace(/\s+/g, "") === agent.toLowerCase() ||
      x.id === agent.toLowerCase(),
  );
  if (!a) notFound();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Conversation with {a.name}
      </h1>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-8 text-sm text-[var(--muted-fg)]">
        Stream D fills this in with comms.db thread + composer.
      </div>
    </div>
  );
}
