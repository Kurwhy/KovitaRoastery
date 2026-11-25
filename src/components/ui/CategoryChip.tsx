import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CategoryChipProps = {
  label: string
  active: boolean
  icon: ReactNode
  onClick: () => void
}

export function CategoryChip({ label, active, icon, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-12 items-center gap-2 rounded-lg border px-4 text-label font-semibold transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        active
          ? 'border-brand-500 bg-brand-500 text-charcoal hover:bg-brand-400 active:bg-brand-600'
          : 'border-line bg-slate text-muted hover:border-brand-500/60 hover:text-ink active:bg-white/[0.06]',
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}
