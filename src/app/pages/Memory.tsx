import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Check, MessageSquareMore, Pencil, Plus, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { EmptyState, Switch } from '@/components/ui/Controls'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { guessCategory, useMemories } from '@/lib/store/memories'
import type { Memory as MemoryItem, MemoryCategory } from '@/lib/types'
import { HUE, MEMORY_HUE } from '@/lib/hues'
import { cn, timeAgo } from '@/lib/utils'
import { Page, PageHeader, Panel } from '../components/PageHeader'

const CATEGORIES: { value: MemoryCategory; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'preference', label: 'Preference' },
  { value: 'work', label: 'Work' },
  { value: 'goal', label: 'Goal' },
  { value: 'other', label: 'Other' },
]

function MemoryCard({ m }: { m: MemoryItem }) {
  const { update, remove } = useMemories()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(m.content)

  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className={cn('tile group flex flex-col rounded-2xl p-4', HUE[MEMORY_HUE[m.category]])}>
      <div className="flex items-center justify-between">
        <span className="badge-hue rounded-full px-2.5 py-0.5 text-[0.68rem] capitalize">{m.category}</span>
        <div className="flex gap-0.5 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <button onClick={() => setEditing(true)} className="grid size-7 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-white" aria-label="Edit memory">
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={() => {
              remove(m.id)
              toast('Memory deleted')
            }}
            className="grid size-7 place-items-center rounded-lg text-muted hover:bg-danger/10 hover:text-danger"
            aria-label="Delete memory"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      {editing ? (
        <div className="mt-3 flex flex-1 flex-col gap-2">
          <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Memory" className="field resize-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => { setText(m.content); setEditing(false) }} className="btn-ghost px-3 py-1.5 text-xs">
              Cancel
            </button>
            <button
              onClick={() => {
                if (text.trim()) update(m.id, { content: text.trim() })
                setEditing(false)
              }}
              className="btn-primary rounded-lg px-3 py-1.5 text-xs"
            >
              <Check className="size-3.5" /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-fg">{m.content}</p>
      )}
      <p className="mt-4 flex items-center gap-1.5 text-[0.7rem] text-subtle">
        {m.source === 'chat' ? <MessageSquareMore className="size-3" /> : <UserRound className="size-3" />}
        {m.source === 'chat' ? 'Learned in chat' : 'Added by you'} · {timeAgo(m.createdAt)}
      </p>
    </motion.li>
  )
}

export default function Memory() {
  const { memories, enabled, add, clear, setEnabled } = useMemories()
  const [text, setText] = useState('')
  const [category, setCategory] = useState<MemoryCategory | 'auto'>('auto')
  const [filter, setFilter] = useState<MemoryCategory | 'all'>('all')
  const [q, setQ] = useState('')
  const [confirm, setConfirm] = useState(false)

  const list = useMemo(
    () => memories.filter((m) => (filter === 'all' || m.category === filter) && m.content.toLowerCase().includes(q.toLowerCase())),
    [memories, filter, q],
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    add(text, category === 'auto' ? guessCategory(text) : category)
    setText('')
    toast('Memory saved')
  }

  return (
    <Page>
      <PageHeader
        title="Memory"
        subtitle="What Mr Balogun remembers about you — always in your control."
        actions={
          <Panel className="flex items-center gap-3 px-4 py-2.5">
            <Brain className={cn('hue-violet size-5', enabled ? 'text-hue' : 'text-subtle')} />
            <span className="text-sm text-fg-soft">{enabled ? 'Memory on' : 'Memory paused'}</span>
            <Switch
              checked={enabled}
              onChange={(v) => {
                setEnabled(v)
                toast(v ? 'Memory turned on' : "Memory paused — I won't use or save memories", 'info')
              }}
              label="Memory enabled"
            />
          </Panel>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <Panel className="p-4 sm:p-5">
          <form onSubmit={submit}>
            <label htmlFor="new-memory" className="text-sm font-medium text-white">
              Teach Mr Balogun something
            </label>
            <textarea
              id="new-memory"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              placeholder="e.g. I prefer meetings after 10 AM, my sister's birthday is June 12…"
              className="field mt-3 resize-none"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {[{ value: 'auto' as const, label: 'Auto' }, ...CATEGORIES].map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={cn('chip shrink-0 px-3 py-1 text-xs', c.value !== 'auto' && HUE[MEMORY_HUE[c.value]], category === c.value && 'chip-active')}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={!text.trim()} className="btn-primary rounded-xl px-4 py-2 text-sm">
                <Plus className="size-4" /> Save memory
              </button>
            </div>
          </form>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <span className="icon-box hue-violet size-10">
              <ShieldCheck className="size-5" />
            </span>
            <p className="text-sm font-medium text-white">How memory works</p>
          </div>
          <ul className="mt-4 space-y-2 text-xs leading-relaxed text-muted">
            <li>• Say “remember that…” in chat and I'll save it here.</li>
            <li>• I use memories to personalise plans and answers.</li>
            <li>• Everything is stored on this device. Edit or delete anytime.</li>
          </ul>
        </Panel>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {[{ value: 'all' as const, label: 'All' }, ...CATEGORIES].map((c) => {
            const count = c.value === 'all' ? memories.length : memories.filter((m) => m.category === c.value).length
            return (
              <button key={c.value} onClick={() => setFilter(c.value)} className={cn('chip shrink-0', c.value !== 'all' && HUE[MEMORY_HUE[c.value]], filter === c.value && 'chip-active')}>
                {c.value !== 'all' && <span className="bg-hue size-1.5 rounded-full" />}
                {c.label} <span className="text-subtle">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-ink-850/70 px-3 focus-within:border-brand-400/60 sm:w-60">
            <Search className="size-4 text-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search memories…" aria-label="Search memories" className="h-10 w-full bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
          </label>
          {memories.length > 0 && (
            <button onClick={() => setConfirm(true)} className="btn-ghost h-10 px-3 text-xs hover:text-danger">
              Clear all
            </button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <Panel className="mt-4">
          <EmptyState icon={<Brain className="size-6" />} title={memories.length ? 'No matching memories' : 'No memories yet'} text="Add something above, or tell Mr Balogun in chat: “Remember that…”" />
        </Panel>
      ) : (
        <motion.ul layout className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {list.map((m) => (
              <MemoryCard key={m.id} m={m} />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Clear all memories?">
        <p className="text-sm text-muted">Mr Balogun will forget all {memories.length} memories. This can't be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setConfirm(false)} className="btn-ghost px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={() => {
              clear()
              setConfirm(false)
              toast('All memories cleared')
            }}
            className="rounded-[10px] border border-danger/50 bg-danger/15 px-4 py-2 text-sm text-danger hover:bg-danger/25"
          >
            Clear all
          </button>
        </div>
      </Modal>
    </Page>
  )
}
