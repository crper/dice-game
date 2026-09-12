import { cn } from '../../lib/cn'

export interface SwitchProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  /** Secondary line under the label. */
  hint?: string
  disabled?: boolean
  id?: string
}

/**
 * Toggle built on a real checkbox, so keyboard and screen-reader behaviour come
 * for free. The track and knob are the only custom parts.
 */
export function Switch({ checked, onChange, label, hint, disabled = false, id }: SwitchProps) {
  const inputId = id ?? `switch-${label}`

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-center justify-between gap-4 py-1.5',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs leading-5 text-slate-400">{hint}</span> : null}
      </span>

      <span className="relative shrink-0">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          className={cn(
            'block h-6 w-11 rounded-full transition-colors',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-amber-300/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-room-950',
            checked ? 'bg-emerald-500' : 'bg-white/15',
          )}
        />
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </label>
  )
}
