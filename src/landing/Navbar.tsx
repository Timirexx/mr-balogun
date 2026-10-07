import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )
    LINKS.forEach((l) => {
      const el = document.getElementById(l.href.slice(1))
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <header className="wrap relative z-20 mt-4 sm:mt-9">
      <nav className="flex h-[60px] items-center rounded-[32px] border border-line bg-[rgba(10,10,10,0.68)] pr-3.5 pl-[18px] backdrop-blur-[18px]">
        <a href="#home" aria-label="catt home">
          <Logo />
        </a>

        <ul className="m-auto hidden items-center gap-2 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  'font-display block rounded-[22px] px-[18px] py-[9px] text-[13px] transition-colors',
                  active === l.href
                    ? 'bg-[linear-gradient(120deg,#8e3e09,#3b1b0a)] text-white'
                    : 'text-[#aaa] hover:bg-[linear-gradient(120deg,#8e3e09,#3b1b0a)] hover:text-white',
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <Link to="/app" className="btn-primary ml-auto hidden px-[21px] py-2.5 text-sm md:ml-0 md:inline-flex">
          <ArrowUpRight className="size-4" /> Get in
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid size-10 place-items-center text-white md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 overflow-hidden rounded-3xl border border-line bg-[rgba(10,10,10,0.92)] backdrop-blur-[18px] md:hidden"
          >
            <ul className="space-y-1 p-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="font-display block rounded-2xl px-4 py-3 text-sm text-[#aaa] hover:bg-white/5 hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-1">
                <Link to="/app" className="btn-primary w-full py-3 text-sm">
                  <ArrowUpRight className="size-4" /> Get in
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
