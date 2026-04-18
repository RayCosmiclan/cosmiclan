export default function Page() {
  return (
    <div className="flex h-full flex-col p-3">
      <div className="mb-2 text-sm font-semibold text-[var(--foreground)]">
        Cosmicfleet
      </div>
      <div className="flex-1 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--muted-fg)]">
        Inbox popover — Stream D fills the list, Stream E wires the tray.
      </div>
    </div>
  );
}
