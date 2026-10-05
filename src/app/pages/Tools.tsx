import { motion } from 'framer-motion'
import { ArrowRight, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS, type ToolCategory } from '@/lib/tools/registry'
import { cn } from '@/lib/utils'
import { Page, PageHeader } from '../components/PageHeader'

const CATS: (ToolCategory | 'All')[] = ['All', 'Research', 'Writing', 'Planning', 'Thinking']

export default function Tools() {
  const [cat, setCat] = useState<ToolCategory | 'All'>('All')
  const [q, setQ] = useState('')
  const list = useMemo(
    () => TOOLS.filter((t) => (cat === 'All' || t.category === cat) && `${t.name} ${t.tagline} ${t.description}`.toLowerCase().includes(q.toLowerCase())),
    [cat, q],
  )

  return (
    <Page>
      <PageHeader title="AI Tools" subtitle="Purpose-built assistants for research, writing, planning and thinking." />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn('chip shrink-0', cat === c && 'border-brand-400/70 bg-brand-500/15 text-white')}>
              {c}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-ink-850/70 px-3 focus-within:border-brand-400/60 sm:w-64">
          <Search className="size-4 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tools…" aria-label="Search tools" className="h-10 w-full bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
        </label>
      </div>

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((t, i) => (
          <motion.li key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <Link to={`/app/tools/${t.id}`} className="tile group flex h-full flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <span className="icon-box size-12">
                  <t.icon className="size-6" strokeWidth={1.6} />
                </span>
                <span className="rounded-full border border-line px-2.5 py-0.5 text-[0.68rem] text-muted">{t.category}</span>
              </div>
              <p className="mt-4 text-base font-semibold text-white">{t.name}</p>
              <p className="text-xs text-brand-300">{t.tagline}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t.description}</p>
              <span className="mt-4 flex items-center gap-1.5 text-sm text-brand-300">
                Open tool <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.li>
        ))}
        <li className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong/60 p-6 text-center">
          <span className="grid size-12 place-items-center rounded-xl border border-dashed border-line-strong text-muted">
            <Plus className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-fg-soft">More tools on the way</p>
          <p className="mt-1 text-xs text-subtle">Translation, meeting notes, code helper and more.</p>
        </li>
      </ul>
    </Page>
  )
}
