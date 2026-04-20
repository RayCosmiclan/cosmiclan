export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Notifications
      </h1>
      <p className="text-sm text-[var(--muted-fg)]">
        Configure how and when Cosmiclan alerts you to agent activity.
      </p>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-6 text-sm text-[var(--muted-fg)]">
        Notification preferences — Stream D.
      </div>
    </div>
  );
}
