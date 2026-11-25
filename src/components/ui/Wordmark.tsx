import logoMark from '../../img/logo/logo_kovita_mark.png'
import { cn } from '../../lib/cn'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src={logoMark}
        alt=""
        width={36}
        height={36}
        aria-hidden="true"
        className="h-9 w-9 shrink-0 object-contain"
      />
      <span className="inline-flex items-baseline gap-1.5">
        <span className="font-bold text-ink">Kovita</span>
        <span className="font-semibold text-brand-400">Roastery</span>
      </span>
    </span>
  )
}
