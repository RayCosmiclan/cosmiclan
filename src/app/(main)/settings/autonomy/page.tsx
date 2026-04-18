export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Autonomy rules
      </h1>
      <p className="text-sm text-[var(--muted-fg)]">
        Control what agents can do autonomously vs. what requires your approval.
      </p>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-6 text-sm text-[var(--muted-fg)]">
        Per-agent autonomy gates — Stream D.
      </div>
    </div>
  );
}
