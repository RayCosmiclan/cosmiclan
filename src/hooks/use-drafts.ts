"use client";

import { useCallback, useEffect, useState } from "react";
import type { Draft } from "@/lib/types";

const POLL_INTERVAL = 30_000; // 30 seconds

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = useCallback(async () => {
    try {
      const response = await fetch("/api/drafts");
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts ?? []);
      }
    } catch {
      // API unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  const approveDraft = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/drafts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        });
        if (res.ok) {
          await loadDrafts();
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    [loadDrafts],
  );

  const rejectDraft = useCallback(
    async (id: string, reason: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/drafts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected", rejectionReason: reason }),
        });
        if (res.ok) {
          await loadDrafts();
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    [loadDrafts],
  );

  useEffect(() => {
    loadDrafts();
    const interval = setInterval(loadDrafts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadDrafts]);

  return { drafts, loading, refresh: loadDrafts, approveDraft, rejectDraft };
}
