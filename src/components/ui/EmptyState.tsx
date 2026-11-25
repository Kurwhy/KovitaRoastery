import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-slate/40 px-6 py-12 text-center',
        className,
      )}
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-slate text-muted"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-card text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-label leading-relaxed text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
