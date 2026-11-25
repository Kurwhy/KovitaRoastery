import { createPortal } from 'react-dom'
import { CheckCircle2, Printer } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { brandName } from '../../data/brand'
import {
  formatRupiah,
  gulaLabel,
  metodeBayarLabel,
  suhuLabel,
  tipePesananLabel,
} from '../../lib/format'
import { formatWibDate, formatWibDateTime, formatWibTime } from '../../lib/date'
import type { Transaction } from '../../types'

function ReceiptContent({ transaction }: { transaction: Transaction }) {
  return (
    <div className="receipt-content mx-auto w-full max-w-sm bg-white p-5 text-zinc-900">
      <div className="text-center">
        <p className="text-lg font-bold">{brandName}</p>
      </div>

      <div className="receipt-divider my-3 border-t border-dashed border-zinc-300" />

      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Nomor</dt>
          <dd className="text-right font-semibold">
            {transaction.kodeTransaksi}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Tanggal</dt>
          <dd className="text-right">
            {formatWibDate(transaction.createdAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Jam</dt>
          <dd className="text-right">{formatWibTime(transaction.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Kasir</dt>
          <dd className="text-right">{transaction.namaKasir}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Tipe</dt>
          <dd className="text-right">
            {tipePesananLabel(
              transaction.tipePesanan,
              transaction.nomorMeja,
            )}
          </dd>
        </div>
      </dl>

      <div className="receipt-divider my-3 border-t border-dashed border-zinc-300" />

      <ul className="space-y-3">
        {transaction.items.map((item, index) => {
          const addonsText = item.addons
            .map((addon) => addon.nama)
            .join(', ')
          const variantText = [
            item.suhu ? suhuLabel(item.suhu) : null,
            item.gula ? gulaLabel(item.gula) : null,
          ]
            .filter(Boolean)
            .join(', ')

          return (
            <li key={`${item.menuItemId}-${index}`} className="text-xs">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">
                  {item.qty}x {item.namaMenu}
                </p>
                <p className="shrink-0 tabular">{formatRupiah(item.subtotalItem)}</p>
              </div>
              {variantText && (
                <p className="mt-0.5 text-zinc-500">{variantText}</p>
              )}
              {addonsText && (
                <p className="mt-0.5 text-zinc-500">Add-on: {addonsText}</p>
              )}
              {item.catatan && (
                <p className="mt-0.5 text-zinc-500">Catatan: {item.catatan}</p>
              )}
            </li>
          )
        })}
      </ul>

      <div className="receipt-divider my-3 border-t border-dashed border-zinc-300" />

      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Subtotal</dt>
          <dd className="tabular">{formatRupiah(transaction.subtotal)}</dd>
        </div>
        {transaction.pb1Aktif && (
          <div className="flex justify-between gap-3">
            <dt className="text-zinc-500">PB1 10%</dt>
            <dd className="tabular">{formatRupiah(transaction.pb1Nominal)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3 border-t border-zinc-300 pt-2 text-sm font-bold">
          <dt>Total</dt>
          <dd className="tabular">{formatRupiah(transaction.total)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Metode</dt>
          <dd>{metodeBayarLabel(transaction.metodeBayar)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-zinc-500">Status</dt>
          <dd>Lunas</dd>
        </div>
        {transaction.metodeBayar === 'tunai' &&
          transaction.uangDiterima !== null && (
            <>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Uang diterima</dt>
                <dd className="tabular">
                  {formatRupiah(transaction.uangDiterima)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Kembalian</dt>
                <dd className="tabular">
                  {formatRupiah(transaction.kembalian ?? 0)}
                </dd>
              </div>
            </>
          )}
      </dl>

      <div className="receipt-divider my-3 border-t border-dashed border-zinc-300" />

      <p className="text-center text-xs leading-relaxed text-zinc-600">
        Terima kasih. Simpan struk ini sebagai bukti pembayaran.
      </p>
    </div>
  )
}

type ReceiptModalProps = {
  transaction: Transaction | null
  onClose: () => void
}

export function ReceiptModal({ transaction, onClose }: ReceiptModalProps) {
  if (!transaction) return null

  return (
    <>
      <Modal
        open={Boolean(transaction)}
        onClose={onClose}
        title="Struk pembayaran"
        description="Transaksi tersimpan. Cetak struk atau tutup untuk pesanan baru."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            <Button
              onClick={() => window.print()}
              icon={<Printer className="h-4 w-4" aria-hidden="true" />}
            >
              Cetak
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-success"
            aria-hidden="true"
          />
          <div>
            <p className="text-label font-semibold text-success">
              Pembayaran lunas
            </p>
            <p className="mt-0.5 text-label text-muted">
              {formatWibDateTime(transaction.paidAt ?? transaction.createdAt)}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <ReceiptContent transaction={transaction} />
        </div>
      </Modal>

      {createPortal(
        <div id="receipt-print" aria-hidden="true">
          <ReceiptContent transaction={transaction} />
        </div>,
        document.body,
      )}
    </>
  )
}
