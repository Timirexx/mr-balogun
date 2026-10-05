import { ArrowRight, Crown } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { LightStreaks } from '@/landing/Decor'
import { HUE } from '@/lib/hues'
import { cn } from '@/lib/utils'
import { NAV } from '../nav'

export function NavItemLink({ to, label, icon: Icon, hue, end, onClick, rail }: (typeof NAV)[number] & { onClick?: () => void; rail?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={label}
      className={({ isActive }) =>
        cn(
          'font-display group relative flex items-center gap-3.5 rounded-xl border px-3.5 py-2.5 text-[0.95rem] transition-all duration-300',
          HUE[hue],
          rail && 'md:max-lg:justify-center md:max-lg:px-0',
          isActive
            ? 'border-[rgb(var(--hue)/0.7)] bg-[linear-gradient(90deg,rgb(var(--hue)/0.24),rgb(var(--hue)/0.06))] text-white shadow-[0_0_calc(24px*var(--glow))_-6px_rgb(var(--hue)/0.85),inset_0_0_20px_rgb(var(--hue)/0.16)]'
            : 'border-transparent text-fg-soft/85 hover:border-line hover:bg-white/[0.03] hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'text-hue size-[21px] shrink-0 transition-all',
              isActive ? 'drop-shadow-[0_0_6px_rgb(var(--hue)/0.9)]' : 'opacity-60 group-hover:opacity-100',
            )}
            strokeWidth={1.6}
          />
          <span className={cn(rail && 'md:max-lg:sr-only')}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Mr Balogun Pro">
      <p className="text-sm leading-relaxed text-muted">Pro is in early access. It unlocks advanced AI models, live web research with sources, unlimited memory and natural voice conversations.</p>
      <ul className="mt-4 space-y-2 text-sm text-fg-soft">
        {['Advanced AI models', 'Live web research', 'Unlimited memory', 'Natural voice conversations'].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(238,203,133,0.8)]" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          toast("You're on the Pro waitlist.")
          onClose()
        }}
        className="btn-gold mt-6 w-full py-2.5 text-sm"
      >
        Join the waitlist <ArrowRight className="size-4" />
      </button>
    </Modal>
  )
}

export function Sidebar() {
  const [upgrade, setUpgrade] = useState(false)
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-line-soft bg-ink-850/95 md:flex md:w-[76px] lg:w-[248px]">
      <div className="flex h-[72px] shrink-0 items-center px-6 md:max-lg:justify-center md:max-lg:px-0">
        <NavLink to="/app" aria-label="Mr Balogun home">
          <span className="hidden lg:block">
            <Logo />
          </span>
          <span className="block lg:hidden">
            <LogoMark className="size-8" />
          </span>
        </NavLink>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pt-4 md:max-lg:px-3" aria-label="Main">
        <ul className="space-y-1.5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavItemLink {...item} rail />
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative hidden shrink-0 px-4 pb-6 lg:block">
        <div className="glass edge-gold isolate rounded-2xl p-4">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(120%_80%_at_0%_0%,rgba(233,190,112,0.14),transparent_60%)]" />
          <div className="flex items-center gap-3">
            <span className="icon-box hue-gold size-9 rounded-xl">
              <Crown className="size-4" />
            </span>
            <p className="font-display text-gold-gradient text-sm font-semibold">Upgrade to Pro</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">Unlock advanced features, more memory and higher limits.</p>
          <button onClick={() => setUpgrade(true)} className="btn-gold mt-4 rounded-xl px-4 py-2 text-xs">
            Upgrade Now <ArrowRight className="size-3.5" />
          </button>
        </div>
        <blockquote className="relative z-10 mt-8 px-2">
          <p className="text-sm leading-relaxed text-fg-soft/80">“Better questions.
            <br />
            Bigger possibilities.”</p>
          <footer className="mt-1.5 text-xs text-subtle">— Mr Balogun</footer>
        </blockquote>
        <LightStreaks className="-bottom-6 -left-10 h-32 w-[130%] opacity-70" />
      </div>
      <UpgradeModal open={upgrade} onClose={() => setUpgrade(false)} />
    </aside>
  )
}
