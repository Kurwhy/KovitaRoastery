import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { CircleAlert, Wallet } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useCartStore } from '../../stores/cartStore'
import { api } from '../../lib/api'
import {
  mapTransaction,
  type ApiTransaction,
} from '../../lib/apiMappers'
import { cartSubtotal, hitungPb1 } from '../../lib/pricing'
import { formatNumber, formatRupiah, parseDigits } from '../../lib/format'
import type { Transaction } from '../../types'

type CashModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (transaction: Transaction) => void
  onUnavailable: (message: string, menuIds: number[]) => void
}

const quickAmounts = [20000, 50000, 100000]

type UnavailableItem = {
  id: number
  nama: string
}

export function CashModal({
  open,
  onClose,
  onSuccess,
  onUnavailable,
}: CashModalProps) {
  const items = useCartStore((state) => state.items)
  const tipePesanan = useCartStore((state) => state.tipePesanan)
  const nomorMeja = useCartStore((state) => state.nomorMeja)
  const pb1Aktif = useCartStore((state) => state.pb1Aktif)

  const [rawAmount, setRawAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const processingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setRawAmount('')
    setProcessing(false)
    setError('')
    processingRef.current = false
  }, [open])

  const subtotal = cartSubtotal(items)
  const pb1Nominal = pb1Aktif ? hitungPb1(subtotal) : 0
  const total = subtotal + pb1Nominal
  const amount = Number(rawAmount || 0)
  const overLimit = amount > 10_000_000
  const remaining = Math.max(0, total - amount)
  const change = amount - total
  const canSubmit =
    amount >= total && total > 0 && !overLimit && !processing

  const handleClose = () => {
    if (processingRef.current) return
    onClose()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return

    processingRef.current = true
    setProcessing(true)
    setError('')

    const payload = {
      tipe_pesanan: tipePesanan,
      nomor_meja: tipePesanan === 'dine_in' ? Number(nomorMeja) : null,
      pb1_aktif: pb1Aktif,
      metode_bayar: 'tunai',
      uang_diterima: amount,
      items: items.map((item) => ({
        menu_item_id: item.menuItemId,
        suhu: item.suhu,
        takaran_gula: item.gula,
        catatan: item.catatan || null,
        qty: item.qty,
        addon_ids: item.addons.map((addon) => addon.id),
      })),
    }

    try {
      const { data } = await api.post<{ data: ApiTransaction }>(
        '/transaksi',
        payload,
      )
      if (!mountedRef.current) return

      processingRef.current = false
      setProcessing(false)
      onSuccess(mapTransaction(data.data))
    } catch (requestError) {
      if (!mountedRef.current) return

      if (axios.isAxiosError(requestError)) {
        const unavailable = requestError.response?.data?.unavailable_items
        if (
          requestError.response?.status === 422 &&
          Array.isArray(unavailable) &&
          unavailable.length > 0
        ) {
          const parsed = unavailable as UnavailableItem[]
          const names = parsed.map((item) => item.nama).join(', ')
          const message =
            requestError.response?.data?.message ??
            `Menu ${names} baru saja habis`
          processingRef.current = false
          setProcessing(false)
          onUnavailable(message, parsed.map((item) => item.id))
          return
        }

        if (requestError.response?.status === 401) {
          setError('Sesi tidak valid. Silakan masuk kembali.')
        } else {
          setError(
            requestError.response?.data?.message ??
              'Transaksi gagal. Periksa koneksi lalu coba lagi.',
          )
        }
      } else {
        setError('Transaksi gagal. Periksa koneksi lalu coba lagi.')
      }

      processingRef.current = false
      setProcessing(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Pembayaran tunai"
      description="Masukkan uang yang diterima, lalu periksa kembalian."
      size="sm"
      footer={
        <Button
          size="lg"
          fullWidth
          onClick={handleSubmit}
          loading={processing}
          disabled={!canSubmit}
        >
          {processing ? 'Menyimpan transaksi' : 'Selesaikan Pembayaran'}
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-lg border border-brand-500/30 bg-brand-500/[0.07] px-4 py-3">
          <p className="text-label text-muted">Total tagihan</p>
          <p className="mt-1 text-display font-bold tabular text-brand-400">
            {formatRupiah(total)}
          </p>
        </div>

        <Input
          label="Uang diterima"
          required
          inputMode="numeric"
          prefix="Rp"
          value={rawAmount ? formatNumber(Number(rawAmount)) : ''}
          onChange={(event) => {
            const digits = parseDigits(event.target.value).slice(0, 8)
            setRawAmount(digits)
            setError('')
          }}
          placeholder="0"
          disabled={processing}
          error={overLimit ? 'Uang diterima maksimal Rp 10.000.000.' : undefined}
          autoFocus
        />

        <div>
          <p className="mb-2 text-label font-semibold text-ink">Nominal cepat</p>
          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((value) => (
              <Button
                key={value}
                variant="secondary"
                onClick={() => setRawAmount(String(value))}
                disabled={processing}
                className="justify-start px-4 tabular"
              >
                {formatRupiah(value)}
              </Button>
            ))}
            <Button
              variant="secondary"
              onClick={() => setRawAmount(String(total))}
              disabled={processing}
              className="justify-start px-4"
            >
              Uang Pas
            </Button>
          </div>
        </div>

        {error && (
          <div
            className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        {canSubmit ? (
          <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3">
            <p className="text-label text-success/80">Kembalian</p>
            <p className="mt-1 text-panel font-bold tabular text-success">
              {formatRupiah(change)}
            </p>
          </div>
        ) : overLimit ? (
          <div
            className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Uang diterima maksimal Rp 10.000.000.</p>
          </div>
        ) : amount > 0 ? (
          <div
            className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Uang diterima kurang {formatRupiah(remaining)}.</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-line bg-charcoal px-4 py-3 text-label text-muted">
            <Wallet className="h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Masukkan jumlah uang yang diterima.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
