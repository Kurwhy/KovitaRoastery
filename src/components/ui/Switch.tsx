import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  icon?: ReactNode
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  icon,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex min-h-12 w-full items-center justify-between gap-4 rounded-lg border px-3 py-2 text-left transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        checked
          ? 'border-brand-500/50 bg-brand-500/[0.08]'
          : 'border-line bg-charcoal hover:border-muted/50',
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border',
              checked
                ? 'border-brand-500/30 bg-brand-500/10 text-brand-300'
                : 'border-line bg-slate text-muted',
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-label font-semibold text-ink">{label}</span>
          {description && (
            <span className="mt-0.5 block text-label text-muted">
              {description}
            </span>
          )}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150',
          checked ? 'bg-brand-500' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-ink transition-transform duration-150',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </span>
    </button>
  )
}
