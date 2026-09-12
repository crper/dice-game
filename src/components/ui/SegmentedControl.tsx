import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  /** Short line shown under the label inside the segment. */
  hint?: string
  icon?: ReactNode
}

export interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedOption<T>>
  value: T
  onChange: (value: T) => void
  name: string
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Radio-group styled as a segmented control: the sliding highlight is drawn
 * with a CSS transition while the inputs stay real radios for accessibility.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  name,
  size = 'md',
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value))

  return (
    <div
      role="radiogroup"
      className={cn(
        'relative grid gap-1 rounded-2xl bg-white/[0.06] p-1 ring-1 ring-inset ring-white/10',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {/* Sliding highlight, one cell wide. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 rounded-xl bg-white/[0.14] shadow-[0_6px_20px_-10px_rgb(0_0_0/0.9)] ring-1 ring-inset ring-white/15 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: `calc((100% - 0.5rem - ${(options.length - 1) * 0.25}rem) / ${options.length})`,
          left: '0.25rem',
          transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
        }}
      />
      {options.map((option) => {
        const active = option.value === value
        return (
          <label
            key={option.value}
            className={cn(
              'relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-xl text-center transition-colors',
              size === 'sm' ? 'gap-0 px-2 py-1.5' : 'gap-0.5 px-3 py-2',
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="flex items-center gap-1.5 text-[13px] font-medium leading-5">
              {option.icon}
              {option.label}
            </span>
            {option.hint ? (
              <span className={cn('text-[11px] leading-4', active ? 'text-slate-300' : 'text-slate-500')}>
                {option.hint}
              </span>
            ) : null}
          </label>
        )
      })}
    </div>
  )
}
