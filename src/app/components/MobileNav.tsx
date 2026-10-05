import { AnimatePresence, motion } from 'framer-motion'
import { Ellipsis, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { MOBILE_TABS, NAV } from '../nav'

export function MobileNav() {
  const [more, setMore] = useState(false)
  const { pathname } = useLocation()
  const tabs = NAV.filter((n) => MOBILE_TABS.includes(n.to))
  const rest = NAV.filter((n) => !MOBILE_TABS.includes(n.to))
  const moreActive = rest.some((n) => pathname.startsWith(n.to))

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink-900/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Main"
      >
        <ul className="grid h-16 grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="relative flex h-full flex-col items-center justify-center gap-1">
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span layoutId="mobile-tab" className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-400 shadow-[0_0_10px_rgba(58,166,255,1)]" />
                    )}
                    <Icon className={cn('size-[22px]', isActive ? 'text-brand-300 drop-shadow-[0_0_6px_rgba(58,166,255,0.8)]' : 'text-muted')} strokeWidth={1.7} />
                    <span className={cn('text-[0.66rem]', isActive ? 'text-white' : 'text-muted')}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button onClick={() => setMore(true)} className="relative flex h-full w-full flex-col items-center justify-center gap-1" aria-label="More sections">
              {moreActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-400 shadow-[0_0_10px_rgba(58,166,255,1)]" />}
              <Ellipsis className={cn('size-[22px]', moreActive ? 'text-brand-300' : 'text-muted')} />
              <span className={cn('text-[0.66rem]', moreActive ? 'text-white' : 'text-muted')}>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {more && (
          <motion.div className="fixed inset-0 z-[60] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={() => setMore(false)} />
            <motion.div
              className="glass-strong absolute inset-x-0 bottom-0 rounded-t-3xl px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-medium text-white">More</p>
                <button onClick={() => setMore(false)} className="grid size-8 place-items-center rounded-lg text-muted" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-2.5">
                {rest.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={() => setMore(false)}
                      className={({ isActive }) =>
                        cn('tile flex items-center gap-3 rounded-2xl p-4', isActive && 'border-brand-400/60 bg-brand-500/10')
                      }
                    >
                      <span className="icon-box size-10">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-sm text-fg">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
