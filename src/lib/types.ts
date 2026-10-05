export type Role = 'user' | 'assistant'

export interface Attachment {
  id: string
  name: string
  type: string
  size: number
}

export interface ChatMessage {
  id: string
  role: Role
  content: string
  createdAt: number
  attachments?: Attachment[]
  pending?: boolean
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
  pinned?: boolean
}

export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  notes?: string
  due?: string
  priority: Priority
  done: boolean
  createdAt: number
  completedAt?: number
}

export type MemoryCategory = 'personal' | 'preference' | 'work' | 'goal' | 'other'

export interface Memory {
  id: string
  content: string
  category: MemoryCategory
  createdAt: number
  source: 'manual' | 'chat'
}

export interface StoredFile {
  id: string
  name: string
  type: string
  size: number
  createdAt: number
  textExcerpt?: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  start: string
  end?: string
  notes?: string
}

export type ActivityKind = 'chat' | 'task' | 'file' | 'memory' | 'event' | 'tool'

export interface Activity {
  id: string
  kind: ActivityKind
  title: string
  detail?: string
  at: number
}

export type Personality = 'professional' | 'friendly' | 'creative'
export type ResponseStyle = 'concise' | 'balanced' | 'detailed'
export type ThemeName = 'dark' | 'midnight' | 'auto'
