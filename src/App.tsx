import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { analyzeOpenRoll } from './lib/stats'
import { AUTHOR_COPY } from './lib/copy'
import { useDiceGame } from './hooks/useDiceGame'
import { Header } from './components/Header'
import { DiceStage } from './components/DiceStage'
import { BidPanel } from './components/BidPanel'
import { BidHistory } from './components/BidHistory'
import { SetupPanel } from './components/SetupPanel'
import { StatusPanel } from './components/StatusPanel'
import { ResultCard } from './components/ResultCard'
import { OpenRollCard } from './components/OpenRollCard'
import { RulesDialog } from './components/RulesDialog'

/**
 * Application shell.
 *
 * Layout intent: the table is always the largest element, the bid console sits
 * directly beneath it (so on a phone the next action is a thumb away), and the
 * secondary panels stack into a sidebar on wide screens.
 */
export default function App() {
  const game = useDiceGame()
  const { state, nextRound } = game

  const [rulesOpen, setRulesOpen] = useState(false)

  // Auto-start the very first round once, so the table is never empty on load.
  const booted = useRef(false)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    const timer = window.setTimeout(() => nextRound(), 220)
    return () => {
      window.clearTimeout(timer)
      // Reset so StrictMode's double-invoke still schedules exactly one roll.
      booted.current = false
    }
  }, [nextRound])

  const seats = state.settings.mode === 'liar' ? 2 : 1
  const verdict = useMemo(
    () =>
      state.settings.mode === 'open' && state.playerDice.length > 0
        ? analyzeOpenRoll(state.playerDice)
        : null,
    [state.settings.mode, state.playerDice],
  )

  // The console sits below the table, which can be off-screen on a phone; the
  // table's "go bid" affordance brings it into view.
  const bidPanelRef = useRef<HTMLDivElement>(null)
  const goToBid = useCallback(() => {
    bidPanelRef.current?.scrollIntoView({
      behavior: state.settings.reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }, [state.settings.reduceMotion])

  const toggleSound = useCallback(() => {
    game.setSoundEnabled(!state.settings.soundEnabled)
  }, [game, state.settings.soundEnabled])
  const roundOver = state.phase === 'round-over'

  return (
    <div className="min-h-full bg-room-950">
      {/* Ambient backdrop: two soft pools of light behind the table. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_45%_at_18%_-5%,rgb(29_122_86/0.28),transparent_70%),radial-gradient(55%_40%_at_88%_8%,rgb(251_191_36/0.14),transparent_72%)]"
      />

      <div className="relative">
        <Header
          mode={state.settings.mode}
          onModeChange={game.setMode}
          soundEnabled={state.settings.soundEnabled}
          onSoundToggle={toggleSound}
          onOpenRules={() => setRulesOpen(true)}
          busy={false}
        />

        <main className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          {/* Primary column: table, result, bidding console */}
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <DiceStage
              mode={state.settings.mode}
              seats={seats}
              diceCount={state.settings.diceCount}
              rollId={state.rollId}
              playerDice={state.playerDice}
              aiDice={state.aiDice}
              aiRevealed={state.aiRevealed}
              phase={state.phase}
              round={state.round}
              firstTurn={state.firstTurn}
              result={state.result}
              verdict={verdict}
              reduceMotion={state.settings.reduceMotion}
              onSettle={game.notifySettled}
              onRoll={game.nextRound}
              onGoToBid={goToBid}
            />

            {state.settings.mode === 'liar' && state.result && roundOver ? (
              <ResultCard
                result={state.result}
                onesWild={state.settings.onesWild}
                onNextRound={game.nextRound}
              />
            ) : null}

            {state.settings.mode === 'open' && verdict ? (
              <OpenRollCard
                verdict={verdict}
                rolling={state.phase === 'rolling'}
                onRoll={game.nextRound}
                reducedMotion={state.settings.reduceMotion}
              />
            ) : null}

            {state.settings.mode === 'liar' ? (
              <div ref={bidPanelRef} className="scroll-mt-24">
                <BidPanel
                  // Remounting on each new bid resets the console to the new
                  // minimum legal raise — cheaper and clearer than syncing state.
                  key={`${state.rollId}:${state.currentCall?.quantity ?? 0}-${state.currentCall?.face ?? 0}`}
                  game={game}
                />
              </div>
            ) : null}
          </div>

          {/* Secondary column: controls, live status, log */}
          <aside className="flex min-w-0 flex-col gap-4 sm:gap-5">
            <StatusPanel game={game} />
            <SetupPanel
              mode={state.settings.mode}
              diceCount={state.settings.diceCount}
              onDiceCountChange={game.setDiceCount}
              onesWild={state.settings.onesWild}
              onOnesWildChange={game.setOnesWild}
              difficulty={state.settings.difficulty}
              onDifficultyChange={game.setDifficulty}
              reduceMotion={state.settings.reduceMotion}
              onReduceMotionChange={game.setReduceMotion}
              midRound={state.phase !== 'idle' && state.phase !== 'round-over'}
              score={state.score}
              round={state.round}
              onResetScore={game.reset}
            />
            {state.settings.mode === 'liar' ? (
              <BidHistory log={state.log} opener={state.result?.opener ?? null} />
            ) : null}
          </aside>
        </main>

        <footer className="mx-auto max-w-[1500px] px-4 pb-8 text-center sm:px-6">
          <p className="text-[12px] text-slate-500">
            <span className="text-slate-400">{AUTHOR_COPY.platform}</span>
            <span className="mx-1.5 font-medium text-slate-300">「{AUTHOR_COPY.name}」</span>
            <span className="text-slate-500">{AUTHOR_COPY.tagline}</span>
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            {AUTHOR_COPY.search} · {AUTHOR_COPY.tech}
          </p>
        </footer>
      </div>

      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} mode={state.settings.mode} />
    </div>
  )
}
