import { useEffect } from 'react'
import { CheckList, FeatureSection, LightStreaks, Reveal, SectionLabel } from './Decor'
import { ChatDemo } from './demos/ChatDemo'
import { MemoryDemo } from './demos/MemoryDemo'
import { PersonalizationDemo } from './demos/PersonalizationDemo'
import { TaskDemo } from './demos/TaskDemo'
import { ToolsDemo } from './demos/ToolsDemo'
import { VoiceDemo } from './demos/VoiceDemo'
import { Hero } from './Hero'
import { Navbar } from './Navbar'
import { FinalCta, Footer, HowItWorks, Pricing } from './Sections'

const TOTAL = 6

function VoiceSection() {
  return (
    <section className="hue-cyan relative overflow-hidden border-t border-line-soft">
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <LightStreaks className="top-[30%] left-[20%] h-1/2 w-[60%] opacity-50" />
        <div className="pointer-events-none absolute inset-y-0 right-[-5%] hidden w-[34%] lg:block">
          <div className="absolute top-1/2 left-[30%] size-[70%] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(45,212,236,0.22),rgba(30,110,230,0.14)_55%,transparent)] blur-2xl" />
          <img
            src="/avatar/profile.webp"
            alt=""
            className="relative h-full w-full object-cover object-[22%_30%] [mask-composite:intersect] [mask-image:linear-gradient(90deg,transparent,#000_22%),linear-gradient(180deg,transparent,#000_10%,#000_78%,transparent)]"
            loading="lazy"
          />
        </div>
        <div className="relative grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Reveal>
            <SectionLabel index={3} total={TOTAL} />
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
              Voice <span className="font-accent text-hue-gradient">Interaction</span>
            </h2>
            <p className="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted">
              Speak naturally. Get instant responses. Mr Balogun listens, understands, and replies in real time.
            </p>
            <CheckList items={['Natural voice conversations', 'Hands-free convenience', 'Fast & accurate responses']} />
          </Reveal>
          <Reveal delay={0.15} className="lg:pr-[42%]">
            <VoiceDemo />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Mr Balogun — Personal AI Assistant'
  }, [])

  return (
    <div className="relative min-h-screen bg-ink-900 text-fg">
      <Navbar />
      <main>
        <Hero />
        <FeatureSection
          id="features"
          hue="blue"
          index={1}
          total={TOTAL}
          title="Intelligent AI Chat"
          accentWord="Chat"
          text="Have natural conversations, get instant answers, and explore new ideas. Mr Balogun is always ready to help, 24/7."
          bullets={['Ask anything', 'Get clear, helpful answers', 'Remembers context between chats']}
          visual={<ChatDemo />}
        />
        <FeatureSection
          hue="emerald"
          index={2}
          total={TOTAL}
          title="Task Assistance"
          accentWord="Assistance"
          text="From writing and research to planning and problem solving, Mr Balogun helps you get things done — faster and easier."
          bullets={['Write & edit content', 'Research & summarize', 'Plan, organize & solve']}
          visual={<TaskDemo />}
          reverse
        />
        <VoiceSection />
        <FeatureSection
          hue="violet"
          index={4}
          total={TOTAL}
          title="Personalization"
          text="Mr Balogun adapts to your style, preferences and goals, giving you a truly personal experience."
          bullets={['Custom appearance & tone', 'Adjustable settings', 'Built around your goals']}
          visual={<PersonalizationDemo />}
          reverse
        />
        <FeatureSection
          hue="fuchsia"
          index={5}
          total={TOTAL}
          title="Memory & History"
          accentWord="History"
          text="He remembers what matters. Keep your conversations, preferences and progress all in one place."
          bullets={['Conversation history', 'Remembered preferences', 'Seamless continuity']}
          visual={<MemoryDemo />}
          decor={<LightStreaks flip className="top-1/3 right-0 h-1/2 w-2/3 opacity-30" />}
        />
        <FeatureSection
          hue="amber"
          index={6}
          total={TOTAL}
          title="Files & Smart Tools"
          accentWord="Smart Tools"
          text="Upload documents, get instant summaries, and reach for purpose-built tools for research, writing, planning and decisions."
          bullets={['Upload & organize files', 'Summaries in seconds', '10 AI tools, one place']}
          visual={<ToolsDemo />}
          reverse
        />
        <HowItWorks />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
