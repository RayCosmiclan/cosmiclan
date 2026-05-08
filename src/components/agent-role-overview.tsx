"use client";

import Link from "next/link";
import type { ComponentProps, ComponentType } from "react";
import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  CircleDollarSign,
  ClipboardList,
  Code2,
  HeartPulse,
  Lightbulb,
  MessagesSquare,
  Palette,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import { useAgentThreads } from "@/hooks/use-threads";
import type { AgentConfig, MartyState } from "@/lib/types";

type RoleConfig = {
  title: string;
  mission: string;
  primaryLabel: string;
  primaryHref: string;
  lanes: Array<{
    label: string;
    value: string;
    detail: string;
    icon: ComponentType<ComponentProps<"svg">>;
  }>;
  metrics: Array<{
    label: string;
    value: (state: MartyState) => string;
    detail: string;
  }>;
};

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  marty: {
    title: "Chief of Staff Console",
    mission: "Coordinate the whole clan, route work, protect Gabriel's time.",
    primaryLabel: "Open Marty conversations",
    primaryHref: "/conversations/marty",
    lanes: [
      {
        label: "Inbox Routing",
        value: "Requests",
        detail: "Open decisions, approvals, and routing questions.",
        icon: MessagesSquare,
      },
      {
        label: "Clan Load",
        value: "Coverage",
        detail: "Which agent owns each active responsibility.",
        icon: ShieldCheck,
      },
      {
        label: "Follow-through",
        value: "Pending",
        detail: "Unclosed loops that should not return to Gabriel.",
        icon: BadgeCheck,
      },
    ],
    metrics: baseMetrics("coordination"),
  },
  stark: {
    title: "Revenue Command",
    mission: "Track money, business leverage, deals, pricing, and growth.",
    primaryLabel: "Open Stark conversations",
    primaryHref: "/conversations/stark",
    lanes: [
      {
        label: "Revenue Pipeline",
        value: "Deals",
        detail: "Active opportunities, bottlenecks, and next asks.",
        icon: CircleDollarSign,
      },
      {
        label: "Strategy",
        value: "Angles",
        detail: "Offers, pricing, positioning, and distribution paths.",
        icon: TrendingUp,
      },
      {
        label: "Execution",
        value: "Next bets",
        detail: "High-upside work Stark should dispatch or monitor.",
        icon: Target,
      },
    ],
    metrics: baseMetrics("business"),
  },
  ryuzaki: {
    title: "Research Lab",
    mission: "Turn research into clear judgment on AI, blockchain, longevity.",
    primaryLabel: "Open Ryu Zaki conversations",
    primaryHref: "/conversations/ryuzaki",
    lanes: [
      {
        label: "Research Queue",
        value: "Questions",
        detail: "Open investigations and evidence to collect.",
        icon: Search,
      },
      {
        label: "Synthesis",
        value: "Models",
        detail: "Ideas that need compression into decisions.",
        icon: Lightbulb,
      },
      {
        label: "Knowledge Base",
        value: "Memory",
        detail: "Durable learnings worth preserving.",
        icon: ClipboardList,
      },
    ],
    metrics: baseMetrics("research"),
  },
  donna: {
    title: "Life Systems",
    mission: "Health, fitness, languages, relationships, travel, and rhythm.",
    primaryLabel: "Open Donna conversations",
    primaryHref: "/conversations/donna",
    lanes: [
      {
        label: "Health",
        value: "Body",
        detail: "Fitness, food, sleep, and appearance systems.",
        icon: HeartPulse,
      },
      {
        label: "Languages",
        value: "Practice",
        detail: "Spanish, Mandarin, Japanese, Korean, French, Portuguese.",
        icon: UserRoundCheck,
      },
      {
        label: "Life Plans",
        value: "Travel",
        detail: "Relationships, experiences, and calendar realities.",
        icon: Plane,
      },
    ],
    metrics: baseMetrics("life"),
  },
  todo: {
    title: "Builder Bench",
    mission: "Find product ideas, dispatch builds, test fast, ship evidence.",
    primaryLabel: "Open Todo conversations",
    primaryHref: "/conversations/todo",
    lanes: [
      {
        label: "Ideas",
        value: "Backlog",
        detail: "Experiments worth turning into scoped work.",
        icon: Lightbulb,
      },
      {
        label: "Builds",
        value: "Workers",
        detail: "Codex tasks in flight and proofs returned.",
        icon: Code2,
      },
      {
        label: "Shipping",
        value: "Proof",
        detail: "Tests, demos, deployments, and next release steps.",
        icon: BadgeCheck,
      },
    ],
    metrics: baseMetrics("building"),
  },
  aryaa: {
    title: "Brand Room",
    mission: "Professional presence, social strategy, mystery, and authority.",
    primaryLabel: "Open Aryaa conversations",
    primaryHref: "/conversations/aryaa",
    lanes: [
      {
        label: "Content Calendar",
        value: "Posts",
        detail: "Narrative beats and platform-specific drafts.",
        icon: MessagesSquare,
      },
      {
        label: "Positioning",
        value: "Persona",
        detail: "Voice, status signals, and what not to explain.",
        icon: Sparkles,
      },
      {
        label: "Distribution",
        value: "Channels",
        detail: "LinkedIn, X, Instagram, and audience loops.",
        icon: TrendingUp,
      },
    ],
    metrics: baseMetrics("brand"),
  },
  jennie: {
    title: "Creative Studio",
    mission: "Fashion, photography, visual direction, art, and output quality.",
    primaryLabel: "Open Jennie conversations",
    primaryHref: "/conversations/jennie",
    lanes: [
      {
        label: "Shoots",
        value: "Concepts",
        detail: "Moodboards, looks, lighting, settings, and references.",
        icon: Camera,
      },
      {
        label: "Creative Direction",
        value: "Taste",
        detail: "Visual canon, styling decisions, and review notes.",
        icon: Palette,
      },
      {
        label: "Production",
        value: "Assets",
        detail: "Images, videos, edits, and publishing readiness.",
        icon: Sparkles,
      },
    ],
    metrics: baseMetrics("creative"),
  },
  ray: {
    title: "Rax Operations Console",
    mission: "Triage Rax reports, dispatch Codex workers, verify evidence.",
    primaryLabel: "Open Ray operations threads",
    primaryHref: "/conversations/ray",
    lanes: [
      {
        label: "Issue Intake",
        value: "/issues only",
        detail: "Ray watches the in-app issue tables; Notion is disabled.",
        icon: ClipboardList,
      },
      {
        label: "Worker Dispatch",
        value: "Codex first",
        detail: "Ray supervises; Codex workers execute bug/feature work.",
        icon: Code2,
      },
      {
        label: "Review Gate",
        value: "In Review",
        detail: "Reporter or lead owns final Done.",
        icon: ShieldCheck,
      },
    ],
    metrics: [
      {
        label: "Open threads",
        value: () => "live",
        detail: "Thread count appears below from the operations feed.",
      },
      ...baseMetrics("ops").slice(1),
    ],
  },
};

function baseMetrics(domain: string): RoleConfig["metrics"] {
  return [
    {
      label: "Goals",
      value: (state) => String(state.goalState?.goals?.length ?? 0),
      detail: `${domain} goals loaded`,
    },
    {
      label: "Recent actions",
      value: (state) => String(state.actions.length),
      detail: "Actions in the current event buffer",
    },
    {
      label: "Memory",
      value: (state) => String(state.recentEpisodes.length),
      detail: "Recent episodes available",
    },
  ];
}

export function AgentRoleOverview({
  agent,
  state,
}: {
  agent: AgentConfig;
  state: MartyState;
}) {
  const config = ROLE_CONFIGS[agent.id] ?? ROLE_CONFIGS.marty;
  const { threads, error } = useAgentThreads(agent.id);
  const activeThreads = threads.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled",
  );
  const needsInput = activeThreads.filter((t) => t.status === "paused-for-input");

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-fg)]">
              {agent.name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal">
              {config.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-fg)]">
              {config.mission}
            </p>
          </div>
          <div className="flex items-start justify-start gap-2 lg:justify-end">
            <Link
              href={config.primaryHref}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm hover:bg-[oklch(1_0_0/3%)]"
            >
              <MessagesSquare className="h-4 w-4" />
              {config.primaryLabel}
            </Link>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {config.lanes.map((lane) => {
            const Icon = lane.icon;
            return (
              <div
                key={lane.label}
                className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" style={{ color: agent.colorHex }} />
                  <span className="text-sm font-medium">{lane.label}</span>
                </div>
                <p className="mt-3 text-xl font-semibold">{lane.value}</p>
                <p className="mt-1 text-sm leading-5 text-[var(--muted-fg)]">
                  {lane.detail}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <Metric
            label="Active threads"
            value={String(activeThreads.length)}
            detail={error ? "Thread feed unreachable" : "Open workstreams"}
            tone={agent.colorHex}
          />
          <Metric
            label="Needs input"
            value={String(needsInput.length)}
            detail="Paused for Gabriel"
            tone="#fbbf24"
          />
          {config.metrics.map((metric) => (
            <Metric
              key={metric.label}
              label={metric.label}
              value={metric.value(state)}
              detail={metric.detail}
              tone={agent.colorHex}
            />
          ))}
        </section>

        <section className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: agent.colorHex }} />
              <h2 className="text-sm font-semibold">Current Focus</h2>
            </div>
            <p className="text-sm leading-6 text-[var(--muted-fg)]">
              {activeThreads[0]?.currentActivity ??
                state.status?.label ??
                "No active focus reported by this agent yet."}
            </p>
          </div>

          <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <BriefcaseBusiness
                className="h-4 w-4"
                style={{ color: agent.colorHex }}
              />
              <h2 className="text-sm font-semibold">Recent Threads</h2>
            </div>
            <div className="space-y-2">
              {activeThreads.slice(0, 4).map((thread) => (
                <Link
                  key={thread.id}
                  href={`/conversations/${agent.id}/${thread.id}`}
                  className="block rounded border border-[var(--border)] px-3 py-2 hover:bg-[oklch(1_0_0/3%)]"
                >
                  <p className="truncate text-sm font-medium">{thread.title}</p>
                  <p className="truncate text-xs text-[var(--muted-fg)]">
                    {thread.currentActivity}
                  </p>
                </Link>
              ))}
              {activeThreads.length === 0 && (
                <p className="text-sm text-[var(--muted-fg)]">
                  No active threads yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted-fg)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-fg)]">{detail}</p>
    </div>
  );
}
