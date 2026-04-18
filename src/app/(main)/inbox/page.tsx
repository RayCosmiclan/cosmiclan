import { InboxList } from "@/components/inbox/InboxList";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-1">Inbox</h1>
      <p className="text-sm text-[var(--muted-fg)] mb-6">
        WhatsApp, Gmail, Outlook, and agent requests.
      </p>
      <InboxList />
    </div>
  );
}
