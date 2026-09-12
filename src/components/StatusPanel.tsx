import type { DiceGameApi } from '../hooks/useDiceGame'
import { PHASE_LABELS, SEAT_LABELS } from '../lib/copy'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Panel } from './ui/Panel'
import { DiceIcon, ResetIcon, SwordsIcon, TrophyIcon } from './ui/icons'

/**
 * Whose turn it is, what just happened, and the one action that moves the round
 * forward. This is the only place a new round is started from.
 */
export function StatusPanel({ game }: { game: DiceGameApi }) {
  const { state, isPlayerTurn, isBusy, totalDice } = game
  const isLiar = state.settings.mode === 'liar'
  const roundOver = state.phase === 'round-over'
  const playerWon = state.result?.winner === 'player'

  const primaryLabel = !isLiar
    ? isBusy
      ? '投掷中…'
      : '再摇一次'
    : roundOver
      ? '下一局'
      : '重开本局'

  return (
    <Panel
      title="对局状态"
      icon={<SwordsIcon className="h-4 w-4" />}
      actions={
        <span className="text-[11px] text-slate-400">
          {isLiar ? `${totalDice} 颗在桌` : `${totalDice} 颗一投`}
        </span>
      }
    >
      {isLiar ? (
        <div className="grid grid-cols-2 gap-2">
          <SeatCard
            label={SEAT_LABELS.player}
            tone="emerald"
            active={isPlayerTurn}
            subtitle={state.score.player > 0 ? `胜 ${state.score.player}` : undefined}
          />
          <SeatCard
            label={SEAT_LABELS.ai}
            tone="rose"
            active={state.phase === 'ai-thinking' || (state.lastCaller === 'ai' && !roundOver)}
            subtitle={state.score.ai > 0 ? `胜 ${state.score.ai}` : undefined}
          />
        </div>
      ) : (
        // Open mode has no opponent: showing seat cards would leak the other
        // mode into this one.
        <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5 text-[12px] leading-5 text-slate-400">
          {totalDice} 颗一起掷，没有对手。点数和、大小与豹子／顺子判定见「开盅结果」。
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/8 bg-black/25 px-3.5 py-2.5">
        {state.result ? (
          <TrophyIcon
            className={cn('h-4 w-4 shrink-0', playerWon ? 'text-emerald-300' : 'text-rose-300')}
          />
        ) : (
          <DiceIcon className="h-4 w-4 shrink-0 text-slate-400" />
        )}
        <span className="text-[13px] text-slate-300">
          {state.phase === 'idle' ? '点击开始，掷出第一把骰子' : PHASE_LABELS[state.phase]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <Button
          variant="primary"
          size="md"
          block
          disabled={isBusy}
          onClick={game.nextRound}
          leading={<DiceIcon className="h-4 w-4" />}
        >
          {primaryLabel}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          block
          onClick={game.reset}
          leading={<ResetIcon className="h-3.5 w-3.5" />}
          className="text-slate-400"
        >
          重置战绩与牌桌
        </Button>
      </div>
    </Panel>
  )
}

function SeatCard({
  label,
  tone,
  active,
  subtitle,
}: {
  label: string
  tone: 'emerald' | 'rose'
  active: boolean
  subtitle?: string
}) {
  const palette =
    tone === 'emerald'
      ? { ring: 'ring-emerald-300/60', text: 'text-emerald-200', dot: 'bg-emerald-400' }
      : { ring: 'ring-rose-300/60', text: 'text-rose-200', dot: 'bg-rose-400' }

  return (
    <div
      className={cn(
        'relative rounded-xl border px-3 py-2.5 transition',
        active ? `border-white/10 bg-white/[0.07] ring-1 ring-inset ${palette.ring}` : 'border-white/8 bg-black/20',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', active ? `${palette.dot} animate-soft-pulse` : 'bg-slate-600')} />
        <span className={cn('text-[13px] font-medium', active ? palette.text : 'text-slate-300')}>{label}</span>
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{active ? '当前行动' : (subtitle ?? '等待中')}</div>
    </div>
  )
}
