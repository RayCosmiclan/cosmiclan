"use client";

import { useMemo, useState } from "react";
import { getAgent } from "@/lib/agents";
import { CopyableId } from "@/components/copyable-id";
import { useDrafts } from "@/hooks/use-drafts";
import type { Draft } from "@/lib/types";

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
  });
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "text-sky-400",
  linkedin: "text-blue-500",
  instagram: "text-pink-500",
  blog: "text-emerald-500",
};

const PLATFORM_BG: Record<string, string> = {
  twitter: "bg-sky-400/10",
  linkedin: "bg-blue-500/10",
  instagram: "bg-pink-500/10",
  blog: "bg-emerald-500/10",
};

function RejectDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="px-4 py-3 border-t border-[oklch(1_0_0/8%)] bg-red-500/[0.04] space-y-2">
      <p className="text-xs text-[oklch(0.58_0_0)]">
        Reason for rejection (optional):
      </p>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Not the right tone, timing, etc."
        className="w-full px-3 py-1.5 rounded text-sm bg-[oklch(1_0_0/5%)] border border-[oklch(1_0_0/12%)] text-[oklch(0.78_0_0)] placeholder:text-[oklch(0.38_0_0)] focus:outline-none focus:border-[oklch(1_0_0/20%)]"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") onConfirm(reason || "Rejected by Gabriel");
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(reason || "Rejected by Gabriel")}
          className="flex-1 px-3 py-1.5 rounded text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
        >
          Confirm Reject
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded text-sm font-medium bg-[oklch(1_0_0/6%)] text-[oklch(0.55_0_0)] hover:bg-[oklch(1_0_0/10%)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function DraftCard({
  draft,
  onApprove,
  onReject,
}: {
  draft: Draft;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}) {
  const agent = getAgent(draft.agentId);
  const platformColor = PLATFORM_COLORS[draft.platform] ?? "text-gray-500";
  const platformBg = PLATFORM_BG[draft.platform] ?? "bg-gray-500/10";
  const [actionLoading, setActionLoading] = useState<
    "approve" | "reject" | null
  >(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async () => {
    setActionLoading("approve");
    await onApprove(draft.id);
    setActionLoading(null);
  };

  const handleRejectConfirm = async (reason: string) => {
    setShowRejectDialog(false);
    setActionLoading("reject");
    await onReject(draft.id, reason);
    setActionLoading(null);
  };

  return (
    <div className="rounded-lg border border-[oklch(1_0_0/10%)] bg-[oklch(1_0_0/3%)] overflow-hidden hover:border-[oklch(1_0_0/14%)] transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[oklch(1_0_0/8%)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-sm font-medium shrink-0"
            style={{ color: agent.colorHex }}
          >
            {agent.name}
          </span>
          <div
            className={`px-2 py-0.5 rounded text-xs font-medium ${platformColor} ${platformBg}`}
          >
            {draft.platform}
          </div>
          <CopyableId id={draft.id} className="text-[10px]" />
        </div>
        <span className="mono text-sm text-[oklch(0.40_0_0)] shrink-0">
          {formatRelativeTime(draft.createdAt)}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {draft.title && (
          <h4 className="text-base font-semibold text-[oklch(0.80_0_0)]">
            {draft.title}
          </h4>
        )}
        <p className="text-sm text-[oklch(0.70_0_0)] leading-relaxed whitespace-pre-wrap">
          {draft.content}
        </p>

        {/* Metadata */}
        {draft.metadata && (
          <div className="space-y-2 text-sm">
            {draft.metadata.hashtags && draft.metadata.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draft.metadata.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[oklch(1_0_0/6%)] text-[oklch(0.55_0_0)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {draft.metadata.mentions && draft.metadata.mentions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {draft.metadata.mentions.map((mention) => (
                  <span key={mention} className="text-sky-400">
                    {mention}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div
          className={`text-xs px-2 py-1 rounded-sm w-fit font-medium ${
            draft.status === "pending"
              ? "bg-amber-500/20 text-amber-300"
              : draft.status === "approved"
                ? "bg-emerald-500/20 text-emerald-300"
                : draft.status === "rejected"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-gray-500/20 text-gray-300"
          }`}
        >
          {draft.status}
          {draft.rejectionReason && ` — ${draft.rejectionReason}`}
        </div>
      </div>

      {/* Actions (pending only) */}
      {draft.status === "pending" && !showRejectDialog && (
        <div className="px-4 py-3 border-t border-[oklch(1_0_0/8%)] flex gap-2">
          <button
            onClick={handleApprove}
            disabled={actionLoading !== null}
            className="flex-1 px-3 py-1.5 rounded text-sm font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={actionLoading !== null}
            className="flex-1 px-3 py-1.5 rounded text-sm font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === "reject" ? "Rejecting…" : "Reject"}
          </button>
        </div>
      )}

      {/* Reject dialog inline */}
      {draft.status === "pending" && showRejectDialog && (
        <RejectDialog
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}
    </div>
  );
}

/* ── Section wrapper (matches HomeView pattern) ─────────────── */

function Section({
  title,
  count,
  accentClass,
  bgClass,
  children,
}: {
  title: string;
  count?: number;
  accentClass: string;
  bgClass: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border border-[oklch(1_0_0/12%)] ${bgClass} overflow-hidden`}
    >
      <div className={`border-l-2 ${accentClass}`}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[oklch(1_0_0/8%)]">
          <h3 className="text-sm text-[oklch(0.58_0_0)] uppercase tracking-widest font-semibold">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="mono text-sm text-amber-400/80 font-medium">
              {count}
            </span>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* ── Main DraftsPanel ───────────────────────────────────────── */

export function DraftsPanel({ allDrafts: _ignored }: { allDrafts?: Draft[] }) {
  const { drafts, loading, approveDraft, rejectDraft } = useDrafts();

  const pendingDrafts = useMemo(
    () =>
      drafts
        .filter((d) => d.status === "pending")
        .sort(
          (a, b) =>
            (b.requestedAt ?? b.createdAt) - (a.requestedAt ?? a.createdAt),
        ),
    [drafts],
  );

  const reviewedDrafts = useMemo(
    () =>
      drafts
        .filter((d) => d.status !== "pending")
        .sort(
          (a, b) =>
            (b.approvedAt ?? b.createdAt) - (a.approvedAt ?? a.createdAt),
        )
        .slice(0, 5),
    [drafts],
  );

  const handleApprove = async (id: string) => {
    await approveDraft(id);
  };

  const handleReject = async (id: string, reason: string) => {
    await rejectDraft(id, reason);
  };

  if (loading) {
    return (
      <Section
        title="Drafts Review"
        accentClass="border-l-rose-500/60"
        bgClass="bg-rose-500/[0.02]"
      >
        <p className="mono text-sm text-[oklch(0.45_0_0)] py-5 text-center">
          Loading drafts…
        </p>
      </Section>
    );
  }

  if (pendingDrafts.length === 0 && reviewedDrafts.length === 0) {
    return (
      <Section
        title="Drafts Review"
        accentClass="border-l-rose-500/60"
        bgClass="bg-rose-500/[0.02]"
      >
        <p className="mono text-sm text-[oklch(0.45_0_0)] py-5 text-center">
          No drafts yet. Agents will submit posts for review here.
        </p>
      </Section>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Drafts */}
      {pendingDrafts.length > 0 && (
        <Section
          title="Pending Drafts"
          count={pendingDrafts.length}
          accentClass="border-l-rose-500/60"
          bgClass="bg-rose-500/[0.02]"
        >
          <div className="p-4 space-y-3">
            {pendingDrafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Recent Reviews */}
      {reviewedDrafts.length > 0 && (
        <Section
          title="Recent Reviews"
          accentClass="border-l-gray-500/50"
          bgClass="bg-gray-500/[0.02]"
        >
          <div className="p-4 space-y-3">
            {reviewedDrafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
