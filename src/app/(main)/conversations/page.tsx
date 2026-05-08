"use client";

import Link from "next/link";
import Image from "next/image";
import { AGENTS } from "@/lib/agents";

export default function Page() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-[var(--border)] px-6 py-5">
        <h1 className="text-xl font-semibold">Conversations</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-1">
          Pick an agent to see their threads of operation.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl space-y-2">
          {AGENTS.map((agent) => (
            <Link
              key={agent.id}
              href={`/conversations/${agent.id}`}
              className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover,oklch(1_0_0/2%))] px-4 py-3 transition-colors group"
            >
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border"
                style={{
                  borderColor: `oklch(from ${agent.colorHex} l c h / 30%)`,
                }}
              >
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized={agent.image.startsWith("http")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">{agent.name}</div>
                <div className="text-sm text-[var(--muted-fg)] truncate">
                  Port {agent.port}
                </div>
              </div>
              <div className="text-[var(--muted-fg)] opacity-0 group-hover:opacity-60 transition-opacity">
                →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
