export default function Page() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">Inbox</h1>
      <p className="mt-2 text-sm text-[var(--muted-fg)]">
        Pending items from WhatsApp, Gmail, Outlook, and agents.
      </p>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-8 text-center text-sm text-[var(--muted-fg)]">
        Stream D will wire the inbox list + reply UI here.
      </div>
    </div>
  );
}
