export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">#{id}</h1>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-8 text-sm text-[var(--muted-fg)]">
        Stream D wires channel messages + composer.
      </div>
    </div>
  );
}
