import { useCallback, useRef, useState } from 'react'
import type { GameMode, OpenModeVerdict, OpenResult, Phase, Turn } from '../types/game'
import type { CameraPreset } from '../three/DiceScene'
import { useDiceScene } from '../hooks/useDiceScene'
import { CAMERA_PRESETS, PHASE_LABELS, ROLL_FAILED_MESSAGE, SEAT_LABELS, STAGE_COPY, TRAY_LABELS, VIEW_HINT } from '../lib/copy'
import { cn } from '../lib/cn'
import { PipFace } from './ui/PipFace'
import { Button } from './ui/Button'
import { DiceIcon } from './ui/icons'

export interface DiceStageProps {
  mode: GameMode
  /** 2 seats in Liar's Dice, 1 shared hand in open mode. */
  seats: 1 | 2
  diceCount: number
  /** Changes on every roll; drives the animation exactly once per roll. */
  rollId: number
  playerDice: number[]
  aiDice: number[]
  aiRevealed: boolean
  phase: Phase
  round: number
  firstTurn: Turn
  /** Present once a challenge has been decided. */
  result: OpenResult | null
  /** Open mode only: powers the compact result readout on the felt. */
  verdict: OpenModeVerdict | null
  reduceMotion: boolean
  onSettle: () => void
  /** Open mode: throw the dice again. */
  onRoll: () => void
  /** Liar's Dice: bring the bidding console into view. */
  onGoToBid: () => void
}

/** A pointer press counts as a tap only if it barely moved and ended quickly. */
const TAP_SLOP_PX = 9
const TAP_MAX_MS = 650

/**
 * Hosts the WebGL canvas and every overlay that sits on the table.
 *
 * React owns no dice state here — the scene is driven through `useDiceScene`.
 * Interaction intent:
 * - the camera is constrained to the front of the table and has angle presets,
 *   so looking around never reorders the seats;
 * - in open mode the felt itself is the roll button;
 * - in Liar's Dice the felt stays inert and the console drives play.
 */
export function DiceStage(props: DiceStageProps) {
  const {
    mode,
    seats,
    diceCount,
    rollId,
    playerDice,
    aiDice,
    aiRevealed,
    phase,
    round,
    firstTurn,
    result,
    verdict,
    reduceMotion,
    onSettle,
    onRoll,
    onGoToBid,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { failed, setView } = useDiceScene({
    containerRef,
    canvasRef,
    onSettle,
    labels: TRAY_LABELS,
    diceCount,
    seats,
    reduceMotion,
    rollId,
    playerDice,
    aiDice,
    aiRevealed,
  })

  // The active preset is UI state: the scene flies to an angle but never
  // reports one back, and dragging leaves the last chosen angle highlighted.
  const [view, setViewState] = useState<CameraPreset>('default')
  const chooseView = useCallback(
    (preset: CameraPreset) => {
      setViewState(preset)
      setView(preset)
    },
    [setView],
  )
  const cycleView = useCallback(() => {
    const order = CAMERA_PRESETS.map((entry) => entry.preset as CameraPreset)
    chooseView(order[(order.indexOf(view) + 1) % order.length])
  }, [chooseView, view])
  const currentViewLabel =
    CAMERA_PRESETS.find((entry) => entry.preset === view)?.label ?? CAMERA_PRESETS[1].label

  const rolling = phase === 'rolling'
  const thinking = phase === 'ai-thinking'
  const playerTurn = phase === 'awaiting-call'
  const canRoll = mode === 'open' && !rolling

  // ---- tap-to-roll on the felt (open mode only). A drag to look around must
  // not also throw the dice, so the press is only a tap if it barely moved.
  const pressRef = useRef<{ x: number; y: number; at: number } | null>(null)

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    pressRef.current = { x: event.clientX, y: event.clientY, at: performance.now() }
  }, [])

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const press = pressRef.current
      pressRef.current = null
      if (!press || !canRoll) return
      const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y)
      if (moved <= TAP_SLOP_PX && performance.now() - press.at <= TAP_MAX_MS) onRoll()
    },
    [canRoll, onRoll],
  )

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-room-900 shadow-[0_40px_80px_-50px_rgb(0_0_0/1)] sm:rounded-3xl">
      <div
        ref={containerRef}
        className={cn(
          'relative w-full',
          'aspect-[4/5] max-h-[58dvh] min-h-[260px]',
          'sm:aspect-[4/3] lg:aspect-[16/10] lg:max-h-[min(56vh,620px)]',
        )}
      >
        <canvas
          ref={canvasRef}
          className={cn('absolute inset-0 h-full w-full', canRoll && 'cursor-pointer')}
          aria-hidden="true"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />

        {/* Vignette: deepens the corners without touching the renderer. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_38%,transparent_35%,rgb(3_5_10/0.5)_78%,rgb(3_5_10/0.88)_100%)]"
        />

        {failed ? (
          <FlatFallback playerDice={playerDice} aiDice={aiDice} aiRevealed={aiRevealed} seats={seats} />
        ) : null}

        {/* Top-left: round state */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 flex max-w-[calc(100%-3.75rem)] flex-wrap items-center gap-1.5 sm:top-4 sm:left-4 sm:max-w-[calc(100%-11rem)] sm:gap-2">
          <Chip>第 {Math.max(round, 1)} 局</Chip>
          <Chip>
            {mode === 'liar' ? `每人 ${diceCount} 颗 · 共 ${diceCount * 2} 颗` : `共 ${diceCount} 颗`}
          </Chip>
          {mode === 'liar' && phase !== 'idle' ? (
            <Chip tone="amber">本局 {SEAT_LABELS[firstTurn]} 先叫</Chip>
          ) : null}
        </div>

        {/* Top-right: camera presets. Looking around should not require a drag,
            and on a narrow stage the three angles collapse into one cycler so
            they never collide with the round chips. */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2 sm:top-4 sm:right-4">
          <span className="pointer-events-none hidden rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-slate-400 backdrop-blur xl:block">
            {VIEW_HINT}
          </span>

          <div
            role="group"
            aria-label="视角"
            className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-black/45 p-0.5 backdrop-blur sm:flex"
          >
            {CAMERA_PRESETS.map(({ preset, label }) => (
              <button
                key={preset}
                type="button"
                aria-pressed={view === preset}
                onClick={() => chooseView(preset as CameraPreset)}
                className={cn(
                  'rounded-full px-2 py-1 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70',
                  view === preset
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-white/12 hover:text-white',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={cycleView}
            aria-label={`切换视角，当前${currentViewLabel}`}
            className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur transition hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 sm:hidden"
          >
            {currentViewLabel}
          </button>
        </div>

        {/* Winner banner. The subtitle is derived from the actual judgement —
            a player can win either by opening successfully or by having their
            own bid hold up, and each case reads differently. */}
        {result && phase === 'round-over' ? (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-4">
            <div
              className={cn(
                'animate-pop-in rounded-2xl border px-5 py-2.5 text-center backdrop-blur-md',
                result.winner === 'player'
                  ? 'border-emerald-300/35 bg-emerald-500/18 text-emerald-100'
                  : 'border-rose-300/35 bg-rose-500/18 text-rose-100',
              )}
            >
              <div className="text-lg font-semibold">
                {result.winner === 'player' ? '你赢了这一局' : '对手赢了这一局'}
              </div>
              <div className="text-[11px] opacity-80">{resultHeadline(result)}</div>
            </div>
          </div>
        ) : null}

        {/* Bottom: phase status and the primary table action */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex flex-col items-center gap-2 px-3 sm:bottom-4 sm:px-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <StatusPill
              phase={phase}
              rolling={rolling}
              thinking={thinking}
              playerTurn={playerTurn}
              mode={mode}
              verdict={verdict}
            />

            {playerTurn && mode === 'liar' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={onGoToBid}
                className="pointer-events-auto h-8 rounded-full px-3.5 text-[12px]"
              >
                {STAGE_COPY.goToBid}
              </Button>
            ) : null}

            {mode === 'open' ? (
              <Button
                variant="primary"
                size="sm"
                disabled={rolling}
                onClick={onRoll}
                leading={<DiceIcon className={cn('h-3.5 w-3.5', rolling && 'animate-soft-pulse')} />}
                className="pointer-events-auto h-9 rounded-full px-4 text-[13px]"
              >
                {rolling ? STAGE_COPY.rolling : verdict ? STAGE_COPY.rollAgain : STAGE_COPY.rollNow}
              </Button>
            ) : null}
          </div>

          {canRoll ? (
            <span className="pointer-events-none text-[10px] text-slate-500 sm:text-[11px]">
              {STAGE_COPY.rollHint}
            </span>
          ) : null}
        </div>
      </div>

      {failed ? (
        <p className="border-t border-white/8 bg-black/30 px-4 py-2 text-center text-[11px] text-amber-200/80">
          {ROLL_FAILED_MESSAGE}
        </p>
      ) : null}
    </div>
  )
}

function Chip({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'amber' }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 text-[10px] backdrop-blur sm:px-3 sm:text-[11px]',
        tone === 'amber'
          ? 'border-amber-300/25 bg-amber-400/12 text-amber-200'
          : 'border-white/12 bg-black/45 text-slate-300',
      )}
    >
      {children}
    </span>
  )
}

/** The table's status line: phase, plus the open-mode total once it is known. */
function StatusPill({
  phase,
  rolling,
  thinking,
  playerTurn,
  mode,
  verdict,
}: {
  phase: Phase
  rolling: boolean
  thinking: boolean
  playerTurn: boolean
  mode: GameMode
  verdict: OpenModeVerdict | null
}) {
  const settled = mode === 'open' && !rolling && verdict && phase === 'round-over'

  return (
    <div
      className={cn(
        'relative flex items-center gap-2.5 overflow-hidden rounded-full border px-3.5 py-2 text-[11px] backdrop-blur-md transition-colors sm:px-4 sm:text-xs',
        playerTurn
          ? 'border-emerald-300/40 bg-emerald-500/15 text-emerald-100'
          : thinking || rolling
            ? 'border-amber-300/35 bg-amber-400/12 text-amber-100'
            : 'border-white/12 bg-black/45 text-slate-300',
      )}
      role="status"
      aria-live="polite"
    >
      {rolling ? (
        <DiceIcon className="h-3.5 w-3.5 animate-soft-pulse" />
      ) : (
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            playerTurn && 'animate-ring-pulse bg-emerald-400',
            thinking && 'animate-soft-pulse bg-amber-300',
            !playerTurn && !thinking && 'bg-slate-500',
          )}
        />
      )}

      {settled ? (
        <span className="tnum flex items-center gap-2 font-medium">
          <span className="text-slate-400">{STAGE_COPY.totalLabel}</span>
          <span className="text-base font-semibold text-white">{verdict.summary.sum}</span>
          <span className="rounded-full bg-white/12 px-2 py-0.5 text-[11px] text-slate-200">
            {verdict.label}
          </span>
        </span>
      ) : (
        <span className="font-medium">{PHASE_LABELS[phase]}</span>
      )}

      {thinking ? (
        <span className="flex items-center gap-0.5" aria-hidden="true">
          <span className="h-1 w-1 animate-soft-pulse rounded-full bg-current" />
          <span className="h-1 w-1 animate-soft-pulse rounded-full bg-current" style={{ animationDelay: '160ms' }} />
          <span className="h-1 w-1 animate-soft-pulse rounded-full bg-current" style={{ animationDelay: '320ms' }} />
        </span>
      ) : null}

      {rolling ? (
        <span
          aria-hidden="true"
          className="animate-sweep pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />
      ) : null}
    </div>
  )
}

/** Plain-language reason for the outcome, kept next to the banner it explains. */
function resultHeadline(result: OpenResult): string {
  const playerWon = result.winner === 'player'
  const playerOpened = result.opener === 'player'

  if (playerOpened) {
    return playerWon ? '开盅成功，对手的叫骰不成立' : '开盅失败，对手的叫骰成立'
  }
  return playerWon ? '叫骰成立，对手开盅失败' : '叫骰不成立，你被罚一杯'
}

/** Rendered only when WebGL is unavailable — same information, no 3D. */
function FlatFallback({
  playerDice,
  aiDice,
  aiRevealed,
  seats,
}: {
  playerDice: number[]
  aiDice: number[]
  aiRevealed: boolean
  seats: 1 | 2
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-felt-700/60 to-room-950 px-4 py-10">
      {seats === 2 ? (
        <FlatRow label={SEAT_LABELS.ai} values={aiDice} tone={aiRevealed ? 'ivory' : 'concealed'} />
      ) : null}
      <FlatRow label={seats === 2 ? SEAT_LABELS.player : TRAY_LABELS.shared} values={playerDice} tone="ivory" />
    </div>
  )
}

function FlatRow({ label, values, tone }: { label: string; values: number[]; tone: 'ivory' | 'concealed' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] tracking-wide text-slate-400">{label}</span>
      <div className="flex max-w-md flex-wrap justify-center gap-2">
        {values.map((value, index) => (
          <PipFace key={index} value={value} tone={tone} className="h-9 w-9" />
        ))}
      </div>
    </div>
  )
}
