import type { ActivityKind, MemoryCategory, Priority } from './types'

export type Hue = 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'fuchsia' | 'gold' | 'slate'

// Literal class names so Tailwind can see them.
export const HUE: Record<Hue, string> = {
  blue: 'hue-blue',
  cyan: 'hue-cyan',
  violet: 'hue-violet',
  emerald: 'hue-emerald',
  amber: 'hue-amber',
  rose: 'hue-rose',
  fuchsia: 'hue-fuchsia',
  gold: 'hue-gold',
  slate: 'hue-slate',
}

// The CATT design is near-monochrome, so every area reads as orange. The hue
// mechanism stays so individual components can still opt into an accent.
export const AREA_HUE = {
  home: 'blue',
  chat: 'blue',
  tasks: 'blue',
  files: 'blue',
  memory: 'blue',
  calendar: 'blue',
  tools: 'blue',
  research: 'blue',
  projects: 'blue',
  settings: 'blue',
} as const satisfies Record<string, Hue>

export const ACTIVITY_HUE: Record<ActivityKind, Hue> = {
  chat: 'blue',
  task: 'emerald',
  file: 'amber',
  memory: 'violet',
  event: 'cyan',
  tool: 'fuchsia',
}

export const MEMORY_HUE: Record<MemoryCategory, Hue> = {
  personal: 'violet',
  preference: 'fuchsia',
  work: 'blue',
  goal: 'emerald',
  other: 'slate',
}

export const PRIORITY_HUE: Record<Priority, Hue> = {
  high: 'rose',
  medium: 'amber',
  low: 'slate',
}
