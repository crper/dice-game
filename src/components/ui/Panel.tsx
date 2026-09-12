import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface PanelProps {
  title?: string
  icon?: ReactNode
  /** Right-aligned controls in the header row. */
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  /** Removes the default body padding, for panels that host full-bleed lists. */
  flush?: boolean
}

/** Card shell shared by every side panel: header row, divider, body. */
export function Panel({ title, icon, actions, children, className, bodyClassName, flush = false }: PanelProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[0_20px_40px_-32px_rgb(0_0_0/0.9)] backdrop-blur',
        className,
      )}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-slate-200">
            {icon ? <span className="text-slate-400">{icon}</span> : null}
            {title}
          </h2>
          {actions}
        </header>
      ) : null}
      <div className={cn(!flush && 'px-4 py-4', flush && 'py-2', bodyClassName)}>{children}</div>
    </section>
  )
}
