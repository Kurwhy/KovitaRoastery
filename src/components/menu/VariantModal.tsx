import { useEffect, useState } from 'react'
import { Check, CircleAlert } from 'lucide-react'
import type { Addon, MenuItem, Suhu, TakaranGula } from '../../types'
import { addonTotal } from '../../lib/pricing'
import { formatRupiah, gulaLabel, suhuLabel } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

type VariantModalProps = {
  menu: MenuItem | null
  addons: Addon[]
  onClose: () => void
  onAdd: (
    menu: MenuItem,
    options: {
      suhu: Suhu
      gula: TakaranGula
      addons: Addon[]
      catatan: string
    },
  ) => 'added' | 'merged' | 'maxed' | 'full'
}

const suhuOptions: Suhu[] = ['hot', 'ice']
const gulaOptions: TakaranGula[] = ['normal', 'kurang', 'tanpa']

export function VariantModal({ menu, addons, onClose, onAdd }: VariantModalProps) {
  const [suhu, setSuhu] = useState<Suhu | null>(null)
  const [gula, setGula] = useState<TakaranGula>('normal')
  const [selectedAddons, setSelectedAddons] = useState<number[]>([])
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!menu) return
    setSuhu(null)
    setGula('normal')
    setSelectedAddons([])
    setCatatan('')
    setError('')
  }, [menu])

  if (!menu) return null

  const chosenAddons = addons.filter((addon) =>
    selectedAddons.includes(addon.id),
  )
  const total = menu.harga + addonTotal(chosenAddons)
  const canSubmit = suhu !== null

  const toggleAddon = (addonId: number) => {
    setSelectedAddons((current) =>
      current.includes(addonId)
        ? current.filter((id) => id !== addonId)
        : [...current, addonId],
    )
  }

  const handleSubmit = () => {
    if (!suhu) {
      setError('Pilih suhu terlebih dahulu.')
      return
    }

    const result = onAdd(menu, {
      suhu,
      gula,
      addons: chosenAddons,
      catatan,
    })

    if (result === 'full') {
      setError('Keranjang sudah mencapai 50 baris. Selesaikan pesanan lain dulu.')
      return
    }

    if (result === 'maxed') {
      setError('Jumlah item ini sudah mencapai batas 99.')
      return
    }

    onClose()
  }

  return (
    <Modal
      open={Boolean(menu)}
      onClose={onClose}
      title={menu.nama}
      description="Atur suhu, gula, dan tambahan sebelum masuk ke keranjang."
      size="md"
      footer={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-label text-muted">Harga item</p>
            <p className="text-panel font-bold tabular text-brand-400">
              {formatRupiah(total)}
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="sm:min-w-56"
          >
            Tambah ke Keranjang
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-label font-semibold text-ink">
            Suhu <span className="text-brand-400">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {suhuOptions.map((option) => (
              <label
                key={option}
                className={cn(
                  'flex h-12 cursor-pointer items-center justify-center rounded-lg border text-label font-semibold transition-colors duration-150',
                  'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                  suhu === option
                    ? 'border-brand-500 bg-brand-500 text-charcoal'
                    : 'border-line bg-charcoal text-muted hover:border-brand-500/60 hover:text-ink',
                )}
              >
                <input
                  type="radio"
                  name="suhu"
                  value={option}
                  checked={suhu === option}
                  onChange={() => {
                    setSuhu(option)
                    setError('')
                  }}
                  className="sr-only"
                />
                {suhuLabel(option)}
              </label>
            ))}
          </div>
          {!suhu && (
            <p className="mt-2 text-label text-muted">
              Pilih suhu terlebih dahulu.
            </p>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-label font-semibold text-ink">
            Takaran gula
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {gulaOptions.map((option) => (
              <label
                key={option}
                className={cn(
                  'flex min-h-12 cursor-pointer items-center justify-center rounded-lg border px-2 text-center text-label font-semibold transition-colors duration-150',
                  'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                  gula === option
                    ? 'border-brand-500 bg-brand-500 text-charcoal'
                    : 'border-line bg-charcoal text-muted hover:border-brand-500/60 hover:text-ink',
                )}
              >
                <input
                  type="radio"
                  name="gula"
                  value={option}
                  checked={gula === option}
                  onChange={() => setGula(option)}
                  className="sr-only"
                />
                {gulaLabel(option)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-label font-semibold text-ink">
            Add-on berbayar
          </legend>
          <div className="space-y-2">
            {addons.map((addon) => {
              const checked = selectedAddons.includes(addon.id)
              return (
                <label
                  key={addon.id}
                  className={cn(
                    'flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-2 transition-colors duration-150',
                    'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500',
                    checked
                      ? 'border-brand-500/60 bg-brand-500/[0.08]'
                      : 'border-line bg-charcoal hover:border-brand-500/40',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded border transition-colors duration-150',
                        checked
                          ? 'border-brand-500 bg-brand-500 text-charcoal'
                          : 'border-muted/50 bg-transparent text-transparent',
                      )}
                      aria-hidden="true"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddon(addon.id)}
                      className="sr-only"
                    />
                    <span className="text-label font-medium text-ink">
                      {addon.nama}
                    </span>
                  </span>
                  <span className="shrink-0 text-label font-semibold tabular text-muted">
                    + {formatRupiah(addon.harga)}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="catatan-item"
            className="mb-2 block text-label font-semibold text-ink"
          >
            Catatan item
          </label>
          <textarea
            id="catatan-item"
            value={catatan}
            onChange={(event) => setCatatan(event.target.value.slice(0, 150))}
            maxLength={150}
            rows={3}
            placeholder="Contoh: Kurangi es sedikit"
            className="w-full resize-none rounded-lg border border-line bg-charcoal px-4 py-3 text-body text-ink placeholder:text-muted/80 transition-colors duration-150 hover:border-muted/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <div className="mt-2 flex items-center justify-between gap-4 text-label text-muted">
            <span>Opsional, maksimal 150 karakter.</span>
            <span className="tabular">{catatan.length}/150</span>
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
      </div>
    </Modal>
  )
}
