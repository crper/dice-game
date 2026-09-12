import type { OpenResult } from '../types/game'
import { SEAT_LABELS } from '../lib/copy'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Panel } from './ui/Panel'
import { PipFace } from './ui/PipFace'
import { CheckIcon, DiceIcon, TargetIcon } from './ui/icons'
import { formatCall } from '../lib/liarDice'

export interface ResultCardProps {
  result: OpenResult
  onesWild: boolean
  onNextRound: () => void
}

/**
 * Post-challenge breakdown: who won, why, and the arithmetic behind it. The
 * called face is highlighted in both hands so the count can be verified by eye.
 */
export function ResultCard({ result, onesWild, onNextRound }: ResultCardProps) {
  const playerWon = result.winner === 'player'
  const claimHeld = result.actualCount >= result.call.quantity

  return (
    <Panel
      title="本局判定"
      icon={<TargetIcon className="h-4 w-4" />}
      className={cn(
        'animate-rise-in ring-1 ring-inset',
        playerWon ? 'ring-emerald-400/25' : 'ring-rose-400/25',
      )}
      actions={
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-medium',
            playerWon ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200',
          )}
        >
          {playerWon ? '你赢' : '对手赢'}
        </span>
      }
    >
      <p className="text-sm leading-6 text-slate-300">
        {SEAT_LABELS[result.opener]}开盅，质疑{SEAT_LABELS[result.caller]}「
        <span className="font-medium text-white">{formatCall(result.call)}</span>
        」。全桌实有
        <span className={cn('tnum mx-1 font-semibold', claimHeld ? 'text-emerald-300' : 'text-rose-300')}>
          {result.actualCount}
        </span>
        个 {result.call.face} 点，
        {claimHeld ? '叫骰成立，开盅方受罚。' : '叫骰不成立，叫骰方受罚。'}
      </p>

      <div className="mt-4 space-y-3">
        <HandRow
          label={SEAT_LABELS.player}
          values={result.playerValues}
          highlight={result.call.face}
          onesWild={onesWild}
        />
        <HandRow
          label={SEAT_LABELS.ai}
          values={result.aiValues}
          highlight={result.call.face}
          onesWild={onesWild}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-black/25 px-3 py-2.5">
          <div className="tnum text-xl font-semibold text-white">
            {result.actualCount}
            <span className="text-sm text-slate-400"> / {result.call.quantity}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">实有 / 叫数</div>
        </div>
        <div className="rounded-xl bg-black/25 px-3 py-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xl font-semibold text-white">
            <PipFace value={result.call.face} className="h-6 w-6" />
            {onesWild && result.call.face !== 1 ? (
              <span className="text-xs font-normal text-amber-200">含 1</span>
            ) : null}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">本局判定点数</div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        className="mt-4"
        onClick={onNextRound}
        leading={<DiceIcon className="h-4.5 w-4.5" />}
      >
        下一局
      </Button>
    </Panel>
  )
}

function HandRow({
  label,
  values,
  highlight,
  onesWild,
}: {
  label: string
  values: number[]
  highlight: number
  onesWild: boolean
}) {
  const counts = (value: number) => value === highlight || (onesWild && value === 1 && highlight !== 1)
  const hits = values.filter(counts).length

  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <CheckIcon className="h-3 w-3" />
          计入 <span className="tnum font-medium text-slate-200">{hits}</span> 个
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value, index) => (
          <PipFace
            key={index}
            value={value}
            tone={counts(value) ? 'highlight' : 'ivory'}
            className="h-7 w-7"
          />
        ))}
      </div>
    </div>
  )
}
