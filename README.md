# Mr Balogun

Personal AI assistant web app — dark cinematic UI with neon-blue accents.

**Live:** https://mr-balogun.vercel.app

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand · React Router · lucide-react

## Run locally

```bash
npm install
npm run dev
```

## Structure

```
src/
  landing/            Public marketing site (/)
    demos/            Interactive feature demos (live chat, voice, personalization…)
  app/                The assistant app (/app/*), lazy-loaded separately
    components/       Shell: Sidebar, Topbar, MobileNav, FloatingAssistant,
                      CommandPalette (Ctrl/⌘ K), Composer, MessageList
    pages/            Home, Chat, Tasks, Files, Memory, Calendar, Tools, ToolRunner, Settings
  components/         Shared UI (brand, Markdown, Modal, Toast, Popover, controls)
  lib/
    ai/               AI layer — provider interface, local demo engine, commands, engine
    store/            Persisted state (chat, tasks, memories, files, calendar, settings, activity)
    tools/registry.ts AI tool definitions
    voice.ts          Speech recognition + speech synthesis hooks
  index.css           Design tokens (@theme) and shared utilities (glass, tile, btn-primary…)
public/avatar/        Robotic face assets (hero, avatar, profile)
```

## Design system

All colors live as tokens in `src/index.css` (`ink-*` surfaces, `brand-*` electric blue, `fg`/`muted`/`subtle` text, `line*` borders).
Reusable surfaces: `glass`, `glass-strong`, `tile`, `icon-box`, `edge-glow`, `btn-primary`, `btn-ghost`, `chip`, `field`.
Themes: Dark, Midnight, Auto — plus a glow-intensity and reduced-motion setting.

## AI

Replies currently come from a local demo engine (`src/lib/ai/mock.ts`) that streams responses and uses your tasks,
calendar, memories and files for context. Everything sits behind the `AIProvider` interface in `src/lib/ai/types.ts`;
to connect a hosted model, implement `stream()` against an API route and swap `provider` in `src/lib/ai/engine.ts`.

Chat commands that act on your data (`src/lib/ai/commands.ts`):

- `Remember that …` / `Forget …`
- `Add a task to … [today|tomorrow]` / `Remind me to …`
- `Schedule … at 3pm [tomorrow]`
- `Turn this into tasks` (after a list or plan)

## Adding a tool

Append a `ToolDefinition` to `TOOLS` in `src/lib/tools/registry.ts`. The Tools page, its runner page,
and the command palette pick it up automatically; handle the new `toolId` in the provider.

## Data

Everything is stored in the browser — state in `localStorage`, uploaded files in IndexedDB.
Settings → Data & Privacy can export everything as JSON or reset the workspace.

## Avatar assets

- `public/avatar/face/{lg,sm}/NNN.webp` — the landing hero's cursor-following face. An image sequence cut out
  of the reference head-movement video (frames 12–31 turn right, 136–159 look up/down), colour-graded, with alpha.
  `src/landing/FollowingFace.tsx` scrubs through it with a spring and cross-dissolves between frames; the left turn
  is the right turn mirrored. `lg` is ~680×700 for desktop, `sm` is 60% for phones.
- `hero.webp` ≈ 790×840 portrait (dashboard Home), `avatar.webp` 256×256 head, `profile.webp` ≈ 440×500 side profile.
