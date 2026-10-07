import { useEffect } from 'react'
import { Hero } from './Hero'
import { Navbar } from './Navbar'
import { About, Features, Footer } from './Sections'

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Catt — Your AI assistant'
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_75%_15%,rgba(98,38,5,0.3),transparent_26%),#080808] text-fg">
      {/* ambient warmth */}
      <div className="pointer-events-none absolute -right-[180px] top-[90px] size-[300px] rounded-full bg-[radial-gradient(circle,rgba(245,105,15,0.65),transparent_64%)] opacity-80 blur-[1px]" />
      <div className="pointer-events-none absolute -left-[130px] top-[470px] size-[180px] rounded-full bg-[radial-gradient(circle,rgba(255,124,28,0.5),transparent_65%)] opacity-80 blur-[1px]" />

      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
      </main>
      <Footer />
    </div>
  )
}
