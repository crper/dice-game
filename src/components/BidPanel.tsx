import { useEffect, useState } from 'react'
import type { Call } from '../types/game'
import type { DiceGameApi } from '../hooks/useDiceGame'
import { estimateCallProbability } from '../lib/liarDice'
import { SEAT_LABELS } from '../lib/copy'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Panel } from './ui/Panel'
import { PipFace } from './ui/PipFace'
import { EyeIcon, MinusIcon, PlusIcon, SwordsIcon, TargetIcon } from './ui/icons'

const FACES = [1, 2, 3, 4, 5, 6]

/**
 * The player's bidding console.
 *
 * Every control is constrained against the standing bid before it renders, so
 * an illegal raise can never be submitted — the reducer validates again, but
 * the UI should not offer it in the first place.
 *
 * On wide screens the console is laid out as one horizontal strip, which keeps
 * the call buttons above the fold on a laptop; on phones it stacks.
 */
export function BidPanel({ game }: { game: DiceGameApi }) {
  const { state, facesFor, minQuantity, maxQuantity, canOpen, isPlayerTurn, submitCall } = game
  const { onesWild } = state.settings
  const currentCall = state.currentCall
  const lastCaller = state.lastCaller

  // The parent remounts this panel whenever the standing bid changes (see the
  // `key` in App), so seeding from the current minimum is all the re-arming the
  // console needs — no synchronising effect required.
  const [quantity, setQuantity] = useState(minQuantity)
  const [face, setFace] = useState(() => facesFor(minQuantity)[0] ?? 1)

  const legalFaces = facesFor(quantity)
  const effectiveFace = legalFaces.includes(face) ? face : (legalFaces[0] ?? 1)
  const canBid = legalFaces.length > 0 && isPlayerTurn

  // PC 端键盘出牌：1-6 选点数、↑↓ 调数量、Enter 叫骰。
  // 只在自己回合生效；输入框聚焦、有弹窗打开或按着修饰键时全部让路。
  useEffect(() => {
    if (!isPlayerTurn) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      )
        return
      if (document.querySelector('dialog[open]')) return

      if (event.key >= '1' && event.key <= '6') {
        const picked = Number(event.key)
        if (legalFaces.includes(picked)) {
          setFace(picked)
          event.preventDefault()
        }
        return
      }
      if (event.key === 'ArrowUp') {
        setQuantity((value) => Math.min(maxQuantity, value + 1))
        event.preventDefault()
        return
      }
      if (event.key === 'ArrowDown') {
        setQuantity((value) => Math.max(minQuantity, value - 1))
        event.preventDefault()
        return
      }
      if (event.key === 'Enter' && canBid) {
        submitCall({ quantity, face: effectiveFace })
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isPlayerTurn, legalFaces, maxQuantity, minQuantity, canBid, quantity, effectiveFace, submitCall])

  // Cheap closed-form estimate (a short binomial sum) — no memo needed.
  const probability =
    state.aiDice.length === 0
      ? null
      : estimateCallProbability(
          state.playerDice,
          state.aiDice.length,
          { quantity, face: effectiveFace },
          onesWild,
        )

  const confidence = probability === null ? null : Math.round(probability * 100)
  const confidenceBar =
    confidence === null
      ? ''
      : confidence >= 66
        ? 'bg-emerald-400'
        : confidence >= 34
          ? 'bg-amber-300'
          : 'bg-rose-400'

  if (state.settings.mode === 'open') return null

  const disabledGroup = !isPlayerTurn && 'pointer-events-none opacity-45'

  // Status copy that matches the phase, so the console never claims to be
  // waiting on somebody when the round is already decided.
  const idleLabel =
    state.phase === 'round-over'
      ? '本局已结束'
      : state.phase === 'rolling'
        ? '骰子滚动中'
        : state.phase === 'revealing'
          ? '开盅中'
          : '等待对手'

  const hint = canOpen
    ? '开盅：质疑对手的叫法，当场揭盅数骰。'
    : state.phase === 'round-over'
      ? '点击「下一局」继续。'
      : state.phase === 'rolling' || state.phase === 'revealing'
        ? '骰子落定后即可叫骰。'
        : '开盅要等对手叫过一次之后才能使用。'

  return (
    <Panel
      title="叫骰"
      icon={<SwordsIcon className="h-4 w-4" />}
      actions={
        <span className="flex items-center gap-2 text-[11px] text-slate-400">
          {currentCall ? (
            <span className="flex items-center gap-1.5">
              当前
              <span className="tnum font-medium text-slate-200">{currentCall.quantity}</span>个
              <PipFace value={currentCall.face} className="h-4 w-4" />
              <span className="rounded-full bg-white/10 px-1.5 py-0.5">{SEAT_LABELS[lastCaller ?? 'player']}叫</span>
            </span>
          ) : (
            <span>还没有人叫骰</span>
          )}
          <span
            className={cn(
              'rounded-full border px-2 py-0.5',
              onesWild
                ? 'border-amber-300/25 bg-amber-400/10 text-amber-200'
                : 'border-white/12 bg-white/5 text-slate-400',
            )}
          >
            {onesWild ? '1 为万能' : '1 不可替'}
          </span>
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)_11rem] lg:items-start lg:gap-5">
        {/* Quantity */}
        <div className={cn('transition-opacity', disabledGroup)}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-300">叫几个</span>
            <span className="text-[11px] text-slate-500">
              {minQuantity}–{maxQuantity}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              aria-label="减少数量"
              onClick={() => setQuantity((value) => Math.max(minQuantity, value - 1))}
              disabled={quantity <= minQuantity}
              className="h-11 w-11 px-0"
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <div className="relative h-11 flex-1 overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/10 ring-inset">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400/25 to-transparent transition-[width] duration-200"
                style={{
                  width: `${maxQuantity === minQuantity ? 100 : ((quantity - minQuantity) / (maxQuantity - minQuantity)) * 100}%`,
                }}
              />
              <div className="relative flex h-full items-center justify-center gap-1.5">
                <span className="tnum text-xl font-semibold text-white">{quantity}</span>
                <span className="text-xs text-slate-400">个</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              aria-label="增加数量"
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              disabled={quantity >= maxQuantity}
              className="h-11 w-11 px-0"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Face */}
        <div className={cn('transition-opacity', disabledGroup)}>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-slate-300">叫几点</span>
            {legalFaces.length === 0 ? (
              <span className="text-[11px] text-rose-300">已到上限，只能开盅</span>
            ) : null}
          </div>
          <div className="mt-2 grid grid-cols-6 gap-2 lg:max-w-md">
            {FACES.map((value) => {
              const enabled = legalFaces.includes(value)
              const active = enabled && value === effectiveFace
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`叫 ${value} 点`}
                  aria-pressed={active}
                  disabled={!enabled}
                  onClick={() => setFace(value)}
                  className={cn(
                    'grid aspect-square place-items-center rounded-xl transition',
                    'focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:outline-none',
                    active
                      ? 'bg-amber-400/25 ring-2 ring-amber-300/80 ring-inset'
                      : 'bg-white/[0.06] ring-1 ring-white/10 ring-inset hover:bg-white/[0.12]',
                    !enabled && 'cursor-not-allowed opacity-25 hover:bg-white/[0.06]',
                    enabled && 'active:scale-95',
                  )}
                >
                  <PipFace value={value} tone={active ? 'highlight' : 'ivory'} className="mx-auto h-7 w-7" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid gap-2.5">
          <Button
            variant="primary"
            size="lg"
            block
            disabled={!canBid}
            onClick={() => game.submitCall({ quantity, face: effectiveFace } as Call)}
            leading={<SwordsIcon className="h-4.5 w-4.5" />}
          >
            {canBid ? `叫 ${quantity} 个 ${effectiveFace}` : isPlayerTurn ? '无可叫' : idleLabel}
          </Button>
          <Button
            variant="danger"
            size="lg"
            block
            disabled={!canOpen}
            onClick={game.submitOpen}
            leading={<EyeIcon className="h-4.5 w-4.5" />}
          >
            开盅
          </Button>
        </div>
      </div>

      {/* Footer: the odds estimate for the bid currently dialled in */}
      {confidence !== null ? (
        <div className="mt-4 flex items-center gap-2.5 border-t border-white/8 pt-3">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <TargetIcon className="h-3.5 w-3.5" />
            参考成立概率
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 sm:max-w-40">
            <span
              className={cn('block h-full rounded-full transition-all duration-300', confidenceBar)}
              style={{ width: `${Math.max(confidence, 3)}%` }}
            />
          </span>
          <span className="tnum w-9 text-right text-xs font-medium text-slate-200">{confidence}%</span>
          <span className="hidden text-[11px] text-slate-500 sm:inline">{hint}</span>
        </div>
      ) : (
        <p className="mt-4 border-t border-white/8 pt-3 text-[11px] text-slate-500">{hint}</p>
      )}

      {/* 键盘出牌提示：只在有物理键盘的设备上显示。 */}
      <p className="mt-2 hidden items-center gap-1 text-[11px] text-slate-600 sm:flex">
        键盘出牌
        <Kbd>1</Kbd>–<Kbd>6</Kbd> 选点数 ·<Kbd>↑</Kbd>
        <Kbd>↓</Kbd> 调数量 ·<Kbd>Enter</Kbd> 叫骰
      </p>
    </Panel>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] leading-4 text-slate-300">
      {children}
    </kbd>
  )
}
