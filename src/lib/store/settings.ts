import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Personality, ResponseStyle, ThemeName } from '../types'

export interface Settings {
  name: string
  personality: Personality
  responseStyle: ResponseStyle
  theme: ThemeName
  glow: 'full' | 'low'
  reduceMotion: boolean
  speakReplies: boolean
  voiceURI: string | null
  voiceRate: number
  sendOnEnter: boolean
  notifyTasks: boolean
  notifyBriefing: boolean
  notifyProduct: boolean
  plan: 'free' | 'pro'
}

interface SettingsState extends Settings {
  update: (patch: Partial<Settings>) => void
}

export const defaultSettings: Settings = {
  name: 'Balogun Bright',
  personality: 'friendly',
  responseStyle: 'balanced',
  theme: 'dark',
  glow: 'full',
  reduceMotion: false,
  speakReplies: false,
  voiceURI: null,
  voiceRate: 1,
  sendOnEnter: true,
  notifyTasks: true,
  notifyBriefing: true,
  notifyProduct: false,
  plan: 'free',
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      update: (patch) => set(patch),
    }),
    { name: 'mrb-settings' },
  ),
)
