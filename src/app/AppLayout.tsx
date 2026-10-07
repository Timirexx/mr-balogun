import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CommandPalette } from './components/CommandPalette'
import { FloatingAssistant } from './components/FloatingAssistant'
import { MobileNav } from './components/MobileNav'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'

export default function AppLayout() {
  const { pathname } = useLocation()
  const section = pathname.split('/')[2] ?? 'home'
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setNavOpen(false)
  }, [section])

  return (
    <div className="relative min-h-svh bg-[radial-gradient(circle_at_50%_-10%,rgba(91,36,7,0.36),transparent_38%),#0b0a09] text-fg">
      <Sidebar />
      <div className="relative flex min-h-svh flex-col md:pl-[236px]">
        <Topbar onOpenNav={() => setNavOpen(true)} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={section === 'chat' ? 'flex-1' : 'flex-1 pb-28 md:pb-12'}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <MobileNav open={navOpen} onOpen={() => setNavOpen(true)} onClose={() => setNavOpen(false)} />
      <FloatingAssistant />
      <CommandPalette />
    </div>
  )
}
