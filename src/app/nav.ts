import {
  Brain,
  CalendarDays,
  Clock3,
  FileImage,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { AREA_HUE, type Hue } from '@/lib/hues'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  hue: Hue
  end?: boolean
}

/** Sidebar order follows the CATT design; each entry is backed by a real feature. */
export const NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, hue: AREA_HUE.home, end: true },
  { to: '/app/chat', label: 'Chat', icon: MessageCircle, hue: AREA_HUE.chat },
  { to: '/app/memory', label: 'Memory', icon: Brain, hue: AREA_HUE.memory },
  { to: '/app/projects', label: 'Projects', icon: FolderKanban, hue: AREA_HUE.projects },
  { to: '/app/files', label: 'Files & Images', icon: FileImage, hue: AREA_HUE.files },
  { to: '/app/skills', label: 'AI Skills', icon: Sparkles, hue: AREA_HUE.tools },
  { to: '/app/research', label: 'Research', icon: Globe2, hue: AREA_HUE.research },
  { to: '/app/tasks', label: 'Tasks', icon: Clock3, hue: AREA_HUE.tasks },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays, hue: AREA_HUE.calendar },
  { to: '/app/settings', label: 'Settings', icon: Settings, hue: AREA_HUE.settings },
]

export const MOBILE_TABS = ['/app', '/app/chat', '/app/tasks', '/app/memory']
