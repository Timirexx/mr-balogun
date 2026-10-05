import { del, get as idbGet, set as idbSet } from 'idb-keyval'
import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoredFile } from '../types'
import { uid } from '../utils'
import { logActivity } from './activity'

const TEXT_EXT = /\.(txt|md|markdown|csv|json|log|html?|css|js|ts|tsx|jsx|py|xml|yaml|yml)$/i
const EXCERPT_LIMIT = 6000

export const isTextLike = (f: { type: string; name: string }) =>
  f.type.startsWith('text/') || f.type === 'application/json' || TEXT_EXT.test(f.name)

export const isImage = (f: { type: string }) => f.type.startsWith('image/')

interface FileState {
  files: StoredFile[]
  addFiles: (list: File[] | FileList) => Promise<StoredFile[]>
  remove: (id: string) => Promise<void>
  rename: (id: string, name: string) => void
}

const DAY = 86_400_000

const seedFile = (name: string, type: string, ago: number, text: string): StoredFile => ({
  id: uid(),
  name,
  type,
  size: new TextEncoder().encode(text).length,
  createdAt: Date.now() - ago,
  textExcerpt: text,
})

const seed: StoredFile[] = [
  seedFile(
    'Q4 content plan.md',
    'text/markdown',
    2 * 3_600_000,
    'Q4 content plan. Goal: grow the newsletter to 5,000 subscribers and publish two long-form essays per month. Pillars: productivity systems, AI tools for creators, and building in public. Weekly cadence: Monday essay draft, Wednesday short video, Friday newsletter. Key risks: inconsistent publishing and too many platforms. Focus on the newsletter first, then repurpose to LinkedIn and X. Measure open rate, replies, and subscriber growth every Friday.',
  ),
  seedFile(
    'Market research notes.txt',
    'text/plain',
    DAY,
    'Market research notes. The personal AI assistant market is growing quickly as people look for tools that combine chat, planning, and memory. Users complain that most assistants forget context between sessions. Privacy is a top concern for professionals. Voice interaction is becoming more popular on mobile. Opportunity: a premium assistant that remembers preferences, plans the day, and works across files and tasks in one place.',
  ),
  seedFile(
    'Project ideas.md',
    'text/markdown',
    3 * DAY,
    'Project ideas. 1. A habit tracker that uses AI to suggest the next small step. 2. A portfolio website with a live AI guide. 3. A reading companion that turns book highlights into flashcards. 4. A weekly review template that summarizes wins and lessons automatically.',
  ),
]

export const useFiles = create<FileState>()(
  persist(
    (set, get) => ({
      files: seed,
      addFiles: async (list) => {
        const added: StoredFile[] = []
        for (const file of Array.from(list)) {
          const meta: StoredFile = {
            id: uid(),
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            createdAt: Date.now(),
          }
          if (isTextLike(meta)) {
            meta.textExcerpt = (await file.slice(0, EXCERPT_LIMIT * 2).text()).slice(0, EXCERPT_LIMIT)
          }
          await idbSet(`file:${meta.id}`, file)
          added.push(meta)
          logActivity('file', meta.name, 'File uploaded')
        }
        set({ files: [...added, ...get().files] })
        return added
      },
      remove: async (id) => {
        await del(`file:${id}`)
        set({ files: get().files.filter((f) => f.id !== id) })
      },
      rename: (id, name) => set({ files: get().files.map((f) => (f.id === id ? { ...f, name } : f)) }),
    }),
    { name: 'mrb-files' },
  ),
)

export async function getFileBlob(meta: StoredFile): Promise<Blob | null> {
  const blob = await idbGet<Blob>(`file:${meta.id}`)
  if (blob) return blob
  if (meta.textExcerpt) return new Blob([meta.textExcerpt], { type: meta.type || 'text/plain' })
  return null
}

export function useFileUrl(meta: StoredFile | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!meta) return
    let objectUrl: string | null = null
    let cancelled = false
    getFileBlob(meta).then((blob) => {
      if (!blob || cancelled) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setUrl(null)
    }
  }, [meta])
  return url
}

export async function downloadFile(meta: StoredFile) {
  const blob = await getFileBlob(meta)
  if (!blob) return false
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = meta.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return true
}
