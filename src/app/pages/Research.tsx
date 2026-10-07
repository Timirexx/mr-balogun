import { Globe2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { getTool } from '@/lib/tools/registry'
import ToolRunner from './ToolRunner'

/** Research is the registry's research tool promoted to a top-level workspace. */
export default function Research() {
  if (!getTool('research')) return <Navigate to="/app/skills" replace />
  return (
    <ToolRunner
      toolId="research"
      intro={
        <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-line bg-[rgba(22,20,18,0.7)] p-4">
          <Globe2 className="size-[18px] shrink-0 text-brand-500" />
          <span className="min-w-0 flex-1">
            <b className="block text-xs text-white">Web search isn’t connected yet</b>
            <small className="text-[10px] text-[#817a74]">Catt builds the brief offline for now, and will cite sources once a search provider is wired up.</small>
          </span>
          <span className="font-display shrink-0 text-[9px] text-[#b08a6a]">OFFLINE</span>
        </div>
      }
    />
  )
}
