import type { CallRecord, Turn } from '../types/game'
import { SEAT_LABELS } from '../lib/copy'
import { cn } from '../lib/cn'
import { Panel } from './ui/Panel'
import { PipFace } from './ui/PipFace'
import { LayersIcon } from './ui/icons'
import { formatCall } from '../lib/liarDice'

/** Chronological bidding log, newest entry highlighted. */
export function BidHistory({ log, opener }: { log: CallRecord[]; opener: Turn | null }) {
  const lastIndex = log.length - 1

  return (
    <Panel
      title="叫骰记录"
      icon={<LayersIcon className="h-4 w-4" />}
      actions={<span className="text-[11px] text-slate-400">{log.length} 条</span>}
      flush
    >
      {log.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs leading-5 text-slate-500">
          还没有叫骰记录。
          <br />
          叫出第一口，记录就会出现在这里。
        </p>
      ) : (
        <ol className="scroll-slim max-h-72 overflow-y-auto px-2 py-1.5">
          {log.map((record, index) => {
            const isLast = index === lastIndex
            const isPlayer = record.by === 'player'
            return (
              <li
                key={index}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-2.5 py-2 transition',
                  isLast && !opener && 'bg-white/[0.07] ring-1 ring-inset ring-white/10',
                )}
              >
                <span className="tnum w-5 shrink-0 text-center text-[11px] text-slate-500">{index + 1}</span>
                <span
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-medium',
                    isPlayer ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200',
                  )}
                >
                  {isPlayer ? '你' : '对'}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{formatCall(record.call)}</span>
                <PipFace value={record.call.face} className="h-5 w-5" />
              </li>
            )
          })}
        </ol>
      )}

      {opener && log.length > 0 ? (
        <p className="border-t border-white/8 px-4 py-2 text-[11px] text-slate-500">
          本局由{SEAT_LABELS[opener]}开盅结束
        </p>
      ) : null}
    </Panel>
  )
}
