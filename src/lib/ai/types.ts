import type { CalendarEvent, ChatMessage, Personality, ResponseStyle, StoredFile, Task } from '../types'

export interface AIContext {
  userName: string
  personality: Personality
  responseStyle: ResponseStyle
  memories: string[]
  tasks: Pick<Task, 'title' | 'due' | 'priority' | 'done'>[]
  events: Pick<CalendarEvent, 'title' | 'date' | 'start' | 'end'>[]
  now: Date
}

export interface AIRequest {
  messages: ChatMessage[]
  context: AIContext
  files?: StoredFile[]
  toolId?: string
  toolInstructions?: string
  variant?: number
}

export interface AIProvider {
  id: string
  label: string
  stream: (req: AIRequest, signal: AbortSignal) => AsyncGenerator<string>
}
