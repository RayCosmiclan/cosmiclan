// Marketing-side agent display registry. Operational agent control lives in cosmiclan-command.
export interface AgentConfig {
  id: string;
  name: string;
  port: number;
  color: string;
  colorHex: string;
  colorHue: number;
  image: string;
}

export const AGENTS: AgentConfig[] = [
  {
    id: "marty",
    name: "Marty",
    port: 3400,
    color: "oklch(0.65 0.18 270)",
    colorHex: "#818cf8",
    colorHue: 270,
    image: "/images/agents/marty.png",
  },
  {
    id: "stark",
    name: "Stark",
    port: 3401,
    color: "oklch(0.72 0.16 80)",
    colorHex: "#fbbf24",
    colorHue: 80,
    image: "/images/agents/stark.png",
  },
  {
    id: "ryuzaki",
    name: "Ryu Zaki",
    port: 3402,
    color: "oklch(0.62 0.2 300)",
    colorHex: "#a78bfa",
    colorHue: 300,
    image: "/images/agents/ryuzaki.png",
  },
  {
    id: "donna",
    name: "Donna",
    port: 3403,
    color: "oklch(0.7 0.17 10)",
    colorHex: "#fb7185",
    colorHue: 10,
    image: "/images/agents/donna.png",
  },
  {
    id: "todo",
    name: "Todo",
    port: 3404,
    color: "oklch(0.7 0.18 155)",
    colorHex: "#34d399",
    colorHue: 155,
    image: "/images/agents/todo.png",
  },
  {
    id: "aryaa",
    name: "Aryaa",
    port: 3405,
    color: "oklch(0.6 0.02 250)",
    colorHex: "#94a3b8",
    colorHue: 250,
    image: "/images/agents/aryaa.png",
  },
  {
    id: "jennie",
    name: "Jennie",
    port: 3406,
    color: "oklch(0.68 0.22 330)",
    colorHex: "#e879f9",
    colorHue: 330,
    image: "/images/agents/jennie.png",
  },
  {
    id: "ray",
    name: "Ray",
    port: 3407,
    color: "oklch(0.7 0.17 50)",
    colorHex: "#fb923c",
    colorHue: 50,
    image: "/images/agents/ray.png",
  },
];

export const DEFAULT_AGENT = AGENTS[0]; // Marty

/** Gabriel config — not a real agent, used for rendering his messages */
export const GABRIEL_CONFIG = {
  id: "gabriel",
  name: "Gabriel",
  port: 0,
  color: "oklch(0.75 0.15 80)",
  colorHex: "#f59e0b",
  colorHue: 80,
  image: "/images/team/gabriel.png",
} satisfies AgentConfig;

export function getAgent(id: string): AgentConfig {
  if (id === "gabriel") return GABRIEL_CONFIG;
  return AGENTS.find((a) => a.id === id) ?? DEFAULT_AGENT;
}

export function getAgentWsUrl(agent: AgentConfig): string {
  const base =
    process.env.NEXT_PUBLIC_WS_BASE_URL ??
    (typeof window !== "undefined"
      ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}`
      : "ws://localhost");
  return `${base}:${agent.port}`;
}
