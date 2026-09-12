import type { OpenModeVerdict } from '../types/game'
import { faceDistribution } from '../lib/stats'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Panel } from './ui/Panel'
import { PipFace } from './ui/PipFace'
import { ChartIcon, DiceIcon } from './ui/icons'

export interface OpenRollCardProps {
  verdict: OpenModeVerdict
  /** While true the numbers stay hidden so the roll is not spoiled mid-air. */
  rolling: boolean
  onRoll: () => void
  reducedMotion: boolean
}

/**
 * Result report for open (明牌) mode: the roll, its verdict and its shape.
 *
 * The dice values exist before the animation finishes, so every figure here is
 * withheld until `rolling` clears — otherwise the table would announce the
 * outcome while the dice are still tumbling.
 */
export function OpenRollCard({ verdict, rolling, onRoll, reducedMotion }: OpenRollCardProps) {
  const distribution = faceDistribution(verdict.summary)
  const peak = Math.max(1, ...distribution.map((row) => row.count))
  const average = verdict.summary.values.length ? verdict.summary.sum / verdict.summary.values.length : 0

  const tone = verdict.isAllSame || verdict.isStraight
    ? 'bg-amber-400/18 text-amber-200'
    : verdict.size === 'big'
      ? 'bg-rose-400/15 text-rose-200'
      : 'bg-emerald-400/15 text-emerald-200'

  return (
    <Panel
      title="开盅结果"
      icon={<ChartIcon className="h-4 w-4" />}
      className="animate-rise-in"
      actions={
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
            rolling ? 'bg-white/8 text-slate-400' : tone,
          )}
        >
          {rolling ? '开盅中' : verdict.label}
        </span>
      }
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-wide text-slate-400">点数和</div>
          <div
            className={cn(
              'tnum text-4xl font-semibold leading-tight transition-colors',
              rolling ? 'text-slate-600' : 'text-white',
            )}
          >
            {rolling ? '—' : verdict.summary.sum}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-slate-400">均值</div>
          <div className={cn('tnum text-lg font-medium', rolling ? 'text-slate-600' : 'text-slate-300')}>
            {rolling ? '—' : average.toFixed(1)}
          </div>
        </div>
      </div>

      <p
        className={cn(
          'mt-3 rounded-xl border border-white/8 bg-black/25 px-3.5 py-2.5 text-[13px] leading-5',
          rolling ? 'text-slate-500' : 'text-slate-300',
        )}
      >
        {rolling ? '骰子正在滚动，落定后公布结果。' : verdict.detail}
      </p>

      <div className={cn('mt-4 space-y-1.5 transition-opacity duration-300', rolling && 'opacity-30')}>
        {distribution.map((row) => (
          <div key={row.face} className="flex items-center gap-3">
            <PipFace value={row.face} className="h-5 w-5" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-[width] duration-500"
                style={{ width: rolling ? '0%' : `${(row.count / peak) * 100}%` }}
              />
            </div>
            <span className="tnum w-8 text-right text-xs text-slate-400">{rolling ? '·' : row.count}</span>
          </div>
        ))}
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        className="mt-4"
        disabled={rolling}
        onClick={onRoll}
        leading={<DiceIcon className={cn('h-4.5 w-4.5', rolling && 'animate-soft-pulse')} />}
      >
        {rolling ? '投掷中…' : reducedMotion ? '再来一次' : '再摇一次'}
      </Button>
    </Panel>
  )
}
