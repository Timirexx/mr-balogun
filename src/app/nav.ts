import { Brain, CalendarDays, CircleCheck, Folder, House, LayoutGrid, MessageSquareMore, Settings, type LucideIcon } from 'lucide-react'
import { AREA_HUE, type Hue } from '@/lib/hues'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  hue: Hue
  end?: boolean
}

export const NAV: NavItem[] = [
  { to: '/app', label: 'Home', icon: House, hue: AREA_HUE.home, end: true },
  { to: '/app/chat', label: 'Chat', icon: MessageSquareMore, hue: AREA_HUE.chat },
  { to: '/app/tasks', label: 'Tasks', icon: CircleCheck, hue: AREA_HUE.tasks },
  { to: '/app/files', label: 'Files', icon: Folder, hue: AREA_HUE.files },
  { to: '/app/memory', label: 'Memory', icon: Brain, hue: AREA_HUE.memory },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays, hue: AREA_HUE.calendar },
  { to: '/app/tools', label: 'Tools', icon: LayoutGrid, hue: AREA_HUE.tools },
  { to: '/app/settings', label: 'Settings', icon: Settings, hue: AREA_HUE.settings },
]

export const MOBILE_TABS = ['/app', '/app/chat', '/app/tasks', '/app/memory']
