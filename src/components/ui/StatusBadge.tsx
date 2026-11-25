import { cn } from '../../lib/cn'

export type BadgeStatus = 'paid' | 'pending' | 'failed' | 'habis' | 'tersedia'

const styles: Record<BadgeStatus, string> = {
  paid: 'border-success/30 bg-success/10 text-success',
  pending: 'border-brand-500/30 bg-brand-500/10 text-brand-300',
  failed: 'border-danger/30 bg-danger/10 text-danger-soft',
  habis: 'border-danger/30 bg-danger/10 text-danger-soft',
  tersedia: 'border-success/30 bg-success/10 text-success',
}

const labels: Record<BadgeStatus, string> = {
  paid: 'Lunas',
  pending: 'Pending',
  failed: 'Gagal',
  habis: 'Habis',
  tersedia: 'Tersedia',
}

export function StatusBadge({
  status,
  label,
}: {
  status: BadgeStatus
  label?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-label font-semibold',
        styles[status],
      )}
    >
      {label ?? labels[status]}
    </span>
  )
}
