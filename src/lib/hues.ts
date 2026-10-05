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

export const AREA_HUE = {
  home: 'blue',
  chat: 'blue',
  tasks: 'emerald',
  files: 'amber',
  memory: 'violet',
  calendar: 'cyan',
  tools: 'fuchsia',
  settings: 'slate',
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
