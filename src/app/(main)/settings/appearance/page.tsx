import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        Appearance
      </h1>
      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-[var(--muted-fg)]">
          Theme
        </h2>
        <ThemeToggle />
      </section>
    </div>
  );
}
