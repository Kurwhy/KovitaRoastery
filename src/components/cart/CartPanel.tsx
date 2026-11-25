import { useRef, useState } from 'react'
import { Banknote, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import {
  cartItemSubtotal,
  cartSubtotal,
  hitungPb1,
} from '../../lib/pricing'
import {
  formatRupiah,
  gulaLabel,
  suhuLabel,
} from '../../lib/format'
import { cn } from '../../lib/cn'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { Input } from '../ui/Input'
import { Switch } from '../ui/Switch'
import type { CartItem, TipePesanan } from '../../types'

type CartPanelProps = {
  onPay: () => void
  notice?: string
  availabilityError?: string
}

function OrderTypeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-12 flex-1 rounded-lg border text-label font-semibold transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
        active
          ? 'border-brand-500 bg-brand-500 text-charcoal active:bg-brand-600'
          : 'border-line bg-charcoal text-muted hover:border-brand-500/50 hover:text-ink active:bg-white/[0.06]',
      )}
    >
      {children}
    </button>
  )
}

function CartItemRow({
  item,
  onIncrement,
  onDecrement,
}: {
  item: CartItem
  onIncrement: () => void
  onDecrement: () => void
}) {
  const variantText = [item.suhu ? suhuLabel(item.suhu) : null, item.gula ? gulaLabel(item.gula) : null]
    .filter(Boolean)
    .join(', ')

  return (
    <li className="border-b border-line/70 py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label font-semibold leading-snug text-ink">
            {item.namaMenu}
          </p>
          {variantText && (
            <p className="mt-0.5 text-label text-muted">{variantText}</p>
          )}
          {item.addons.length > 0 && (
            <p className="mt-0.5 text-label text-brand-200">
              {item.addons.map((addon) => addon.nama).join(', ')}
            </p>
          )}
          {item.catatan && (
            <p className="mt-1 break-words text-label text-muted">
              Catatan: {item.catatan}
            </p>
          )}
        </div>
        <p className="shrink-0 text-label font-semibold tabular text-ink">
          {formatRupiah(cartItemSubtotal(item))}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon"
          onClick={onDecrement}
          aria-label={
            item.qty === 1
              ? `Hapus ${item.namaMenu} dari keranjang`
              : `Kurangi jumlah ${item.namaMenu}`
          }
          className="h-12 w-12"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span
          className="w-10 text-center text-body font-semibold tabular text-ink"
          aria-label={`Jumlah ${item.namaMenu}: ${item.qty}`}
        >
          {item.qty}
        </span>
        <Button
          variant="secondary"
          size="icon"
          onClick={onIncrement}
          disabled={item.qty >= 99}
          aria-label={`Tambah jumlah ${item.namaMenu}`}
          className="h-12 w-12"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <span className="ml-2 hidden text-label text-muted tabular xl:inline">
          {formatRupiah(cartItemSubtotal(item) / item.qty)} / item
        </span>
      </div>
    </li>
  )
}

export function CartPanel({ onPay, notice, availabilityError }: CartPanelProps) {
  const items = useCartStore((state) => state.items)
  const tipePesanan = useCartStore((state) => state.tipePesanan)
  const nomorMeja = useCartStore((state) => state.nomorMeja)
  const pb1Aktif = useCartStore((state) => state.pb1Aktif)
  const increment = useCartStore((state) => state.increment)
  const decrement = useCartStore((state) => state.decrement)
  const setTipePesanan = useCartStore((state) => state.setTipePesanan)
  const setNomorMeja = useCartStore((state) => state.setNomorMeja)
  const setPb1Aktif = useCartStore((state) => state.setPb1Aktif)

  const [tableTouched, setTableTouched] = useState(false)
  const tableRef = useRef<HTMLInputElement>(null)

  const subtotal = cartSubtotal(items)
  const pb1 = pb1Aktif ? hitungPb1(subtotal) : 0
  const total = subtotal + pb1
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
  const tableValue = Number(nomorMeja)
  const tableValid =
    Number.isInteger(tableValue) && tableValue >= 1 && tableValue <= 99
  const tableError =
    tipePesanan === 'dine_in'
      ? !tableValid && (tableTouched || nomorMeja.length > 0)
        ? 'Nomor meja harus 1 sampai 99.'
        : undefined
      : undefined

  const handleOrderType = (tipe: TipePesanan) => {
    setTipePesanan(tipe)
    setTableTouched(false)
  }

  const handlePay = () => {
    if (items.length === 0) return
    if (tipePesanan === 'dine_in' && !tableValid) {
      setTableTouched(true)
      tableRef.current?.focus()
      return
    }
    onPay()
  }

  return (
    <aside
      aria-label="Keranjang pesanan"
      className="flex flex-col overflow-hidden rounded-xl border border-line bg-slate shadow-panel md:sticky md:top-4 md:max-h-[calc(100dvh-2rem)]"
    >
      <div className="shrink-0 border-b border-line p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-panel text-ink">Pesanan</h2>
          <span className="text-label text-muted tabular">
            {totalQty > 0 ? `${totalQty} item` : 'Belum ada item'}
          </span>
        </div>

        <div className="flex gap-2" role="group" aria-label="Tipe pesanan">
          <OrderTypeButton
            active={tipePesanan === 'dine_in'}
            onClick={() => handleOrderType('dine_in')}
          >
            Dine-In
          </OrderTypeButton>
          <OrderTypeButton
            active={tipePesanan === 'takeaway'}
            onClick={() => handleOrderType('takeaway')}
          >
            Takeaway
          </OrderTypeButton>
        </div>

        {tipePesanan === 'dine_in' && (
          <div className="mt-3">
            <Input
              ref={tableRef}
              label="Nomor meja"
              required
              inputMode="numeric"
              value={nomorMeja}
              onChange={(event) => setNomorMeja(event.target.value)}
              placeholder="Contoh: 4"
              maxLength={2}
              helper="Isi angka 1 sampai 99."
              error={tableError}
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4">
        {availabilityError && (
          <div
            className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-label text-danger-soft"
            role="alert"
          >
            {availabilityError}
          </div>
        )}
        {notice && (
          <div
            className="mt-4 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-label text-brand-200"
            role="status"
          >
            {notice}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Keranjang masih kosong"
            description="Pilih menu di katalog untuk mulai menyusun pesanan."
            className="my-4 border-0 bg-transparent px-2 py-10"
          />
        ) : (
          <ul>
            {items.map((item) => (
              <CartItemRow
                key={item.key}
                item={item}
                onIncrement={() => increment(item.key)}
                onDecrement={() => decrement(item.key)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-line p-4">
        <Switch
          checked={pb1Aktif}
          onChange={setPb1Aktif}
          label="PB1 10%"
          description="Pajak restoran transaksi ini"
        />

        <dl className="mt-4 space-y-2 text-label">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold tabular text-ink">
              {formatRupiah(subtotal)}
            </dd>
          </div>
          {pb1Aktif && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">PB1 10%</dt>
              <dd className="font-semibold tabular text-ink">
                {formatRupiah(pb1)}
              </dd>
            </div>
          )}
          <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
            <dt className="text-body font-semibold text-ink">Total</dt>
            <dd className="text-panel font-bold tabular text-brand-400">
              {formatRupiah(total)}
            </dd>
          </div>
        </dl>

        <Button
          size="lg"
          fullWidth
          onClick={handlePay}
          disabled={items.length === 0}
          className="mt-4"
          icon={<Banknote className="h-5 w-5" aria-hidden="true" />}
        >
          {items.length === 0 ? 'Bayar' : `Bayar ${formatRupiah(total)}`}
        </Button>
      </div>
    </aside>
  )
}
