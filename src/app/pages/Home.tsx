import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bot,
  Brain,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  FileText,
  Folder,
  Lightbulb,
  Mail,
  MessageSquareMore,
  PenLine,
  ScanSearch,
  Search,
  SendHorizontal,
  SquareDashedMousePointer,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AIAvatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useActivity } from '@/lib/store/activity'
import { startConversation, useAssistant } from '@/lib/store/assistant'
import { lastPreview, sortConversations, useChat } from '@/lib/store/chat'
import { useFiles } from '@/lib/store/files'
import { useMemories } from '@/lib/store/memories'
import { useSettings } from '@/lib/store/settings'
import { useTasks } from '@/lib/store/tasks'
import type { ActivityKind } from '@/lib/types'
import { cn, firstName, formatLongDate, isToday, timeAgo } from '@/lib/utils'
import { Panel } from '../components/PageHeader'

const ease = [0.16, 1, 0.3, 1] as const
const rise = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: 0.05 + i * 0.06, ease },
})

const CHIPS = [
  { label: 'Plan my day', prompt: 'Plan my day' },
  { label: 'Summarize this', to: '/app/tools/summarize' },
  { label: 'Create something', prompt: 'Create something' },
  { label: 'Help me decide', prompt: 'Help me decide' },
]

const FEATURES: { to: string; icon: LucideIcon; title: string; text: string }[] = [
  { to: '/app/chat', icon: MessageSquareMore, title: 'Chat', text: 'Have natural conversations, get instant answers, and explore new ideas.' },
  { to: '/app/tasks', icon: CircleCheck, title: 'Tasks', text: 'Stay organized, set goals, track progress and get things done.' },
  { to: '/app/files', icon: Folder, title: 'Files', text: 'Upload, manage and work with your files seamlessly.' },
  { to: '/app/memory', icon: Brain, title: 'Memory', text: 'Remember important things, preferences and past conversations.' },
]

const ACTIVITY_ICON: Record<ActivityKind, LucideIcon> = {
  chat: MessageSquareMore,
  task: CircleCheck,
  file: FileText,
  memory: Brain,
  event: CalendarDays,
  tool: ScanSearch,
}

function HomeHero() {
  const name = useSettings((s) => s.name)
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [first, ...rest] = name.trim().split(/\s+/)

  const go = async (prompt: string) => navigate(`/app/chat/${await startConversation(prompt)}`)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) void go(q.trim())
  }

  return (
    <div className="relative">
      {/* Portrait */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-4 h-[330px] w-[92%] sm:-right-6 sm:w-[64%] md:-top-[72px] md:h-[420px] md:w-[52%] lg:h-[440px] lg:w-[60%] xl:-right-2 xl:w-[56%]"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease }}
      >
        <img
          src="/avatar/hero.webp"
          alt=""
          className="h-full w-full object-cover object-[50%_8%] opacity-60 [mask-composite:intersect] [mask-image:radial-gradient(ellipse_52%_70%_at_55%_38%,#000_55%,transparent_100%),linear-gradient(#000_62%,transparent)] sm:opacity-75 lg:opacity-100"
        />
      </motion.div>

      <motion.div
        className="absolute top-[150px] right-0 hidden border-l border-line-strong pl-4 text-xs leading-relaxed text-muted 2xl:block"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        Always here.
        <br />
        Always learning.
        <br />
        Always with you.
        <span className="mt-3 block h-px w-6 bg-brand-400/70" />
      </motion.div>

      <div className="relative z-10 pt-6 md:pt-10">
        <motion.p {...rise(0)} className="text-xl font-light text-fg-soft sm:text-2xl">
          Welcome back,
        </motion.p>
        <motion.h1 {...rise(1)} className="mt-1 text-[2.6rem] leading-[1.05] font-bold tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.4rem]">
          {first} {rest.length > 0 && <span className="font-accent text-brand-gradient text-glow">{rest.join(' ')}</span>}
        </motion.h1>
        <motion.p {...rise(2)} className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-fg-soft/85">
          Your personal AI assistant. Ready to help you think, plan, create and do more.
        </motion.p>

        <motion.form {...rise(3)} onSubmit={submit} className="glass mt-7 flex max-w-[34rem] items-center gap-3 rounded-2xl border-line-strong p-2.5 pl-3 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(6,140,252,0.14),0_0_50px_-14px_rgba(6,140,252,0.8)]">
          <span className="icon-box size-10 shrink-0 rounded-xl">
            <Bot className="size-5" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask me anything, or type a task…"
            aria-label="Ask Mr Balogun anything"
            className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-white placeholder:text-fg-soft/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!q.trim()}
            aria-label="Send"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-[0_0_22px_rgba(6,140,252,0.85)] transition hover:brightness-110 disabled:opacity-70"
          >
            <SendHorizontal className="size-[18px]" />
          </button>
        </motion.form>

        <motion.div {...rise(4)} className="no-scrollbar -mx-4 mt-5 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {CHIPS.map((c) =>
            c.to ? (
              <Link key={c.label} to={c.to} className="chip">
                {c.label}
              </Link>
            ) : (
              <button key={c.label} onClick={() => void go(c.prompt!)} className="chip">
                {c.label}
              </button>
            ),
          )}
        </motion.div>
      </div>
    </div>
  )
}

function FeatureCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {FEATURES.map((f, i) => (
        <motion.div key={f.to} {...rise(5 + i)}>
          <Link to={f.to} className="tile group relative flex h-full flex-col rounded-2xl p-4 sm:p-5">
            <span className="icon-box size-11 sm:size-12">
              <f.icon className="size-5 sm:size-6" strokeWidth={1.6} />
            </span>
            <p className="font-display mt-4 text-lg font-semibold text-white">{f.title}</p>
            <p className="mt-1.5 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-muted">{f.text}</p>
            <ArrowRight className="mt-3 size-4 self-end text-brand-300 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

function TodayOverview() {
  const tasks = useTasks((s) => s.tasks)
  const files = useFiles((s) => s.files)
  const convs = useChat((s) => s.conversations)
  const mem = useMemories()
  const pending = tasks.filter((t) => !t.done).length
  const recentFiles = files.filter((f) => Date.now() - f.createdAt < 7 * 86_400_000).length
  const today = convs.filter((c) => isToday(c.updatedAt)).length

  const tiles = [
    { to: '/app/tasks', icon: CircleCheck, label: 'Tasks', sub: `${pending} pending` },
    { to: '/app/files', icon: Folder, label: 'Files', sub: `${recentFiles} recent` },
    { to: '/app/chat', icon: MessageSquareMore, label: 'Conversations', sub: `${today} today` },
    { to: '/app/memory', icon: Brain, label: 'Memory', sub: mem.enabled ? `Active · ${mem.memories.length}` : 'Paused' },
  ]

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <CalendarDays className="size-7 text-fg-soft" strokeWidth={1.4} />
          <div>
            <p className="font-display text-base font-medium text-white sm:text-lg">Today's Overview</p>
            <p className="text-xs text-muted">{formatLongDate()}</p>
          </div>
        </div>
        <Link to="/app/calendar" className="btn-ghost shrink-0 rounded-xl border-brand-500/40 px-3.5 py-2 text-xs text-brand-300">
          View Calendar <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} to={t.to} className="tile group flex items-center gap-3 rounded-xl p-3">
            <span className="icon-box size-10 shrink-0 rounded-lg">
              <t.icon className="size-[18px]" strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">{t.label}</span>
              <span className="block truncate text-xs text-muted">{t.sub}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-fg-soft transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Panel>
  )
}

function RecentConversations() {
  const convs = useChat((s) => s.conversations)
  const list = useMemo(() => [...convs].filter((c) => c.messages.length).sort(sortConversations).slice(0, 4), [convs])
  return (
    <Panel className="p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquareMore className="size-5 text-fg-soft" strokeWidth={1.6} />
          <p className="font-display text-[0.95rem] font-medium text-white">Recent Conversations</p>
        </div>
        <Link to="/app/chat" className="flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200">
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>
      {list.length === 0 && <p className="py-6 text-center text-sm text-muted">No conversations yet — ask me anything above.</p>}
      <ul className="divide-y divide-line-soft">
        {list.map((c, i) => (
          <li key={c.id}>
            <Link to={`/app/chat/${c.id}`} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.03]">
              {i % 2 === 0 ? (
                <AIAvatar size={32} />
              ) : (
                <span className="icon-box size-8 rounded-full">
                  <Brain className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">{c.title}</span>
                <span className="block truncate text-xs text-muted">{lastPreview(c)}</span>
              </span>
              <span className="hidden shrink-0 text-xs text-muted sm:block">{timeAgo(c.updatedAt)}</span>
              <ChevronRight className="size-4 shrink-0 text-fg-soft transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function AssistantPanel() {
  const name = useSettings((s) => s.name)
  const ask = useAssistant((s) => s.ask)
  const [open, setOpen] = useState(true)
  const actions = [
    { icon: PenLine, label: 'Write something', prompt: 'Create something' },
    { icon: ScanSearch, label: 'Research & summarize', prompt: 'Research the future of personal AI assistants' },
    { icon: CalendarDays, label: 'Plan my day', prompt: 'Plan my day' },
    { icon: Lightbulb, label: 'Help me solve a problem', prompt: 'Help me solve a problem' },
  ]
  return (
    <Panel className="p-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 text-left" aria-expanded={open}>
        <AIAvatar size={44} />
        <span className="flex-1">
          <span className="font-display block text-sm font-medium text-white">AI Assistant</span>
          <span className="flex items-center gap-1.5 text-xs text-online">
            <span className="size-1.5 rounded-full bg-online shadow-[0_0_6px_rgba(34,227,161,0.9)]" /> Online
          </span>
        </span>
        <ChevronDown className={cn('size-4 text-muted transition-transform', !open && '-rotate-90')} />
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
        <p className="mt-4 text-sm leading-relaxed text-fg-soft">
          Hi {firstName(name)},
          <br />
          I'm your AI assistant. How can I help you today?
        </p>
        <ul className="mt-4 space-y-2">
          {actions.map((a) => (
            <li key={a.label}>
              <button onClick={() => ask(a.prompt)} className="tile flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[0.8rem] text-fg-soft hover:text-white">
                <a.icon className="size-4 text-brand-300" strokeWidth={1.7} />
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </motion.div>
    </Panel>
  )
}

function QuickActions() {
  const items = [
    { to: '/app/tools/write', icon: FileText, label: 'Create a document' },
    { to: '/app/tools/summarize', icon: FileText, label: 'Summarize a file' },
    { to: '/app/tools/plan', icon: CalendarDays, label: 'Plan my day' },
    { to: '/app/tools/research', icon: Search, label: 'Get research' },
    { to: '/app/tools/email', icon: Mail, label: 'Draft an email' },
  ]
  return (
    <Panel className="p-4">
      <div className="mb-2 flex items-center gap-3 px-0.5">
        <SquareDashedMousePointer className="size-[18px] text-fg-soft" strokeWidth={1.6} />
        <p className="font-display text-sm font-medium text-white">Quick Actions</p>
      </div>
      <ul className="divide-y divide-line-soft">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="group flex items-center gap-3 py-2.5">
              <span className="icon-box size-8 rounded-lg">
                <i.icon className="size-4" strokeWidth={1.7} />
              </span>
              <span className="flex-1 text-[0.8rem] text-fg-soft group-hover:text-white">{i.label}</span>
              <ChevronRight className="size-4 text-fg-soft transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function ActivityRow({ kind, title, detail, at }: { kind: ActivityKind; title: string; detail?: string; at: number }) {
  const Icon = ACTIVITY_ICON[kind]
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="icon-box size-8 shrink-0 rounded-lg">
        <Icon className="size-4" strokeWidth={1.7} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.78rem] text-white">{title}</span>
        {detail && <span className="block truncate text-[0.68rem] text-subtle">{detail}</span>}
      </span>
      <span className="shrink-0 text-[0.68rem] text-muted">{timeAgo(at)}</span>
    </li>
  )
}

function RecentActivity() {
  const items = useActivity((s) => s.items)
  const [all, setAll] = useState(false)
  return (
    <Panel className="p-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-display text-sm font-medium text-white">Recent Activity</p>
        <button onClick={() => setAll(true)} className="flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200">
          View all <ArrowRight className="size-3.5" />
        </button>
      </div>
      {items.length === 0 && <p className="py-5 text-center text-xs text-muted">Nothing yet.</p>}
      <ul>
        {items.slice(0, 5).map((a) => (
          <ActivityRow key={a.id} {...a} />
        ))}
      </ul>
      <Modal open={all} onClose={() => setAll(false)} title="All activity">
        <ul className="-mx-1 max-h-[60vh] overflow-y-auto px-1">
          {items.map((a) => (
            <ActivityRow key={a.id} {...a} />
          ))}
        </ul>
      </Modal>
    </Panel>
  )
}

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <HomeHero />
          <div className="pt-2 md:pt-6">
            <FeatureCards />
          </div>
          <motion.div {...rise(9)}>
            <TodayOverview />
          </motion.div>
          <motion.div {...rise(10)}>
            <RecentConversations />
          </motion.div>
        </div>
        <motion.aside
          className="grid content-start gap-5 md:grid-cols-2 xl:mt-8 xl:grid-cols-1"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease }}
        >
          <AssistantPanel />
          <QuickActions />
          <div className="md:col-span-2 xl:col-span-1">
            <RecentActivity />
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
