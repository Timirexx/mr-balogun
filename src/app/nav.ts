import { Brain, CalendarDays, CircleCheck, Folder, House, LayoutGrid, MessageSquareMore, Settings, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const NAV: NavItem[] = [
  { to: '/app', label: 'Home', icon: House, end: true },
  { to: '/app/chat', label: 'Chat', icon: MessageSquareMore },
  { to: '/app/tasks', label: 'Tasks', icon: CircleCheck },
  { to: '/app/files', label: 'Files', icon: Folder },
  { to: '/app/memory', label: 'Memory', icon: Brain },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/tools', label: 'Tools', icon: LayoutGrid },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export const MOBILE_TABS = ['/app', '/app/chat', '/app/tasks', '/app/memory']
