import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  QrCode,
  XCircle,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { StatusBadge } from '../ui/StatusBadge'
import { useCartStore } from '../../stores/cartStore'
import { api } from '../../lib/api'
import {
  mapQrisCharge,
  mapTransaction,
  type ApiQrisChargeResponse,
  type ApiTransaction,
} from '../../lib/apiMappers'
import { getFriendlyApiError } from '../../lib/apiError'
import { cartSubtotal, hitungPb1 } from '../../lib/pricing'
import { formatRupiah } from '../../lib/format'
import type { QrisCharge, Transaction } from '../../types'

type QrisModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (transaction: Transaction) => void
  onUnavailable: (message: string, menuIds: number[]) => void
}

type Phase = 'idle' | 'creating' | 'waiting' | 'success' | 'failed' | 'error'

type UnavailableItem = {
  id: number
  nama: string
}

export function QrisModal({
  open,
  onClose,
  onSuccess,
  onUnavailable,
}: QrisModalProps) {
  const items = useCartStore((state) => state.items)
  const tipePesanan = useCartStore((state) => state.tipePesanan)
  const nomorMeja = useCartStore((state) => state.nomorMeja)
  const pb1Aktif = useCartStore((state) => state.pb1Aktif)

  const [phase, setPhase] = useState<Phase>('idle')
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [qris, setQris] = useState<QrisCharge | null>(null)
  const [error, setError] = useState('')
  const [pollError, setPollError] = useState('')
  const [imageError, setImageError] = useState(false)

  const openRef = useRef(open)
  const mountedRef = useRef(true)
  const creatingRef = useRef(false)
  const pollTimerRef = useRef<number | null>(null)
  const successTimerRef = useRef<number | null>(null)
  const onSuccessRef = useRef(onSuccess)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current)
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    setPhase('idle')
    setTransaction(null)
    setQris(null)
    setError('')
    setPollError('')
    setImageError(false)
    creatingRef.current = false

    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current)
      successTimerRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (phase !== 'waiting' || !transaction) return

    let cancelled = false
    let inFlight = false

    const schedule = () => {
      if (cancelled) return
      pollTimerRef.current = window.setTimeout(poll, 3000)
    }

    const poll = async () => {
      if (cancelled) return
      if (inFlight) {
        schedule()
        return
      }

      inFlight = true
      try {
        const { data } = await api.get<{ data: ApiTransaction }>(
          `/transaksi/${transaction.id}/status`,
        )
        if (cancelled) return

        const updated = mapTransaction(data.data)
        if (updated.statusBayar === 'paid') {
          setTransaction(updated)
          setPollError('')
          setPhase('success')
          successTimerRef.current = window.setTimeout(() => {
            if (mountedRef.current) onSuccessRef.current(updated)
          }, 900)
          return
        }

        if (updated.statusBayar === 'failed') {
          setTransaction(updated)
          setPollError('')
          setPhase('failed')
          return
        }

        setPollError('')
        schedule()
      } catch (requestError) {
        if (cancelled) return
        setPollError(
          axios.isAxiosError(requestError) &&
            requestError.response?.status === 401
            ? 'Sesi tidak valid. Silakan masuk kembali.'
            : 'Gagal memeriksa status pembayaran. Mencoba lagi.',
        )
        schedule()
      } finally {
        inFlight = false
      }
    }

    schedule()

    return () => {
      cancelled = true
      if (pollTimerRef.current) {
        window.clearTimeout(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [phase, transaction])

  const subtotal = cartSubtotal(items)
  const total = subtotal + (pb1Aktif ? hitungPb1(subtotal) : 0)
  const displayTotal = transaction?.total ?? total

  const handleClose = () => {
    if (creatingRef.current) return
    onClose()
  }

  const handleCreate = async () => {
    if (creatingRef.current) return

    creatingRef.current = true
    setPhase('creating')
    setError('')
    setPollError('')
    setImageError(false)

    const payload = {
      tipe_pesanan: tipePesanan,
      nomor_meja: tipePesanan === 'dine_in' ? Number(nomorMeja) : null,
      pb1_aktif: pb1Aktif,
      metode_bayar: 'qris',
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
      const { data } = await api.post<ApiQrisChargeResponse>(
        '/transaksi',
        payload,
      )
      if (!mountedRef.current || !openRef.current) return

      setTransaction(mapTransaction(data.data))
      setQris(mapQrisCharge(data.qris))
      setPhase('waiting')
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
          creatingRef.current = false
          onUnavailable(message, parsed.map((item) => item.id))
          return
        }
      }

      setError(
        getFriendlyApiError(
          requestError,
          'Pembayaran QRIS gagal dibuat. Periksa koneksi lalu coba lagi.',
        ),
      )
      setPhase('error')
    } finally {
      creatingRef.current = false
    }
  }

  const footer =
    phase === 'idle' || phase === 'creating' ? (
      <Button
        size="lg"
        fullWidth
        onClick={handleCreate}
        loading={phase === 'creating'}
      >
        {phase === 'creating' ? 'Membuat QRIS' : 'Buat QRIS'}
      </Button>
    ) : phase === 'failed' || phase === 'error' ? (
      <Button size="lg" fullWidth variant="secondary" onClick={onClose}>
        Tutup
      </Button>
    ) : undefined

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Pembayaran QRIS"
      description="Bayar melalui Midtrans."
      size="sm"
      footer={footer}
    >
      {phase === 'idle' && (
        <div className="space-y-5">
          <div className="rounded-lg border border-brand-500/30 bg-brand-500/[0.07] px-4 py-3">
            <p className="text-label text-muted">Total tagihan</p>
            <p className="mt-1 text-display font-bold tabular text-brand-400">
              {formatRupiah(total)}
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-line bg-charcoal px-4 py-3 text-label text-muted">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Tekan Buat QRIS untuk membuat kode pembayaran dari Midtrans.
            </p>
          </div>
        </div>
      )}

      {phase === 'creating' && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Loader2
            className="h-8 w-8 animate-spin text-brand-400"
            aria-hidden="true"
          />
          <p className="mt-4 text-body font-semibold text-ink">
            Membuat kode QRIS
          </p>
          <p className="mt-1 text-label text-muted">
            Menyiapkan transaksi di Midtrans.
          </p>
        </div>
      )}

      {phase === 'waiting' && qris && (
        <div className="space-y-5">
          <div className="rounded-lg border border-brand-500/30 bg-brand-500/[0.07] px-4 py-3 text-center">
            <p className="text-label text-muted">Total tagihan</p>
            <p className="mt-1 text-panel font-bold tabular text-brand-400">
              {formatRupiah(displayTotal)}
            </p>
          </div>

          <div className="flex justify-center">
            <StatusBadge status="pending" label="Menunggu pembayaran" />
          </div>

          <div className="mx-auto w-full max-w-56 rounded-xl border border-line bg-white p-3">
            {!imageError && qris.qrCodeUrl ? (
              <img
                src={qris.qrCodeUrl}
                alt="Kode QR pembayaran QRIS"
                width={224}
                height={224}
                className="h-auto w-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-zinc-600">
                <QrCode className="h-10 w-10" aria-hidden="true" />
                <p className="text-xs leading-relaxed">
                  Kode QR tidak dapat dimuat. Tutup lalu buat QRIS baru.
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-label text-muted">
            Minta pelanggan memindai QR dari Midtrans, lalu tunggu pembayaran
            diterima.
          </p>

          {pollError && (
            <p className="text-center text-label text-danger-soft" role="status">
              {pollError}
            </p>
          )}
        </div>
      )}

      {phase === 'success' && (
        <div className="py-8 text-center">
          <CheckCircle2
            className="mx-auto h-14 w-14 text-success"
            aria-hidden="true"
          />
          <p className="mt-4 text-panel text-ink">Pembayaran Berhasil</p>
          <p className="mt-2 text-label text-muted">
            Struk transaksi akan terbuka otomatis.
          </p>
        </div>
      )}

      {phase === 'failed' && (
        <div className="py-6 text-center">
          <XCircle className="mx-auto h-14 w-14 text-danger" aria-hidden="true" />
          <p className="mt-4 text-panel text-ink">Pembayaran tidak berhasil</p>
          <p className="mx-auto mt-2 max-w-[36ch] text-label leading-relaxed text-muted">
            Ulangi transaksi dari keranjang.
          </p>
          <div
            className="mx-auto mt-5 flex max-w-sm items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-left text-label text-danger-soft"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Transaksi tercatat gagal dan tidak masuk omzet.</p>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div className="py-6 text-center">
          <CircleAlert className="mx-auto h-12 w-12 text-danger" aria-hidden="true" />
          <p className="mt-4 text-panel text-ink">Pembayaran QRIS gagal dibuat</p>
          <p className="mx-auto mt-2 max-w-[36ch] text-label leading-relaxed text-muted">
            {error}
          </p>
          <p className="mt-3 text-label text-muted">
            Tutup lalu coba lagi dari keranjang.
          </p>
        </div>
      )}
    </Modal>
  )
}
