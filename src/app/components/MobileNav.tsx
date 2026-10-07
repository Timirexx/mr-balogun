import { AnimatePresence, motion } from 'framer-motion'
import { Ellipsis, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { useTasks } from '@/lib/store/tasks'
import { cn } from '@/lib/utils'
import { MOBILE_TABS, NAV } from '../nav'
import { NavItemLink } from './Sidebar'

/** Bottom tab bar for the common destinations, plus a full drawer for the rest. */
export function MobileNav({ open, onOpen, onClose }: { open: boolean; onOpen: () => void; onClose: () => void }) {
  const { pathname } = useLocation()
  const pending = useTasks((s) => s.tasks.filter((t) => !t.done).length)
  const tabs = NAV.filter((n) => MOBILE_TABS.includes(n.to))
  const restActive = NAV.some((n) => !MOBILE_TABS.includes(n.to) && pathname.startsWith(n.to) && n.to !== '/app')

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[rgba(11,10,9,0.92)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Main">
        <ul className="grid h-16 grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="relative flex h-full flex-col items-center justify-center gap-1">
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="mobile-tab" className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-500 shadow-[0_0_10px_#f47721]" />}
                    <Icon className={cn('size-[22px]', isActive ? 'text-brand-500' : 'text-[#928c86]')} />
                    <span className={cn('font-display text-[0.66rem]', isActive ? 'text-white' : 'text-[#928c86]')}>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button onClick={open ? onClose : onOpen} className="relative flex h-full w-full flex-col items-center justify-center gap-1" aria-label="More sections">
              {restActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-500 shadow-[0_0_10px_#f47721]" />}
              <Ellipsis className={cn('size-[22px]', restActive ? 'text-brand-500' : 'text-[#928c86]')} />
              <span className={cn('font-display text-[0.66rem]', restActive ? 'text-white' : 'text-[#928c86]')}>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[60] md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[82%] max-w-[280px] flex-col border-r border-line bg-[rgba(11,10,9,0.97)] px-4 pt-6 pb-5 backdrop-blur-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            >
              <div className="flex items-center justify-between px-2 pb-5">
                <Logo />
                <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-muted hover:text-white" aria-label="Close navigation">
                  <X className="size-4" />
                </button>
              </div>
              <p className="font-display px-3 pt-2 pb-2.5 text-[9px] tracking-[2px] text-[#6e6862]">WORKSPACE</p>
              <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="All sections">
                {NAV.map((item) => (
                  <NavItemLink key={item.to} {...item} onClick={onClose} badge={item.to === '/app/tasks' ? pending : undefined} />
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
