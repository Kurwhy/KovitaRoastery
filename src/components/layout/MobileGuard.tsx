import { Tablet } from 'lucide-react'
import { Wordmark } from '../ui/Wordmark'

export function MobileGuard() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center md:hidden">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-slate text-brand-400">
        <Tablet className="h-8 w-8" aria-hidden="true" />
      </div>
      <Wordmark className="mb-4 text-panel" />
      <h1 className="max-w-sm text-balance text-panel text-ink">
        Buka aplikasi ini di tablet atau laptop
      </h1>
      <p className="mt-3 max-w-sm text-body leading-relaxed text-muted">
        Layar kasir memerlukan lebar minimal 768 px agar seluruh panel pesanan
        terbaca dengan nyaman.
      </p>
    </div>
  )
}
