import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sendMessage } from '../ai/engine'
import type { StoredFile } from '../types'
import { useChat } from './chat'

interface AssistantState {
  open: boolean
  convId: string | null
  paletteOpen: boolean
  setOpen: (open: boolean) => void
  setPaletteOpen: (open: boolean) => void
  ensureConversation: () => string
  reset: () => void
  ask: (prompt: string, opts?: { files?: StoredFile[]; speakReply?: boolean }) => void
}

export const useAssistant = create<AssistantState>()(
  persist(
    (set, get) => ({
      open: false,
      convId: null,
      paletteOpen: false,
      setOpen: (open) => set({ open }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      ensureConversation: () => {
        const { convId } = get()
        if (convId && useChat.getState().conversations.some((c) => c.id === convId)) return convId
        const id = useChat.getState().create()
        set({ convId: id })
        return id
      },
      reset: () => set({ convId: null, open: false }),
      ask: (prompt, opts) => {
        const id = get().ensureConversation()
        set({ open: true })
        void sendMessage(id, prompt, opts)
      },
    }),
    { name: 'mrb-assistant', partialize: (s) => ({ convId: s.convId }) },
  ),
)

export async function startConversation(prompt: string, files?: StoredFile[]) {
  const id = useChat.getState().create()
  void sendMessage(id, prompt, { files })
  return id
}
