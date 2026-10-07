import { ArrowUpRight, SlidersHorizontal, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { useTasks } from '@/lib/store/tasks'
import { cn } from '@/lib/utils'
import { NAV } from '../nav'

export function NavItemLink({ to, label, icon: Icon, end, onClick, badge }: (typeof NAV)[number] & { onClick?: () => void; badge?: number }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'font-display flex items-center gap-[11px] rounded-[10px] border px-3 py-[11px] text-left text-xs transition-colors',
          isActive
            ? 'border-brand-500/20 bg-[linear-gradient(90deg,rgba(101,41,9,0.72),rgba(45,24,12,0.25))] text-white'
            : 'border-transparent text-[#928c86] hover:border-brand-500/20 hover:bg-[linear-gradient(90deg,rgba(101,41,9,0.72),rgba(45,24,12,0.25))] hover:text-white',
        )
      }
    >
      <Icon className="size-4 shrink-0 text-brand-500" />
      <span className="truncate">{label}</span>
      {badge ? <b className="ml-auto rounded-[10px] bg-[#4f220a] px-1.5 py-[3px] text-[9px] font-normal text-[#ff9c46]">{badge}</b> : null}
    </NavLink>
  )
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Catt Pro">
      <p className="text-sm leading-relaxed text-muted">
        Pro is in early access. It unlocks advanced AI models, live web research with sources, unlimited memory and natural voice conversations.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-fg-soft">
        {['Advanced AI models', 'Live web research', 'Unlimited memory', 'Natural voice conversations'].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(244,119,33,0.7)]" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          toast("You're on the Pro waitlist.")
          onClose()
        }}
        className="btn-primary mt-6 w-full py-2.5 text-sm"
      >
        Join the waitlist <ArrowUpRight className="size-4" />
      </button>
    </Modal>
  )
}

export function Sidebar() {
  const [upgrade, setUpgrade] = useState(false)
  const pending = useTasks((s) => s.tasks.filter((t) => !t.done).length)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-line bg-[rgba(10,9,8,0.62)] px-4 pt-[26px] pb-5 md:flex">
      <NavLink to="/app" aria-label="catt home" className="px-3 pb-[26px]">
        <Logo />
      </NavLink>

      <p className="font-display px-3 pt-[18px] pb-2.5 text-[9px] tracking-[2px] text-[#6e6862]">WORKSPACE</p>

      <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Assistant workspace">
        {NAV.map((item) => (
          <NavItemLink key={item.to} {...item} badge={item.to === '/app/tasks' ? pending : undefined} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/[0.08] pt-[15px]">
        <button
          onClick={() => setUpgrade(true)}
          className="font-display flex items-center gap-[11px] rounded-[10px] px-3 py-[11px] text-left text-xs text-[#928c86] hover:bg-white/[0.03] hover:text-white"
        >
          <UserRound className="size-4 text-brand-500" /> <span>My account</span>
        </button>
        <NavLink
          to="/app/settings"
          className="font-display flex items-center gap-[11px] rounded-[10px] px-3 py-[11px] text-left text-xs text-[#928c86] hover:bg-white/[0.03] hover:text-white"
        >
          <SlidersHorizontal className="size-4 text-brand-500" /> <span>Preferences</span>
        </NavLink>
      </div>

      <UpgradeModal open={upgrade} onClose={() => setUpgrade(false)} />
    </aside>
  )
}
