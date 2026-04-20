export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Profile
      </h1>
      <p className="text-sm text-[var(--muted-fg)]">
        Your identity inside Cosmiclan. Used as sender label in agent
        conversations.
      </p>
      <form className="space-y-4">
        <label className="block">
          <span className="text-sm text-[var(--foreground)]">Display name</span>
          <input
            defaultValue="Gabriel Antony Xaviour"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="block">
          <span className="text-sm text-[var(--foreground)]">Avatar URL</span>
          <input
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--muted-fg)]"
          />
        </label>
        <button
          type="button"
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm text-white opacity-60"
          disabled
        >
          Save (wired by Stream D)
        </button>
      </form>
    </div>
  );
}
