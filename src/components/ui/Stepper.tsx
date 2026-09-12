import { MinusIcon, PlusIcon } from './icons'
import { cn } from '../../lib/cn'

export interface StepperProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  /** Rendered next to the value, e.g. "每人 3 颗 · 桌面共 6 颗". */
  hint?: string
}

/**
 * Numeric stepper. The value is also a real `<input type="range">` underneath a
 * styled track, so dragging works on touch as well as the +/- buttons.
 */
export function Stepper({ value, min, max, onChange, label, hint }: StepperProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, Math.round(next)))
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-200">{label}</div>
          {hint ? <div className="mt-0.5 text-xs text-slate-400">{hint}</div> : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`减少${label}`}
            onClick={() => onChange(clamp(value - 1))}
            disabled={value <= min}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-lg bg-white/[0.08] text-slate-200 ring-1 ring-inset ring-white/12 transition',
              'hover:bg-white/[0.14] active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70',
              'disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100',
            )}
          >
            <MinusIcon className="h-4 w-4" />
          </button>

          <div className="tnum w-11 text-center text-2xl font-semibold text-white">{value}</div>

          <button
            type="button"
            aria-label={`增加${label}`}
            onClick={() => onChange(clamp(value + 1))}
            disabled={value >= max}
            className={cn(
              'grid h-9 w-9 place-items-center rounded-lg bg-white/[0.08] text-slate-200 ring-1 ring-inset ring-white/12 transition',
              'hover:bg-white/[0.14] active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70',
              'disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100',
            )}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-3 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
          className="absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent focus-visible:outline-none
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgb(0_0_0/0.6)] [&::-webkit-slider-thumb]:ring-2
            [&::-webkit-slider-thumb]:ring-amber-300/70 [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
        />
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
