import { clear as clearIdb } from 'idb-keyval'
import {
  AlignJustify,
  AlignLeft,
  Bell,
  Briefcase,
  Cpu,
  Database,
  Download,
  Mic,
  Moon,
  MoonStar,
  Palette,
  Play,
  ScrollText,
  Smile,
  SunMoon,
  Trash2,
  UserRound,
  Volume2,
  Wand2,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AIAvatar } from '@/components/ui/Avatar'
import { OptionCards, Switch } from '@/components/ui/Controls'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { provider } from '@/lib/ai/engine'
import { useCalendar } from '@/lib/store/calendar'
import { useChat } from '@/lib/store/chat'
import { useFiles } from '@/lib/store/files'
import { useMemories } from '@/lib/store/memories'
import { useSettings } from '@/lib/store/settings'
import { useTasks } from '@/lib/store/tasks'
import { HUE } from '@/lib/hues'
import { cn } from '@/lib/utils'
import { canListen, canSpeak, speak, useVoices } from '@/lib/voice'
import { Page, PageHeader, Panel } from '../components/PageHeader'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: UserRound, hue: HUE.blue },
  { id: 'ai', label: 'AI Personality', icon: Wand2, hue: HUE.violet },
  { id: 'voice', label: 'Voice', icon: Volume2, hue: HUE.cyan },
  { id: 'appearance', label: 'Appearance', icon: Palette, hue: HUE.fuchsia },
  { id: 'notifications', label: 'Notifications', icon: Bell, hue: HUE.amber },
  { id: 'data', label: 'Data & Privacy', icon: Database, hue: HUE.emerald },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

function Row({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-soft py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <p className="text-sm text-white">{title}</p>
        {text && <p className="mt-0.5 text-xs text-muted">{text}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="mb-3 text-sm font-medium text-white">{title}</p>
      {children}
    </div>
  )
}

function ProfileSection() {
  const { name, update } = useSettings()
  const [value, setValue] = useState(name)
  return (
    <>
      <div className="flex items-center gap-4">
        <AIAvatar size={64} online />
        <div>
          <p className="text-base font-medium text-white">{name}</p>
          <p className="text-xs text-muted">Personal workspace · stored on this device</p>
        </div>
      </div>
      <Block title="Display name">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!value.trim()) return
            update({ name: value.trim() })
            toast('Name updated')
          }}
          className="flex max-w-md gap-2"
        >
          <input value={value} onChange={(e) => setValue(e.target.value)} aria-label="Display name" className="field" />
          <button type="submit" disabled={!value.trim() || value.trim() === name} className="btn-primary shrink-0 rounded-xl px-4 text-sm">
            Save
          </button>
        </form>
        <p className="mt-2 text-xs text-subtle">Mr Balogun uses your first name in greetings.</p>
      </Block>
    </>
  )
}

function AISection() {
  const s = useSettings()
  return (
    <>
      <Block title="Personality">
        <OptionCards
          value={s.personality}
          onChange={(personality) => s.update({ personality })}
          options={[
            { value: 'professional', label: 'Professional', icon: <Briefcase className="size-5" /> },
            { value: 'friendly', label: 'Friendly', icon: <Smile className="size-5" /> },
            { value: 'creative', label: 'Creative', icon: <Palette className="size-5" /> },
          ]}
          className="max-w-lg"
        />
      </Block>
      <Block title="Response style">
        <OptionCards
          value={s.responseStyle}
          onChange={(responseStyle) => s.update({ responseStyle })}
          options={[
            { value: 'concise', label: 'Concise', icon: <AlignLeft className="size-5" /> },
            { value: 'balanced', label: 'Balanced', icon: <AlignJustify className="size-5" /> },
            { value: 'detailed', label: 'Detailed', icon: <ScrollText className="size-5" /> },
          ]}
          className="max-w-lg"
        />
      </Block>
      <Block title="Behaviour">
        <Row title="Send with Enter" text="Press Shift + Enter for a new line.">
          <Switch checked={s.sendOnEnter} onChange={(sendOnEnter) => s.update({ sendOnEnter })} label="Send with Enter" />
        </Row>
      </Block>
      <Block title="AI engine">
        <div className="flex items-start gap-3 rounded-xl border border-line bg-ink-800/50 p-4">
          <span className="icon-box size-10 shrink-0">
            <Cpu className="size-5" />
          </span>
          <div>
            <p className="text-sm text-white">{provider.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Replies are generated on your device so you can explore the full experience. The engine sits behind a single provider interface, so a hosted model can be plugged in without changing the app.
            </p>
          </div>
        </div>
      </Block>
    </>
  )
}

function VoiceSection() {
  const s = useSettings()
  const voices = useVoices()
  return (
    <>
      <Row title="Read replies aloud" text="Mr Balogun speaks every reply. Voice messages always get a spoken reply.">
        <Switch checked={s.speakReplies} onChange={(speakReplies) => s.update({ speakReplies })} label="Read replies aloud" />
      </Row>
      <Row title="Voice" text={canSpeak() ? 'Voices come from your device and browser.' : 'Speech is not supported in this browser.'}>
        <select
          value={s.voiceURI ?? ''}
          onChange={(e) => s.update({ voiceURI: e.target.value || null })}
          disabled={!voices.length}
          aria-label="Voice"
          className="field w-full max-w-64 sm:w-64"
        >
          <option value="">System default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
      </Row>
      <Row title="Speaking rate" text={`${s.voiceRate.toFixed(1)}×`}>
        <input
          type="range"
          min={0.6}
          max={1.6}
          step={0.1}
          value={s.voiceRate}
          onChange={(e) => s.update({ voiceRate: Number(e.target.value) })}
          aria-label="Speaking rate"
          className="w-56 accent-cyan-400"
        />
      </Row>
      <Row title="Test voice">
        <button onClick={() => speak(`Hi, I'm Mr Balogun. This is how I sound.`)} disabled={!canSpeak()} className="btn-ghost px-4 py-2 text-sm">
          <Play className="text-hue size-4" /> Play sample
        </button>
      </Row>
      <Row title="Voice input" text={canListen() ? 'Your browser supports speech recognition.' : 'Use Chrome or Edge for voice input.'}>
        <span className={cn('flex items-center gap-2 text-xs', canListen() ? 'text-online' : 'text-muted')}>
          <Mic className="size-4" /> {canListen() ? 'Available' : 'Unavailable'}
        </span>
      </Row>
    </>
  )
}

function AppearanceSection() {
  const s = useSettings()
  return (
    <>
      <Block title="Theme">
        <OptionCards
          value={s.theme}
          onChange={(theme) => s.update({ theme })}
          options={[
            { value: 'dark', label: 'Dark', icon: <Moon className="size-5" /> },
            { value: 'midnight', label: 'Midnight', icon: <MoonStar className="size-5" /> },
            { value: 'auto', label: 'Auto', icon: <SunMoon className="size-5" /> },
          ]}
          className="max-w-lg"
        />
        <p className="mt-2 text-xs text-subtle">Auto switches to Midnight between 8 PM and 6 AM.</p>
      </Block>
      <Block title="Effects">
        <Row title="Neon glow" text="Soften the blue glow on buttons and panels.">
          <OptionCards
            value={s.glow}
            onChange={(glow) => s.update({ glow })}
            options={[
              { value: 'full', label: 'Full' },
              { value: 'low', label: 'Subtle' },
            ]}
            className="w-48"
          />
        </Row>
        <Row title="Reduce motion" text="Minimise animations and transitions.">
          <Switch checked={s.reduceMotion} onChange={(reduceMotion) => s.update({ reduceMotion })} label="Reduce motion" />
        </Row>
      </Block>
    </>
  )
}

function NotificationsSection() {
  const s = useSettings()
  const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied')
  return (
    <>
      <Row title="Task reminders" text="Get nudged about tasks due today.">
        <Switch checked={s.notifyTasks} onChange={(notifyTasks) => s.update({ notifyTasks })} label="Task reminders" />
      </Row>
      <Row title="Daily briefing" text="A morning summary of your day.">
        <Switch checked={s.notifyBriefing} onChange={(notifyBriefing) => s.update({ notifyBriefing })} label="Daily briefing" />
      </Row>
      <Row title="Product updates" text="New tools and features.">
        <Switch checked={s.notifyProduct} onChange={(notifyProduct) => s.update({ notifyProduct })} label="Product updates" />
      </Row>
      <Row title="Browser notifications" text={perm === 'granted' ? 'Enabled for this browser.' : 'Allow Mr Balogun to show notifications.'}>
        <button
          disabled={perm === 'granted' || typeof Notification === 'undefined'}
          onClick={async () => setPerm(await Notification.requestPermission())}
          className="btn-ghost px-4 py-2 text-sm"
        >
          {perm === 'granted' ? 'Enabled' : 'Enable'}
        </button>
      </Row>
    </>
  )
}

const STORE_KEYS = ['mrb-settings', 'mrb-chat', 'mrb-tasks', 'mrb-memories', 'mrb-calendar', 'mrb-files', 'mrb-activity', 'mrb-assistant', 'mrb-notifications-seen']

function DataSection() {
  const [confirm, setConfirm] = useState(false)
  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: useSettings.getState(),
      conversations: useChat.getState().conversations,
      tasks: useTasks.getState().tasks,
      memories: useMemories.getState().memories,
      events: useCalendar.getState().events,
      files: useFiles.getState().files,
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    a.download = `mr-balogun-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    toast('Export downloaded')
  }

  return (
    <>
      <div className="rounded-xl border border-line bg-ink-800/50 p-4 text-xs leading-relaxed text-muted">
        Everything — conversations, tasks, memories, files and settings — is stored privately in this browser. Nothing is sent to a server.
      </div>
      <Row title="Export your data" text="Download conversations, tasks, memories and settings as JSON.">
        <button onClick={exportData} className="btn-ghost px-4 py-2 text-sm">
          <Download className="text-hue size-4" /> Export
        </button>
      </Row>
      <Row title="Reset everything" text="Delete all data and restore the starting workspace.">
        <button onClick={() => setConfirm(true)} className="rounded-[10px] border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20">
          <span className="flex items-center gap-2">
            <Trash2 className="size-4" /> Reset
          </span>
        </button>
      </Row>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Reset Mr Balogun?">
        <p className="text-sm text-muted">This permanently deletes all conversations, tasks, memories, files and settings on this device.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setConfirm(false)} className="btn-ghost px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={async () => {
              STORE_KEYS.forEach((k) => localStorage.removeItem(k))
              await clearIdb()
              window.location.assign('/app')
            }}
            className="rounded-[10px] border border-danger/50 bg-danger/15 px-4 py-2 text-sm text-danger hover:bg-danger/25"
          >
            Delete everything
          </button>
        </div>
      </Modal>
    </>
  )
}

const RENDER: Record<SectionId, () => ReactNode> = {
  profile: () => <ProfileSection />,
  ai: () => <AISection />,
  voice: () => <VoiceSection />,
  appearance: () => <AppearanceSection />,
  notifications: () => <NotificationsSection />,
  data: () => <DataSection />,
}

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = (SECTIONS.find((s) => s.id === params.get('tab'))?.id ?? 'profile') as SectionId
  const current = SECTIONS.find((s) => s.id === tab)!

  return (
    <Page>
      <PageHeader title="Settings" subtitle="Personalise Mr Balogun and manage your data." />
      <div className="mt-6 grid gap-5 lg:grid-cols-[230px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setParams({ tab: s.id }, { replace: true })}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors',
                s.hue,
                tab === s.id ? 'chip-active' : 'border-transparent text-fg-soft hover:bg-white/[0.03] hover:text-white',
              )}
            >
              <s.icon className={cn('text-hue size-[18px]', tab !== s.id && 'opacity-60')} />
              {s.label}
            </button>
          ))}
        </nav>
        <Panel className={cn('p-5 sm:p-6', current.hue)}>
          <h2 className={cn('mb-5 flex items-center gap-3 text-lg font-semibold text-white', current.hue)}>
            <span className="icon-box size-9 rounded-xl">
              <current.icon className="size-[18px]" />
            </span>
            {current.label}
          </h2>
          {RENDER[tab]()}
        </Panel>
      </div>
    </Page>
  )
}
