export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Connected channels
      </h1>
      <p className="text-sm text-[var(--muted-fg)]">
        Link external services so agents can read and send on your behalf.
      </p>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-6 text-sm text-[var(--muted-fg)]">
        WhatsApp, Gmail, Outlook connectors. Stream D.
      </div>
    </div>
  );
}
