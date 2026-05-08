export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Clan</h1>
      <p className="text-sm text-[var(--muted-fg)]">
        Global settings that apply to all 8 agents.
      </p>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-6 text-sm text-[var(--muted-fg)]">
        Clan-wide config (quiet hours, budget caps, heartbeat rate). Stream D.
      </div>
    </div>
  );
}
