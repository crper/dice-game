import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'
import { cn } from '../../lib/cn'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Modal dialog built on the native `<dialog>` element, which gives focus
 * trapping, Escape-to-close and inertness of the page behind it for free.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (open && !node.open) node.showModal()
    if (!open && node.open) node.close()
  }, [open])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }
    const handleClick = (event: MouseEvent) => {
      // Clicks that land on the backdrop report the dialog itself as target.
      if (event.target === node) onClose()
    }
    node.addEventListener('cancel', handleCancel)
    node.addEventListener('click', handleClick)
    return () => {
      node.removeEventListener('cancel', handleCancel)
      node.removeEventListener('click', handleClick)
    }
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={cn(
        'fixed inset-0 m-auto w-[min(94vw,42rem)] max-h-[86vh] rounded-3xl border border-white/12 bg-room-900/95 p-0 text-slate-200 shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm',
        'open:animate-pop-in',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
        >
          <CloseIcon className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="scroll-slim max-h-[62vh] overflow-y-auto px-6 py-5">{children}</div>

      {footer ? <div className="border-t border-white/10 px-6 py-4">{footer}</div> : null}
    </dialog>
  )
}
