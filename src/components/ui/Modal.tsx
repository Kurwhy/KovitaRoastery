import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFirst = window.requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const firstFocusable = panel.querySelector<HTMLElement>(focusableSelector)
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        panel.focus()
      }
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }

      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null)

      if (focusable.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFirst)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousActiveElement?.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'modal-panel relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-xl border border-line bg-slate shadow-modal outline-none',
          sizeClasses[size],
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div>
            <h2 id={titleId} className="text-panel text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-label text-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="-mr-2 -mt-2 shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-line p-5 sm:p-6">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
