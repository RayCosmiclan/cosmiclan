# Cosmiclan

Mission control for Gabriel's 8-agent clan. Browser-first web app today, Tauri desktop (macOS `.dmg`) next year. You work with your clan here — send messages, triage inbox, participate in channels, watch consciousness — instead of just watching it.

**Location:** `~/Documents/agents/cosmiclan/`
**URL:** `http://localhost:3000`
**Tech stack:** Next.js 16 (App Router), React 19, Tailwind 4, shadcn (base-ui), Framer Motion, next-themes

---

## Quick Start

```bash
npm run dev    # development server on :3000
npm run build  # production build
npm run start  # production server
```

---

## Top-level routes (App Router)

| Route | Purpose |
|-------|---------|
| `/` | Mission Control — needs-you-now inbox preview, clan pulse, active goals, today feed |
| `/inbox` | Unified triage queue (WhatsApp, Gmail, Outlook, agent requests) |
| `/conversations/[agent]` | 1:1 chat with an agent — history from `comms.db`, live replies via WS |
| `/channels/[id]` | Group chat in a seeded channel (#clan, #revenue, #creative, #tech, #health, #ideas) |
| `/agents/[name]` | Agent deep-dive — 8 tabs (Mind, Emotions, Drives, Memory, Actions, Soul, Abilities, Comms) |
| `/settings` | Profile |
| `/settings/connections` | Connected channels (Gmail session, Outlook MSAL, WhatsApp pair) |
| `/settings/autonomy` | Per-sender / per-domain / per-category autonomy rules |
| `/settings/notifications` | macOS notification prefs + quiet hours |
| `/settings/appearance` | Theme toggle (Light / Dark / System) |
| `/settings/clan` | Start / stop / status for each agent |
| `/menubar` | Tauri popover-only view (compact inbox) |

---

## Architecture

### Data flow: Gabriel → agent (1:1 message)
```
Composer → fetch POST /api/send → relay to agent ws-server :<port>/api/send
 → INSERT into ~/Documents/agents/comms.db
 → agent's comms polling (every 5s) picks it up
 → monologue → reply → INSERT reply
 → WS broadcast → useAgentSocket receives → UI streams reply into thread
```

### Data flow: inbound email/WhatsApp → inbox
```
Perception adapter (Baileys / Gmail Atom / Graph delta) emits message:received
 → Marty's inbox manager triages (rules + Claude)
 → INSERT into pending_items table in Marty's memory.db
 → emit inbox:item_pending → WS broadcast
 → useInbox() updates → /inbox UI prepends card
```

### WebSocket connection
- `useAgentSocket(agent)` — single agent, full `MartyState`
- `useClanStatus()` — all 8 agents simultaneously, lightweight state
- On connect: `state:snapshot`. After: incremental events (`emotion:changed`, `thought:produced`, `action:*`, `goal:*`, `ability:requested`, `comms:received`, `inbox:item_pending`, `inbox:item_updated`)
- Auto-reconnect with exponential backoff (1s → 30s)
- 5000-event buffer per agent

---

## Component Map

### Layout (`src/components/layout/`)
| Component | Purpose |
|-----------|---------|
| `Sidebar` | Persistent left rail — 6 top-nav items + Settings |
| `MissionControl` | Home view — inbox preview + clan pulse + active goals + today feed |
| `ThemeProvider` | next-themes wrapper, `data-theme` attribute |
| `ThemeToggle` | Light/Dark/System buttons |

### Chat (`src/components/chat/`)
| Component | Purpose |
|-----------|---------|
| `MessageList` | Scrollable message thread with auto-scroll |
| `MessageBubble` | Single bubble with agent-color accent |
| `Composer` | ChatGPT-style input with auto-resize textarea + ArrowUp send button |

### Inbox (`src/components/inbox/`)
| Component | Purpose |
|-----------|---------|
| `InboxList` | Pending items list, empty state |
| `InboxItemCard` | Collapsible card with priority dot, reply composer, unsubscribe/dismiss/snooze |
| `ReplyComposer` | Draft textarea with pre-filled `replyDraft` from triage |

### Agent tabs (`src/components/tabs/`, unchanged from original dashboard)
Mind · Emotions · Drives · Memory · Actions · Soul · Abilities · Comms

### Hooks (`src/hooks/`)
| Hook | Purpose |
|------|---------|
| `useAgentSocket` | Connect to one agent's WS |
| `useClanStatus` | Connect to all 8 simultaneously |
| `useTimeline` | Replay past state from event buffer |
| `useConversation` | 1:1 chat — history fetch + live WS events + send |
| `useChannel` | Group chat — history + live + send |
| `useInbox` | Pending items — refresh + reply + dismiss + snooze + urgent notification |
| `useDrafts` | Agent draft approval (legacy, still present) |

### API relay routes (`src/app/api/`)
| Route | Forwards to |
|-------|-------------|
| `POST /api/send` | Target agent's `:<port>/api/send` (Gabriel → agent) |
| `POST /api/channel-send` | Marty's `:3400/api/send` with channel field (Gabriel → channel) |
| `GET /api/comms/direct?agent=<id>` | Reads `comms.db` direct messages for Gabriel↔agent |
| `GET /api/comms/channel?id=<id>` | Reads `comms.db` messages + channel meta |
| `GET/POST/DELETE /api/inbox/*` | Proxies to Marty's `:3400/api/inbox/*` |

---

## Port Assignments

| Agent | WS Port | Color (hue) |
|-------|---------|-------------|
| Marty | 3400 | 270 indigo |
| Stark | 3401 | 80 amber |
| Ryu Zaki | 3402 | 300 violet |
| Donna | 3403 | 10 rose |
| Todo | 3404 | 155 emerald |
| Aryaa | 3405 | 250 slate |
| Jennie | 3406 | 330 fuchsia |
| Ray | 3407 | 50 orange |

WS base URL configurable via `NEXT_PUBLIC_WS_BASE_URL` (default `ws://localhost`).

---

## Theming

- **Modes:** Light / Dark / System via `next-themes` (`data-theme` attribute on `<html>`)
- **Light:** paper-white `oklch(0.99 0.003 80)`, cool grays
- **Dark (lifted):** `oklch(0.15 0.01 260)` (not near-black), warmer surfaces
- **Agent colors:** accents only (avatar dots, left borders, focus rings) — never backgrounds
- **Mood-reactive:** CSS vars from agent emotional valence modulate background at 40% intensity (capped)
- **Typography:** Geist Sans (display) + Geist Mono

---

## Key UI Rules (from `~/.claude/rules/ui-rules.md`)

- No search icons inside search bars
- No back buttons — use browser back or Cancel/Close in context
- No stat cards on dashboards — lead with primary action
- Wider max-width on content (`max-w-6xl`) for long reading
- No `<input type="date">` — use shadcn Calendar/DatePicker
- No `<input type="number">` — use `type="text"` + `inputMode="numeric"`
- ChatGPT-style composer pattern is mandatory for any chat input
- DiceBear avatars for any generated-avatar needs
- itshover animated icons preferred over static lucide-react (when a match exists)

---

## Tauri Integration

- **Source:** `cosmiclan/src-tauri/` (Rust/Tauri 2 shell)
- **Dev:** Next.js at `:3000`, Tauri webview points to same URL
- **Prod (v1.1 next year):** static export + bundled `.dmg`
- **Menu bar tray:** `set_badge(count)` command exposed to JS; click toggles popover
- **Popover window:** renders `/menubar` route, 400×600, frameless, always-on-top
- **Global hotkey:** `⌘⇧C` toggles popover
- **Notifications:** `useInbox` fires `@tauri-apps/plugin-notification` on `priority=urgent` items when `window.__TAURI_INTERNALS__` is present

---

## Dependencies (core)

| Package | Purpose |
|---------|---------|
| `next` 16.x | Framework |
| `react` / `react-dom` 19.x | UI |
| `@base-ui/react` | shadcn base-ui components |
| `next-themes` | Theme system |
| `framer-motion` 12.x | Animations |
| `lucide-react` | Icons |
| `better-sqlite3` | `comms.db` reads from Next.js API routes |
| `@tauri-apps/api` / `@tauri-apps/plugin-notification` | Tauri runtime bridges (devDeps, dynamic imported) |
| `tailwindcss` 4.x | Styling |

---

## How to Add a New Tab in an Agent Page

1. Create `src/components/tabs/{name}.tsx`
2. Import in `src/app/(main)/agents/[name]/page.tsx`
3. Add to the tab list + switch statement
4. If the tab needs new data: extend `MartyState` in `src/lib/types.ts`, handle event in `useAgentSocket`

## How to Add a New Agent

1. Add config to `src/lib/agents.ts` `AGENTS` array (id, name, port, color, colorHex, colorHue, image)
2. Add agent avatar to `public/images/agents/` (or use DiceBear URL)
3. No other changes needed — hooks auto-discover from the `AGENTS` array

## How to Add a New Channel

1. Run `clan-runtime/scripts/seed-channels.ts` after appending to the `SEED` array (or insert directly into `comms.db`)
2. Members list as JSON array; `gabriel` must be included for you to see messages

---

## Runtime dependency

The app assumes the clan runtime is running:

- At least one agent process (typically Marty on `:3400`) must be up for `/inbox`, `/conversations/*`, and `/api/send` to do anything meaningful.
- `~/Documents/agents/comms.db` must exist (it does — shared runtime DB).
- Marty's `memory.db` must have the `pending_items`, `autonomy_rules`, `known_senders` tables (run `clan-runtime/scripts/migrate-inbox-schema.ts` once per fresh install).

Boot the clan with `bash ~/Documents/agents/start-all.sh`.
