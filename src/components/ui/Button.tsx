import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-amber-400 text-room-950 hover:bg-amber-300 active:bg-amber-500 shadow-[0_10px_30px_-12px_rgb(251_191_36/0.85)] font-semibold',
  secondary:
    'bg-white/10 text-slate-100 hover:bg-white/[0.16] active:bg-white/[0.12] ring-1 ring-inset ring-white/15',
  outline:
    'bg-transparent text-slate-200 ring-1 ring-inset ring-white/20 hover:bg-white/[0.07] active:bg-white/[0.05]',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/[0.08] active:bg-white/[0.05]',
  danger:
    'bg-rose-500 text-white hover:bg-rose-400 active:bg-rose-600 shadow-[0_10px_30px_-12px_rgb(244_63_94/0.9)] font-semibold',
  success:
    'bg-emerald-500 text-room-950 hover:bg-emerald-400 active:bg-emerald-600 shadow-[0_10px_30px_-12px_rgb(16_185_129/0.9)] font-semibold',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[13px] rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2.5',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Stretch to the container width. */
  block?: boolean
  leading?: ReactNode
  trailing?: ReactNode
}

/**
 * One button for the whole app: six intents, three sizes, a visible focus ring
 * and a disabled state that still reads as disabled against the dark chrome.
 */
export function Button({
  variant = 'secondary',
  size = 'md',
  block = false,
  leading,
  trailing,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-room-950',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none',
        'active:scale-[0.98] disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  )
}
