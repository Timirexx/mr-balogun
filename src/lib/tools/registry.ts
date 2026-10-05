import {
  BookOpen,
  CalendarDays,
  Lightbulb,
  Mail,
  PenLine,
  Scale,
  ScanSearch,
  FileText,
  Sparkles,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { HUE, type Hue } from '../hues'

export type ToolCategory = 'Research' | 'Writing' | 'Planning' | 'Thinking'

export interface ToolDefinition {
  id: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  category: ToolCategory
  placeholder: string
  instructions: string
  examples: string[]
}

// Add a new AI tool by appending a definition here. The tool page, picker,
// and command palette pick it up automatically; the AI provider receives
// `instructions` as the tool's system guidance.
export const TOOLS: ToolDefinition[] = [
  {
    id: 'research',
    name: 'Research',
    tagline: 'Deep-dive any topic',
    description: 'Turn a question into a structured research brief with key questions, angles and next steps.',
    icon: ScanSearch,
    category: 'Research',
    placeholder: 'What do you want to research? e.g. "AI assistants for small businesses"',
    instructions: 'Produce a structured research brief: overview, key questions, angles, sources to check, next steps.',
    examples: ['The future of remote work', 'How to price a SaaS product', 'Best habits for deep focus'],
  },
  {
    id: 'summarize',
    name: 'Summarize',
    tagline: 'Get the key points fast',
    description: 'Paste text or pick a file — get the main points, keywords and a one-line TL;DR.',
    icon: FileText,
    category: 'Research',
    placeholder: 'Paste the text you want summarized…',
    instructions: 'Summarize the input into a TL;DR, key points and keywords.',
    examples: [],
  },
  {
    id: 'write',
    name: 'Write',
    tagline: 'Drafts in seconds',
    description: 'Blog posts, captions, bios, announcements — a clean first draft in your voice.',
    icon: PenLine,
    category: 'Writing',
    placeholder: 'What should I write? e.g. "A LinkedIn post about launching my AI assistant"',
    instructions: 'Write a polished first draft with a hook, body and call to action.',
    examples: ['A short bio for my portfolio', 'An announcement for a new product', 'A thank-you note to my team'],
  },
  {
    id: 'email',
    name: 'Email Drafter',
    tagline: 'Professional emails',
    description: 'Describe the situation and get a clear, well-structured email ready to send.',
    icon: Mail,
    category: 'Writing',
    placeholder: 'Who is it for and what do you need? e.g. "Follow up with a client about an unpaid invoice"',
    instructions: 'Draft an email with subject line, greeting, concise body and sign-off.',
    examples: ['Ask my manager for a day off', 'Follow up after a job interview', 'Pitch a collaboration'],
  },
  {
    id: 'rewrite',
    name: 'Rewrite & Polish',
    tagline: 'Sharper, clearer text',
    description: 'Clean up grammar, tighten wording and make your writing land.',
    icon: Sparkles,
    category: 'Writing',
    placeholder: 'Paste the text you want polished…',
    instructions: 'Rewrite the input to be clearer and more concise while keeping the meaning.',
    examples: [],
  },
  {
    id: 'plan',
    name: 'Plan My Day',
    tagline: 'A realistic schedule',
    description: 'Builds a time-blocked plan from your tasks, calendar and the way you like to work.',
    icon: CalendarDays,
    category: 'Planning',
    placeholder: 'Anything special today? e.g. "I have a deadline at 5pm and want to hit the gym"',
    instructions: 'Create a time-blocked plan for today using the user tasks, events and preferences.',
    examples: ['Plan my day around a 3pm meeting', 'Plan a light, recovery-focused day'],
  },
  {
    id: 'decide',
    name: 'Decision Helper',
    tagline: 'Think it through',
    description: 'Lay out options, weigh trade-offs and get a clear recommendation framework.',
    icon: Scale,
    category: 'Thinking',
    placeholder: 'What are you deciding? e.g. "Should I take the new job or stay?"',
    instructions: 'Compare options with criteria, pros and cons, and a recommendation framework.',
    examples: ['Freelance or full-time?', 'Build an app or a website first?', 'Move cities or stay?'],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    tagline: 'Ideas on demand',
    description: 'Generate fresh, varied ideas for projects, content, names, gifts and more.',
    icon: Lightbulb,
    category: 'Thinking',
    placeholder: 'What do you need ideas for? e.g. "Names for a productivity podcast"',
    instructions: 'Generate a varied list of creative ideas grouped by angle.',
    examples: ['YouTube video ideas', 'Weekend side projects', 'Birthday gift ideas'],
  },
  {
    id: 'study',
    name: 'Study Coach',
    tagline: 'Learn anything faster',
    description: 'Get a learning roadmap, practice questions and a study schedule for any subject.',
    icon: GraduationCap,
    category: 'Planning',
    placeholder: 'What do you want to learn? e.g. "Basics of machine learning in 4 weeks"',
    instructions: 'Create a learning roadmap with milestones, practice questions and schedule.',
    examples: ['Learn SQL in 3 weeks', 'Prepare for a public speaking event'],
  },
  {
    id: 'explain',
    name: 'Explain Simply',
    tagline: 'Complex → clear',
    description: 'Break down any concept with plain language, analogies and examples.',
    icon: BookOpen,
    category: 'Thinking',
    placeholder: 'What should I explain? e.g. "How does compound interest work?"',
    instructions: 'Explain the concept simply with an analogy, an example and key takeaways.',
    examples: ['What is an API?', 'How do neural networks learn?', 'What is inflation?'],
  },
]

export const getTool = (id: string | undefined) => TOOLS.find((t) => t.id === id)

export const CATEGORY_HUE: Record<ToolCategory, Hue> = {
  Research: 'cyan',
  Writing: 'violet',
  Planning: 'emerald',
  Thinking: 'amber',
}

export const toolHue = (t: ToolDefinition) => HUE[CATEGORY_HUE[t.category]]
