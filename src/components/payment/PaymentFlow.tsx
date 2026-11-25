import { useEffect, useState } from 'react'
import { Banknote, QrCode } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { useCartStore } from '../../stores/cartStore'
import { cartSubtotal, hitungPb1 } from '../../lib/pricing'
import { formatRupiah } from '../../lib/format'
import { CashModal } from './CashModal'
import { QrisModal } from './QrisModal'
import type { Transaction } from '../../types'

type PaymentFlowProps = {
  open: boolean
  onClose: () => void
  onSuccess: (transaction: Transaction) => void
  onUnavailable: (message: string, menuIds: number[]) => void
}

type Step = 'method' | 'cash' | 'qris'

export function PaymentFlow({
  open,
  onClose,
  onSuccess,
  onUnavailable,
}: PaymentFlowProps) {
  const items = useCartStore((state) => state.items)
  const pb1Aktif = useCartStore((state) => state.pb1Aktif)
  const [step, setStep] = useState<Step>('method')

  useEffect(() => {
    if (open) setStep('method')
  }, [open])

  const subtotal = cartSubtotal(items)
  const total = subtotal + (pb1Aktif ? hitungPb1(subtotal) : 0)

  return (
    <>
      <Modal
        open={open && step === 'method'}
        onClose={onClose}
        title="Pilih metode pembayaran"
        description={`Total tagihan ${formatRupiah(total)}`}
        size="sm"
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setStep('cash')}
            className="flex min-h-[88px] w-full items-center gap-4 rounded-xl border border-line bg-charcoal p-4 text-left transition-colors duration-150 hover:border-brand-500/60 hover:bg-white/[0.03] active:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300">
              <Banknote className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-body font-semibold text-ink">Tunai</span>
              <span className="mt-0.5 block text-label text-muted">
                Hitung kembalian otomatis
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStep('qris')}
            className="flex min-h-[88px] w-full items-center gap-4 rounded-xl border border-line bg-charcoal p-4 text-left transition-colors duration-150 hover:border-brand-500/60 hover:bg-white/[0.03] active:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-300">
              <QrCode className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-body font-semibold text-ink">QRIS</span>
              <span className="mt-0.5 block text-label text-muted">
                Bayar dengan kode QR Midtrans
              </span>
            </span>
          </button>
        </div>
      </Modal>

      <CashModal
        open={open && step === 'cash'}
        onClose={onClose}
        onSuccess={onSuccess}
        onUnavailable={onUnavailable}
      />
      <QrisModal
        open={open && step === 'qris'}
        onClose={onClose}
        onSuccess={onSuccess}
        onUnavailable={onUnavailable}
      />
    </>
  )
}
