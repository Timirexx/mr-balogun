import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { CommandPalette } from './components/CommandPalette'
import { FloatingAssistant } from './components/FloatingAssistant'
import { MobileNav } from './components/MobileNav'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'

export default function AppLayout() {
  const { pathname } = useLocation()
  const section = pathname.split('/')[2] ?? 'home'

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [section])

  return (
    <div className="bg-cinematic relative min-h-svh text-fg">
      <Sidebar />
      <div className="relative md:pl-[76px] lg:pl-[248px]">
        <Topbar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={section === 'chat' ? '' : 'pb-28 md:pb-12'}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <MobileNav />
      <FloatingAssistant />
      <CommandPalette />
    </div>
  )
}
