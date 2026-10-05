import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  FileUp,
  History,
  Lightbulb,
  Mail,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { AIAvatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { Popover } from '@/components/ui/Popover'
import { toast } from '@/components/ui/Toast'
import { regenerate, sendMessage, stopStreaming, useStreaming } from '@/lib/ai/engine'
import { lastPreview, sortConversations, useChat } from '@/lib/store/chat'
import { useSettings } from '@/lib/store/settings'
import type { Conversation, StoredFile } from '@/lib/types'
import { HUE } from '@/lib/hues'
import { cn, firstName, timeAgo } from '@/lib/utils'
import { Composer, type ComposerHandle } from '../components/Composer'
import { MessageList } from '../components/MessageList'

const DAY = 86_400_000

function groupOf(c: Conversation) {
  if (c.pinned) return 'Pinned'
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const t = start.getTime()
  if (c.updatedAt >= t) return 'Today'
  if (c.updatedAt >= t - DAY) return 'Yesterday'
  if (c.updatedAt >= t - 7 * DAY) return 'Previous 7 days'
  return 'Older'
}

function ConversationItem({ c, onNavigate }: { c: Conversation; onNavigate?: () => void }) {
  const { rename, togglePin, remove } = useChat()
  const navigate = useNavigate()
  const { id } = useParams()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(c.title)
  const streaming = useStreaming((s) => !!s.active[c.id])

  const commit = () => {
    if (title.trim()) rename(c.id, title.trim())
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl border border-brand-400/50 bg-ink-800 px-2 py-1.5">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setEditing(false)
          }}
          onBlur={commit}
          aria-label="Conversation title"
          className="min-w-0 flex-1 bg-transparent text-sm text-white focus:outline-none"
        />
        <Check className="size-4 text-brand-300" />
      </div>
    )
  }

  return (
    <div className="group relative">
      <NavLink
        to={`/app/chat/${c.id}`}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'block rounded-xl border px-3 py-2.5 pr-9 transition-colors',
            isActive ? 'border-brand-500/50 bg-brand-500/10' : 'border-transparent hover:bg-white/[0.03]',
          )
        }
      >
        <span className="flex items-center gap-1.5">
          {c.pinned && <Pin className="size-3 shrink-0 text-brand-300" />}
          <span className="truncate text-sm text-white">{c.title}</span>
          {streaming && <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-brand-400" />}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span className="truncate">{lastPreview(c)}</span>
          <span className="shrink-0 text-subtle">{timeAgo(c.updatedAt)}</span>
        </span>
      </NavLink>
      <div className="absolute top-2 right-1.5">
        <Popover
          className="w-44"
          trigger={({ toggle, open }) => (
            <button
              onClick={toggle}
              className={cn('grid size-7 place-items-center rounded-lg text-muted transition-opacity hover:bg-white/10 hover:text-white', open ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100')}
              aria-label={`Options for ${c.title}`}
            >
              <MoreHorizontal className="size-4" />
            </button>
          )}
        >
          {(close) => (
            <ul className="text-sm">
              <li>
                <button onClick={() => { togglePin(c.id); close() }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-fg-soft hover:bg-white/5 hover:text-white">
                  {c.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />} {c.pinned ? 'Unpin' : 'Pin'}
                </button>
              </li>
              <li>
                <button onClick={() => { setTitle(c.title); setEditing(true); close() }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-fg-soft hover:bg-white/5 hover:text-white">
                  <Pencil className="size-4" /> Rename
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    stopStreaming(c.id)
                    remove(c.id)
                    close()
                    toast('Conversation deleted')
                    if (id === c.id) navigate('/app/chat')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-danger hover:bg-danger/10"
                >
                  <Trash2 className="size-4" /> Delete
                </button>
              </li>
            </ul>
          )}
        </Popover>
      </div>
    </div>
  )
}

function ConversationList({ onNavigate }: { onNavigate?: () => void }) {
  const conversations = useChat((s) => s.conversations)
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = [...conversations]
      .filter((c) => c.messages.length > 0)
      .filter((c) => !query || c.title.toLowerCase().includes(query) || c.messages.some((m) => m.content.toLowerCase().includes(query)))
      .sort(sortConversations)
    const map = new Map<string, Conversation[]>()
    for (const c of list) {
      const g = groupOf(c)
      map.set(g, [...(map.get(g) ?? []), c])
    }
    return [...map.entries()]
  }, [conversations, q])

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 p-4">
        <button
          onClick={() => {
            navigate('/app/chat')
            onNavigate?.()
          }}
          className="btn-primary w-full rounded-xl py-2.5 text-sm"
        >
          <Plus className="size-4" /> New chat
        </button>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-ink-850/80 px-3 py-2 focus-within:border-brand-400/60">
          <Search className="size-4 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations…" aria-label="Search conversations" className="w-full bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
          {q && (
            <button onClick={() => setQ('')} aria-label="Clear search">
              <X className="size-3.5 text-muted" />
            </button>
          )}
        </label>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.length === 0 && <p className="px-2 py-8 text-center text-sm text-muted">{q ? 'No matching conversations.' : 'No conversations yet.'}</p>}
        {groups.map(([group, list]) => (
          <div key={group} className="mb-3">
            <p className="px-3 pt-2 pb-1.5 text-[0.68rem] font-medium tracking-wider text-subtle uppercase">{group}</p>
            <div className="space-y-0.5">
              {list.map((c) => (
                <ConversationItem key={c.id} c={c} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  { icon: CalendarDays, title: 'Plan my day', text: 'Build a schedule from my tasks', prompt: 'Plan my day', hue: HUE.emerald },
  { icon: Mail, title: 'Draft an email', text: 'Follow up with a client', prompt: 'Write an email to follow up with a client about the proposal', hue: HUE.fuchsia },
  { icon: Lightbulb, title: 'Brainstorm ideas', text: 'For a weekend side project', prompt: 'Give me ideas for a weekend side project', hue: HUE.amber },
  { icon: FileUp, title: 'Summarize a file', text: 'Attach a .txt or .md file', prompt: null, hue: HUE.cyan },
]

function EmptyChat({ onPick, onAttach }: { onPick: (p: string) => void; onAttach: () => void }) {
  const name = useSettings((s) => s.name)
  return (
    <div className="flex flex-1 overflow-y-auto px-4 py-6 sm:py-8">
      <div className="m-auto flex w-full flex-col items-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="relative">
        <span className="absolute -inset-6 rounded-full bg-brand-500/20 blur-2xl" />
        <span className="animate-pulse-ring absolute inset-0 rounded-full border border-brand-400/40" />
        <AIAvatar size={88} className="relative" />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        How can I help, <span className="font-accent text-brand-gradient">{firstName(name)}</span>?
      </motion.h2>
      <p className="mt-2 text-center text-sm text-muted">Ask anything, attach a file, or tap the mic to talk.</p>
      <div className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            onClick={() => (s.prompt ? onPick(s.prompt) : onAttach())}
            className={cn('tile group flex flex-col items-start gap-2.5 rounded-2xl p-3.5 text-left sm:flex-row sm:items-center sm:gap-3 sm:p-4', s.hue)}
          >
            <span className="icon-box size-9 shrink-0 sm:size-10">
              <s.icon className="size-[18px] sm:size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-white">{s.title}</span>
              <span className="hidden text-xs text-muted sm:block">{s.text}</span>
            </span>
          </motion.button>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-subtle">
        Tip: say <span className="text-fg-soft">“Remember that I prefer morning meetings”</span> or <span className="text-fg-soft">“Add a task to call mum tomorrow”</span>.
      </p>
      </div>
    </div>
  )
}

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const conv = useChat((s) => (id ? s.conversations.find((c) => c.id === id) : undefined))
  const { rename, togglePin, remove } = useChat()
  const streaming = useStreaming((s) => (id ? !!s.active[id] : false))
  const speakReplies = useSettings((s) => s.speakReplies)
  const updateSettings = useSettings((s) => s.update)
  const composer = useRef<ComposerHandle>(null)
  const [drawer, setDrawer] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (id && !conv) navigate('/app/chat', { replace: true })
  }, [id, conv, navigate])

  useEffect(() => {
    setEditingTitle(false)
  }, [id])

  const send = (text: string, files: StoredFile[], viaVoice: boolean) => {
    let cid = conv?.id
    if (!cid) {
      cid = useChat.getState().create()
      navigate(`/app/chat/${cid}`)
    }
    void sendMessage(cid, text, { files, speakReply: viaVoice })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) composer.current?.addFiles(files)
  }

  const hasMessages = !!conv?.messages.length

  return (
    <div className="flex h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] md:h-[calc(100dvh-72px)]">
      <aside className="hidden w-80 shrink-0 border-r border-line-soft bg-ink-900/30 lg:block">
        <ConversationList />
      </aside>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <motion.div
              className="glass-strong absolute inset-y-0 left-0 w-[86%] max-w-80 rounded-r-3xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <ConversationList onNavigate={() => setDrawer(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section
        className="relative flex min-w-0 flex-1 flex-col"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault()
            setDragging(true)
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={onDrop}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line-soft px-3 sm:px-5">
          <button onClick={() => setDrawer(true)} className="grid size-9 place-items-center rounded-xl text-fg-soft hover:bg-white/5 lg:hidden" aria-label="Conversation history">
            <History className="size-5" />
          </button>
          {editingTitle && conv ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title.trim()) rename(conv.id, title.trim())
                setEditingTitle(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              aria-label="Conversation title"
              className="field max-w-sm py-1.5"
            />
          ) : (
            <button
              onClick={() => {
                if (!conv) return
                setTitle(conv.title)
                setEditingTitle(true)
              }}
              className="min-w-0 truncate text-left text-sm font-medium text-white"
              title={conv ? 'Rename' : undefined}
            >
              {conv?.title && hasMessages ? conv.title : 'New conversation'}
            </button>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => {
                updateSettings({ speakReplies: !speakReplies })
                toast(speakReplies ? 'Replies will no longer be read aloud' : 'Mr Balogun will read replies aloud', 'info')
              }}
              className={cn('grid size-9 place-items-center rounded-xl transition-colors hover:bg-white/5', speakReplies ? 'text-brand-300' : 'text-muted')}
              aria-label={speakReplies ? 'Turn off spoken replies' : 'Read replies aloud'}
              title={speakReplies ? 'Spoken replies on' : 'Spoken replies off'}
            >
              {speakReplies ? <Volume2 className="size-[18px]" /> : <VolumeX className="size-[18px]" />}
            </button>
            {conv && hasMessages && (
              <>
                <button onClick={() => togglePin(conv.id)} className={cn('grid size-9 place-items-center rounded-xl hover:bg-white/5', conv.pinned ? 'text-brand-300' : 'text-muted')} aria-label={conv.pinned ? 'Unpin' : 'Pin'} title={conv.pinned ? 'Unpin' : 'Pin'}>
                  <Pin className="size-[18px]" />
                </button>
                <button onClick={() => setConfirmDelete(true)} className="grid size-9 place-items-center rounded-xl text-muted hover:bg-white/5 hover:text-danger" aria-label="Delete conversation" title="Delete">
                  <Trash2 className="size-[18px]" />
                </button>
              </>
            )}
            <button onClick={() => navigate('/app/chat')} className="btn-ghost ml-1 h-9 rounded-xl px-3 text-xs" aria-label="New chat">
              <Plus className="size-4" /> <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {hasMessages && conv ? (
          <MessageList messages={conv.messages} streaming={streaming} onRegenerate={() => regenerate(conv.id)} className="flex-1" />
        ) : (
          <EmptyChat onPick={(p) => send(p, [], false)} onAttach={() => composer.current?.openFilePicker()} />
        )}

        <div className="shrink-0 px-3 pt-2 pb-3 sm:px-6 sm:pb-5">
          <div className="mx-auto max-w-3xl">
            <Composer ref={composer} busy={streaming} onStop={() => conv && stopStreaming(conv.id)} onSend={send} autoFocus />
            <p className="mt-2 hidden text-center text-[0.68rem] text-subtle sm:block">Mr Balogun is running on the local demo engine — replies are generated on your device.</p>
          </div>
        </div>

        <AnimatePresence>
          {dragging && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-3 z-20 grid place-items-center rounded-3xl border-2 border-dashed border-brand-400/70 bg-ink-900/80 backdrop-blur-sm">
              <div className="text-center">
                <FileUp className="mx-auto size-10 text-brand-300" />
                <p className="mt-3 text-sm text-white">Drop files to attach</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete conversation?">
        <p className="text-sm text-muted">“{conv?.title}” will be permanently removed.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setConfirmDelete(false)} className="btn-ghost px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={() => {
              if (conv) {
                stopStreaming(conv.id)
                remove(conv.id)
              }
              setConfirmDelete(false)
              toast('Conversation deleted')
              navigate('/app/chat')
            }}
            className="rounded-[10px] border border-danger/50 bg-danger/15 px-4 py-2 text-sm text-danger hover:bg-danger/25"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
