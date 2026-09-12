import type { Difficulty, GameMode, Score } from '../types/game'
import { DICE_MAX, DICE_MIN } from '../lib/constants'
import { DIFFICULTY_COPY } from '../lib/copy'
import { Panel } from './ui/Panel'
import { Stepper } from './ui/Stepper'
import { Switch } from './ui/Switch'
import { SegmentedControl } from './ui/SegmentedControl'
import { GaugeIcon } from './ui/icons'

export interface SetupPanelProps {
  mode: GameMode
  diceCount: number
  onDiceCountChange: (count: number) => void
  onesWild: boolean
  onOnesWildChange: (value: boolean) => void
  difficulty: Difficulty
  onDifficultyChange: (value: Difficulty) => void
  reduceMotion: boolean
  onReduceMotionChange: (value: boolean) => void
  /** Changing any of these mid-round restarts the round; we warn instead of surprising. */
  midRound: boolean
  score: Score
  round: number
  onResetScore: () => void
}

/** Table setup: everything that shapes a round. */
export function SetupPanel({
  mode,
  diceCount,
  onDiceCountChange,
  onesWild,
  onOnesWildChange,
  difficulty,
  onDifficultyChange,
  reduceMotion,
  onReduceMotionChange,
  midRound,
  score,
  round,
  onResetScore,
}: SetupPanelProps) {
  const isLiar = mode === 'liar'

  return (
    <Panel
      title="牌桌设置"
      icon={<GaugeIcon className="h-4 w-4" />}
      actions={
        <button
          type="button"
          onClick={onResetScore}
          className="rounded-lg px-2 py-1 text-[11px] text-slate-400 transition hover:bg-white/8 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
        >
          清零战绩
        </button>
      }
    >
      <Stepper
        label={isLiar ? '每人骰子数' : '骰子数量'}
        hint={isLiar ? `桌面共 ${diceCount * 2} 颗参与判定` : `一次投掷 ${diceCount} 颗`}
        value={diceCount}
        min={DICE_MIN}
        max={DICE_MAX}
        onChange={onDiceCountChange}
      />

      {midRound && isLiar ? (
        <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-400/8 px-3 py-2 text-[11px] leading-4 text-amber-200/85">
          调整设置会立即重开本局，当前叫骰记录将被清空。
        </p>
      ) : null}

      {/* 大话骰专属规则：明牌模式下不出现，避免两种玩法互相渗透。 */}
      {isLiar ? (
        <>
          <div className="mt-4 space-y-1 border-t border-white/8 pt-3">
            <Switch
              label="1 为万能"
              hint="骰子为 1 时，可当作任意点数参与判定"
              checked={onesWild}
              onChange={onOnesWildChange}
            />
          </div>

          <div className="mt-4 border-t border-white/8 pt-3">
            <div className="mb-2 text-[13px] font-medium text-slate-300">对手水平</div>
            <SegmentedControl
              name="difficulty"
              size="sm"
              value={difficulty}
              onChange={onDifficultyChange}
              options={(['easy', 'normal', 'hard'] as Difficulty[]).map((value) => ({
                value,
                label: DIFFICULTY_COPY[value].label,
              }))}
            />
            <p className="mt-2 text-[11px] leading-4 text-slate-500">{DIFFICULTY_COPY[difficulty].hint}</p>
          </div>
        </>
      ) : null}

      <div className="mt-4 space-y-1 border-t border-white/8 pt-3">
        <Switch
          label="减少动态效果"
          hint="跳过滚动动画，直接落定骰子"
          checked={reduceMotion}
          onChange={onReduceMotionChange}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3 text-center">
        <Stat label="局数" value={round} />
        <Stat label="你胜" value={score.player} tone="emerald" />
        <Stat label="对手胜" value={score.ai} tone="rose" />
      </div>
    </Panel>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'emerald' | 'rose' }) {
  return (
    <div className="rounded-xl bg-black/25 px-2 py-2">
      <div
        className={
          tone === 'emerald'
            ? 'tnum text-lg font-semibold text-emerald-300'
            : tone === 'rose'
              ? 'tnum text-lg font-semibold text-rose-300'
              : 'tnum text-lg font-semibold text-slate-200'
        }
      >
        {value}
      </div>
      <div className="text-[11px] text-slate-500">{label}</div>
    </div>
  )
}
