# Consciousness Dashboard

Real-time monitoring dashboard for Gabriel's 8-agent system. Connects to all agents via WebSocket, displays inner state, and provides a command center for Gabriel to interact with the fleet.

**Location:** `~/Documents/agents/consciousness-dashboard/`
**URL:** `http://localhost:3000`
**Tech stack:** Next.js 16, React 19, Tailwind 4, shadcn (base-ui), Framer Motion

---

## Quick Start

```bash
npm run dev    # development server on :3000
npm run build  # production build
npm run start  # production server
```

---

## Architecture

The dashboard connects to 8 WebSocket servers (one per agent, ports 3400-3407). On connection, each agent sends a `state:snapshot` with full current state. Subsequent events stream in real-time.

### Data Flow

```
Agent WS (3400-3407) -> useAgentSocket / useFleetStatus hooks -> React state -> UI
```

- **Single agent view:** `useAgentSocket(agent)` connects to one agent, maintains full state
- **HOME / Fleet view:** `useFleetStatus()` connects to ALL 8 agents simultaneously, maintains lightweight state per agent
- **Timeline:** `useTimeline(liveState)` enables scrubbing through event history to reconstruct past states

---

## Port Assignments

| Agent | WS Port | Health URL |
|-------|---------|------------|
| Marty | 3400 | `http://localhost:3400/health` |
| Stark | 3401 | `http://localhost:3401/health` |
| Ryu Zaki | 3402 | `http://localhost:3402/health` |
| Donna | 3403 | `http://localhost:3403/health` |
| Todo | 3404 | `http://localhost:3404/health` |
| Aryaa | 3405 | `http://localhost:3405/health` |
| Jennie | 3406 | `http://localhost:3406/health` |
| Ray | 3407 | `http://localhost:3407/health` |

WS base URL is configurable via `NEXT_PUBLIC_WS_BASE_URL` (defaults to `ws://localhost`).

---

## Component Map

### Pages

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page -- HOME view, agent tabs, fleet view, timeline scrubber |
| `src/app/layout.tsx` | Root layout |
| `src/app/globals.css` | Global styles + mood-bg CSS |

### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| AgentSelector | `src/components/agent-selector.tsx` | Top bar -- switch agents + FLEET / HOME toggles |
| StatusBar | `src/components/status-bar.tsx` | Agent mood, emotion, drives, connection status |
| HomeView | `src/components/home-view.tsx` | Command center -- aggregated requests, ability requests, comms, thoughts |
| FleetOverview | `src/components/fleet-overview.tsx` | 4x2 grid of all agents with live state |
| TimelineScrubber | `src/components/timeline-scrubber.tsx` | Scrub through event history / snap to live |
| CopyableId | `src/components/copyable-id.tsx` | Click-to-copy UUID tooltip (used everywhere) |

### Tab Components (`src/components/tabs/`)

| Tab | File | Props | What it shows |
|-----|------|-------|---------------|
| Mind | `mind.tsx` | `state: MartyState` | Thought stream (reasoning + conclusions from MonologueOutput) |
| Emotions | `emotions.tsx` | `state: MartyState` | VAD vector visualization + active emotion cards |
| Drives | `drives.tsx` | `state: MartyState` | Drive progress bars + goals list |
| Memory | `memory.tsx` | `state: MartyState` | Recent episodic memories with metadata |
| Actions | `actions.tsx` | `state: MartyState` | Action log (decided + completed) |
| Soul | `soul.tsx` | `state: MartyState` | Personality reference (Big Five radar, voice anchors, values) |
| Abilities | `abilities.tsx` | `state: MartyState` | Capability map + open ability requests |
| Comms | `comms.tsx` | `activeAgent: AgentConfig` | Inter-agent messaging threads |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAgentSocket` | `src/hooks/use-agent-socket.ts` | Connects to one agent's WS, manages full MartyState |
| `useFleetStatus` | `src/hooks/use-fleet-status.ts` | Connects to all 8 agents simultaneously, lightweight state |
| `useTimeline` | `src/hooks/use-timeline.ts` | Timeline scrubber + state replay at any timestamp |

### Lib

| File | Purpose |
|------|---------|
| `src/lib/agents.ts` | 8 agent configs (id, name, port, color, image) + Gabriel config |
| `src/lib/types.ts` | Dashboard-side TypeScript types (mirrors framework types) |
| `src/lib/utils.ts` | Utility functions (cn, etc.) |

---

## WebSocket Hook (`useAgentSocket`)

1. Creates WebSocket connection to `ws://localhost:{port}` for the active agent
2. On open: sets `connected: true`, resets reconnect delay
3. On close: sets `connected: false`, schedules reconnect with exponential backoff (1s -> 30s max)
4. On `state:snapshot` message: hydrates full state (emotional, drives, goals, working memory, episodes, soul, ability requests, event history)
5. On live events: incrementally updates state based on event type:
   - `emotion:changed` -> update emotionalState
   - `thought:produced` -> append to thoughts array
   - `action:decided` / `action:completed` -> append to actions array
   - `goal:*` -> update/add in goalState
   - `ability:requested` -> append to abilityRequests
6. When agent changes: closes old connection, resets state, connects to new agent
7. Maintains a 5000-event buffer (oldest events are pruned)

---

## Fleet Status Hook (`useFleetStatus`)

Same WebSocket protocol as `useAgentSocket` but connects to all 8 agents simultaneously. For fleet view, it only tracks:
- `state:snapshot` (full hydration)
- `emotion:changed` (mood updates)
- `thought:produced` (last 5 thoughts per agent)
- `action:decided` / `action:completed` (last 50 actions per agent)

Each agent has independent reconnect logic with exponential backoff.

---

## Timeline Scrubber (`useTimeline`)

Enables replaying past state from the event buffer:
- `isLive: true` when showing real-time state
- `scrubTo(timestamp)` reconstructs state at that point by:
  - Finding last `emotion:changed` before timestamp
  - Replaying all `goal:*` events before timestamp
  - Filtering thoughts and actions before timestamp
  - Working memory filtered to before timestamp
  - Drive state approximated from live (not reconstructible from events alone)
- `snapToLive()` returns to real-time view

---

## Views

### HOME View (default)

The command center. Shows aggregated data from ALL agents via `useFleetStatus`:
- **Requests:** Messages requiring Gabriel's attention
- **Ability Requests:** Things agents want but cannot do -- needs Gabriel's response
- **Comms:** Recent inter-agent messages
- **Thoughts:** Latest reasoning from each agent

HOME is the default view when the dashboard loads.

### Agent View

Select an agent from the top bar. Shows agent-specific tabs (Mind, Emotions, Drives, Memory, Actions, Soul, Abilities, Comms). Status bar shows current mood, emotion, drives, and connection state.

### Fleet View

Toggle the FLEET button to expand a 4x2 grid showing all 8 agents with live status indicators and recent thoughts.

---

## How the UI Works

### Mood-Reactive Background
CSS vars on the root element blend the agent's base color hue with the emotional valence:
- `--mood-hue`: blended hue (70% mood, 30% agent color)
- `--mood-chroma`: increases with emotional intensity
- `--arousal-speed`: animation speed decreases with arousal

### CopyableId
Every element that Gabriel might want to interact with (messages, goals, ability requests, memories, milestones) has a `CopyableId` component. Click to copy the UUID, then use `/interact <id>` in Claude Code to act on it.

### Agent Selector
Top bar with agent avatars. Active agent is highlighted with its theme color. HOME and FLEET are toggle buttons. Switching agents resets state and snaps timeline to live.

---

## How to Add a New Tab

1. Create `src/components/tabs/{name}.tsx`:
   ```tsx
   import type { MartyState } from "@/lib/types";

   interface Props { state: MartyState; }

   export function NewTab({ state }: Props) {
     return <div className="p-4 overflow-y-auto h-full">...</div>;
   }
   ```
2. Import in `src/app/page.tsx`
3. Add to the `TABS` array: `{ id: "newTab", label: "New Tab" }`
4. Add case in `TabContent` switch statement
5. If the tab needs data not in `MartyState`, add the type to `src/lib/types.ts` and update `useAgentSocket` to capture the relevant WsEvent type

---

## How to Add a New Agent

1. Add config to `src/lib/agents.ts` AGENTS array:
   ```ts
   {
     id: "newagent",
     name: "NewAgent",
     port: 3408,
     color: "oklch(0.65 0.18 120)",
     colorHex: "#4ade80",
     colorHue: 120,
     image: "/images/agents/newagent.png",
   }
   ```
2. Add agent image to `public/images/agents/` (or use DiceBear URL)
3. No other changes needed -- hooks auto-discover from the AGENTS array

---

## Key UI Rules

These are Gabriel's personal preferences (from `~/.claude/rules/ui-rules.md`). Apply to all dashboard work:

- **No search icons inside search bars** -- use plain input with descriptive placeholder
- **No back buttons** -- user navigates via browser or Cancel/Close buttons in context
- **No stat cards on dashboards** -- lead with the primary action (HOME leads with requests and comms, not numbers)
- **Wider max-width on content pages** -- `max-w-5xl` or `max-w-6xl` for agent views
- **No `<input type="date">`** -- always use shadcn Calendar/DatePicker
- **No `<input type="number">`** -- use `type="text"` with `inputMode="numeric"` and manual parsing
- **No grid of feature cards** -- each feature deserves its own moment
- **itshover animated icons preferred** over static lucide-react when available
- **DiceBear avatars** for any generated avatar needs

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `next` | 16.2.2 -- Next.js framework |
| `react` / `react-dom` | 19.2.4 -- React |
| `@base-ui/react` | shadcn base-ui components |
| `framer-motion` | 12.x -- animations + tab transitions |
| `lucide-react` | Icons (fallback when itshover unavailable) |
| `tailwindcss` | 4.x -- styling |
| `shadcn` | 4.x -- component system |
| `tw-animate-css` | Tailwind animation utilities |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Class name utilities |

---

## File Structure

```
consciousness-dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx          -- main page (HOME / agent / fleet)
│   │   ├── layout.tsx        -- root layout
│   │   └── globals.css       -- global styles + mood-bg
│   ├── components/
│   │   ├── agent-selector.tsx
│   │   ├── copyable-id.tsx
│   │   ├── fleet-overview.tsx
│   │   ├── home-view.tsx
│   │   ├── status-bar.tsx
│   │   ├── timeline-scrubber.tsx
│   │   ├── tabs/
│   │   │   ├── mind.tsx
│   │   │   ├── emotions.tsx
│   │   │   ├── drives.tsx
│   │   │   ├── memory.tsx
│   │   │   ├── actions.tsx
│   │   │   ├── soul.tsx
│   │   │   ├── abilities.tsx
│   │   │   └── comms.tsx
│   │   └── ui/               -- shadcn base-ui components
│   ├── hooks/
│   │   ├── use-agent-socket.ts
│   │   ├── use-fleet-status.ts
│   │   └── use-timeline.ts
│   └── lib/
│       ├── agents.ts         -- 8 agent configs + Gabriel config
│       ├── types.ts          -- all TypeScript types
│       └── utils.ts          -- cn() and utilities
└── public/
    └── images/agents/        -- agent avatar images
```
