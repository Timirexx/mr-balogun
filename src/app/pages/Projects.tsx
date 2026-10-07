import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Check, FolderKanban, MessageCircle, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { sortConversations, useChat } from '@/lib/store/chat'
import { useProjects, type ProjectTone } from '@/lib/store/projects'
import { cn, timeAgo } from '@/lib/utils'
import { Page, PageHeader } from '../components/PageHeader'

const TONE: Record<ProjectTone, { icon: typeof Sparkles; cls: string }> = {
  orange: { icon: Sparkles, cls: 'bg-[#4c210a] text-brand-500' },
  purple: { icon: FolderKanban, cls: 'bg-[#2c1e43] text-[#b18cff]' },
  blue: { icon: BookOpen, cls: 'bg-[#142f40] text-[#63bcdf]' },
}

export default function Projects() {
  const { projects, add, rename, remove } = useProjects()
  const conversations = useChat((s) => s.conversations)
  const assignProject = useChat((s) => s.assignProject)
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const counts = useMemo(() => {
    const map = new Map<string, { chats: number; last?: number }>()
    for (const c of conversations) {
      if (!c.projectId) continue
      const prev = map.get(c.projectId) ?? { chats: 0 }
      map.set(c.projectId, { chats: prev.chats + 1, last: Math.max(prev.last ?? 0, c.updatedAt) })
    }
    return map
  }, [conversations])

  const unassigned = useMemo(() => [...conversations].filter((c) => !c.projectId && c.messages.length).sort(sortConversations), [conversations])
  const openProject = projects.find((p) => p.id === open)
  const openChats = useMemo(
    () => (open ? [...conversations].filter((c) => c.projectId === open).sort(sortConversations) : []),
    [conversations, open],
  )

  const create = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    add(name)
    setName('')
    setCreating(false)
    toast('Project created')
  }

  return (
    <Page>
      <PageHeader
        title="Everything has a place."
        subtitle="Separate workspaces keep every chat, file, and instruction focused."
        actions={
          <button onClick={() => setCreating(true)} className="btn-primary rounded-xl px-4 py-2.5 text-sm">
            <Plus className="size-4" /> New project
          </button>
        }
      />

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence initial={false}>
          {projects.map((p) => {
            const t = TONE[p.tone]
            const info = counts.get(p.id)
            return (
              <motion.li key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                <div className="group flex h-full flex-col gap-2.5 rounded-[15px] border border-line bg-[rgba(22,20,18,0.7)] p-[18px] transition-colors hover:border-brand-500/55">
                  <div className="flex items-start justify-between">
                    <span className={cn('grid size-8 place-items-center rounded-[10px]', t.cls)}>
                      <t.icon className="size-4" />
                    </span>
                    <div className="flex gap-0.5 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditing(p.id)
                          setDraft(p.name)
                        }}
                        className="grid size-7 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white"
                        aria-label={`Rename ${p.name}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          conversations.filter((c) => c.projectId === p.id).forEach((c) => assignProject(c.id, undefined))
                          remove(p.id)
                          toast('Project deleted — its chats were kept')
                        }}
                        className="grid size-7 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {editing === p.id ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => {
                        if (draft.trim()) rename(p.id, draft)
                        setEditing(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      aria-label="Project name"
                      className="field py-1.5"
                    />
                  ) : (
                    <button onClick={() => setOpen(p.id)} className="text-left">
                      <b className="font-display block text-xs text-white">{p.name}</b>
                      <small className="mt-1 block text-[10px] text-[#817a74]">
                        {info?.chats ?? 0} chat{info?.chats === 1 ? '' : 's'}
                        {info?.last ? ` · ${timeAgo(info.last)}` : p.note ? ` · ${p.note}` : ''}
                      </small>
                    </button>
                  )}
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>

        <li>
          <button
            onClick={() => setCreating(true)}
            className="flex h-full min-h-[104px] w-full flex-col items-center justify-center gap-2 rounded-[15px] border border-dashed border-line text-[#a99d95] transition-colors hover:border-brand-500/55"
          >
            <Plus className="size-[18px] text-brand-500" />
            <b className="font-display text-xs font-medium">New project</b>
          </button>
        </li>
      </ul>

      {unassigned.length > 0 && (
        <section className="mt-10">
          <p className="font-display mb-3 text-[9px] tracking-[0.2em] text-[#d1a17f]">UNFILED CHATS</p>
          <ul className="overflow-hidden rounded-2xl border border-line bg-[rgba(22,20,18,0.7)]">
            {unassigned.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center gap-3 border-b border-white/[0.07] p-4 last:border-0">
                <MessageCircle className="size-[18px] shrink-0 text-brand-500" />
                <button onClick={() => navigate(`/app/chat/${c.id}`)} className="min-w-0 flex-1 text-left">
                  <b className="block truncate text-xs text-white">{c.title}</b>
                  <small className="text-[10px] text-[#817a74]">{timeAgo(c.updatedAt)}</small>
                </button>
                <select
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    assignProject(c.id, e.target.value)
                    toast('Moved to project')
                  }}
                  aria-label={`Move "${c.title}" to a project`}
                  className="field h-9 w-auto py-0 text-xs"
                >
                  <option value="">Move to…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New project">
        <form onSubmit={create}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" aria-label="Project name" className="field" />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setCreating(false)} className="btn-ghost px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} className="btn-primary rounded-xl px-5 py-2 text-sm">
              <Check className="size-4" /> Create
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!open} onClose={() => setOpen(null)} title={openProject?.name}>
        {openChats.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No chats in this project yet. Move one across from “Unfiled chats”.</p>
        ) : (
          <ul className="-mx-1 max-h-[55vh] overflow-y-auto px-1">
            {openChats.map((c) => (
              <li key={c.id} className="flex items-center gap-3 border-b border-white/[0.07] py-3 last:border-0">
                <MessageCircle className="size-4 shrink-0 text-brand-500" />
                <button
                  onClick={() => {
                    setOpen(null)
                    navigate(`/app/chat/${c.id}`)
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <b className="block truncate text-xs text-white">{c.title}</b>
                  <small className="text-[10px] text-[#817a74]">{timeAgo(c.updatedAt)}</small>
                </button>
                <button
                  onClick={() => {
                    assignProject(c.id, undefined)
                    toast('Removed from project')
                  }}
                  className="text-[10px] text-muted hover:text-danger"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </Page>
  )
}
