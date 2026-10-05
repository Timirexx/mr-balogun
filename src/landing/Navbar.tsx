import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1))
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+1.5rem)] bg-gradient-to-b from-ink-900/85 via-ink-900/55 to-transparent backdrop-blur-xl transition-opacity duration-500 [mask-image:linear-gradient(#000_62%,transparent)]',
          scrolled ? 'opacity-100' : 'opacity-0',
        )}
      />
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:h-[72px] sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
        <a href="#home" aria-label="Mr Balogun home" className="justify-self-start">
          <Logo />
        </a>

        <ul className="hidden items-center gap-8 md:flex lg:gap-10">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn('font-display relative py-2 text-sm transition-colors', active === l.href ? 'text-brand-300' : 'text-fg-soft hover:text-white')}
              >
                {l.label}
                {active === l.href && (
                  <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-px bg-brand-400 shadow-[0_0_8px_rgba(58,166,255,0.9)]" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 justify-self-end">
          <Link to="/app" className="btn-primary hidden px-5 py-2 text-sm sm:inline-flex">
            Get Started <ArrowRight className="size-4" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-line text-fg-soft md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-line bg-ink-900/95 backdrop-blur-xl md:hidden"
          >
            <ul className="space-y-1 px-5 pt-2 pb-5">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-fg-soft hover:bg-white/5 hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link to="/app" className="btn-primary w-full py-3 text-sm">
                  Get Started <ArrowRight className="size-4" />
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
