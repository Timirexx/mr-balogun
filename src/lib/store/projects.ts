import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uid } from '../utils'
import { logActivity } from './activity'

export type ProjectTone = 'orange' | 'purple' | 'blue'

export interface Project {
  id: string
  name: string
  note?: string
  tone: ProjectTone
  createdAt: number
}

interface ProjectState {
  projects: Project[]
  add: (name: string, tone?: ProjectTone) => Project
  rename: (id: string, name: string) => void
  remove: (id: string) => void
}

const TONES: ProjectTone[] = ['orange', 'purple', 'blue']

export const useProjects = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [
        { id: uid(), name: 'Personal', note: 'Day-to-day thinking', tone: 'orange', createdAt: Date.now() - 6 * 86_400_000 },
        { id: uid(), name: 'Catt product', note: 'Building the assistant', tone: 'purple', createdAt: Date.now() - 3 * 86_400_000 },
        { id: uid(), name: 'Study', note: 'Learning and notes', tone: 'blue', createdAt: Date.now() - 86_400_000 },
      ],
      add: (name, tone) => {
        const project: Project = {
          id: uid(),
          name: name.trim(),
          tone: tone ?? TONES[get().projects.length % TONES.length],
          createdAt: Date.now(),
        }
        set({ projects: [...get().projects, project] })
        logActivity('chat', project.name, 'Project created')
        return project
      },
      rename: (id, name) => set({ projects: get().projects.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)) }),
      remove: (id) => set({ projects: get().projects.filter((p) => p.id !== id) }),
    }),
    { name: 'catt-projects' },
  ),
)
