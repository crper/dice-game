import type { GameMode } from '../types/game'
import { Button } from './ui/Button'
import { SegmentedControl } from './ui/SegmentedControl'
import { BookIcon, DiceIcon, EyeIcon, SwordsIcon, VolumeOffIcon, VolumeOnIcon } from './ui/icons'
import { MODE_DESCRIPTIONS } from '../lib/copy'

export interface HeaderProps {
  mode: GameMode
  onModeChange: (mode: GameMode) => void
  soundEnabled: boolean
  onSoundToggle: () => void
  onOpenRules: () => void
  busy: boolean
}

/** Sticky app bar: identity, mode switch and the two global toggles. */
export function Header({ mode, onModeChange, soundEnabled, onSoundToggle, onOpenRules, busy }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-room-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-room-950 shadow-[0_10px_30px_-14px_rgb(251_191_36/0.9)]">
            <DiceIcon className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-white sm:text-lg">3D 骰子游戏</h1>
            <p className="truncate text-xs text-slate-400">{MODE_DESCRIPTIONS[mode]}</p>
          </div>
        </div>

        <SegmentedControl
          name="game-mode"
          value={mode}
          onChange={onModeChange}
          size="sm"
          className="order-last w-full sm:order-none sm:w-auto sm:min-w-[19rem]"
          options={[
            { value: 'liar' as GameMode, label: '大话骰', hint: '翻盖叫骰', icon: <SwordsIcon className="h-4 w-4" /> },
            { value: 'open' as GameMode, label: '明牌', hint: '直接开盅', icon: <EyeIcon className="h-4 w-4" /> },
          ]}
        />

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label={soundEnabled ? '关闭音效' : '开启音效'}
            aria-pressed={soundEnabled}
            onClick={onSoundToggle}
            className="w-9 px-0"
          >
            {soundEnabled ? <VolumeOnIcon className="h-4.5 w-4.5" /> : <VolumeOffIcon className="h-4.5 w-4.5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRules}
            leading={<BookIcon className="h-4 w-4" />}
            className="hidden sm:inline-flex"
            disabled={busy}
          >
            规则
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="查看规则"
            onClick={onOpenRules}
            className="w-9 px-0 sm:hidden"
          >
            <BookIcon className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
