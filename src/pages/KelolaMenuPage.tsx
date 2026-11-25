import { useEffect, useState } from 'react'
import {
  Ban,
  CircleCheck,
  Pencil,
  Plus,
  UtensilsCrossed,
  WifiOff,
} from 'lucide-react'
import { useMenuStore } from '../stores/menuStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Switch } from '../components/ui/Switch'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import {
  formatNumber,
  formatRupiah,
  kategoriLabel,
  parseDigits,
} from '../lib/format'
import {
  getFriendlyApiError,
  getValidationErrors,
} from '../lib/apiError'
import type { Kategori, MenuItem } from '../types'

type MenuErrors = {
  nama?: string
  kategori?: string
  harga?: string
}

const kategoriOptions: Array<{ value: Kategori; label: string }> = [
  { value: 'kopi', label: 'Kopi' },
  { value: 'non_kopi', label: 'Non-Kopi' },
  { value: 'makanan', label: 'Makanan' },
  { value: 'camilan', label: 'Camilan' },
]

function priceError(value: string) {
  const price = Number(value)
  if (!value) return 'Harga wajib diisi.'
  if (!Number.isInteger(price) || price < 1000 || price > 1_000_000) {
    return 'Harga harus bilangan bulat Rp 1.000 sampai Rp 1.000.000.'
  }
  return undefined
}

function MenuRow({
  item,
  statusLoading,
  onEditPrice,
  onToggleStatus,
}: {
  item: MenuItem
  statusLoading: boolean
  onEditPrice: (item: MenuItem) => void
  onToggleStatus: (id: number) => void
}) {
  return (
    <li className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line/70 px-4 py-4 last:border-b-0 lg:grid-cols-[1.5fr_0.75fr_0.9fr_0.55fr_0.75fr_1.85fr] lg:items-center">
      <div className="col-span-2 lg:col-span-1">
        <p className="text-label text-muted lg:hidden">Nama menu</p>
        <p className="mt-0.5 text-body font-semibold text-ink lg:mt-0">
          {item.nama}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Kategori</p>
        <p className="mt-0.5 text-ink lg:mt-0">{kategoriLabel(item.kategori)}</p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Harga</p>
        <p className="mt-0.5 font-semibold tabular text-ink lg:mt-0">
          {formatRupiah(item.harga)}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Varian</p>
        <p className="mt-0.5 text-ink lg:mt-0">
          {item.hasVarian ? 'Ya' : 'Tidak'}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Status</p>
        <div className="mt-1 lg:mt-0">
          <StatusBadge status={item.isHabis ? 'habis' : 'tersedia'} />
        </div>
      </div>

      <div className="col-span-2 flex flex-wrap items-center gap-2 lg:col-span-1 lg:flex-nowrap lg:justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEditPrice(item)}
          aria-label={`Ubah harga ${item.nama}`}
          disabled={statusLoading}
          icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
        >
          Ubah
        </Button>
        <Button
          variant={item.isHabis ? 'secondary' : 'danger'}
          size="sm"
          onClick={() => onToggleStatus(item.id)}
          loading={statusLoading}
          icon={
            item.isHabis ? (
              <CircleCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Ban className="h-4 w-4" aria-hidden="true" />
            )
          }
        >
          {item.isHabis ? 'Tandai Tersedia' : 'Tandai Habis'}
        </Button>
      </div>
    </li>
  )
}

function TableSkeleton() {
  return (
    <div
      className="space-y-3 rounded-xl border border-line bg-slate p-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat daftar menu</span>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-6">
          <div className="h-4 w-48 animate-pulse rounded bg-line" />
          <div className="h-4 w-20 animate-pulse rounded bg-line/70" />
          <div className="ml-auto h-4 w-24 animate-pulse rounded bg-line/70" />
        </div>
      ))}
    </div>
  )
}

export function KelolaMenuPage() {
  useDocumentTitle('Kelola Menu')

  const items = useMenuStore((state) => state.items)
  const loading = useMenuStore((state) => state.loading)
  const error = useMenuStore((state) => state.error)
  const fetchMenu = useMenuStore((state) => state.fetchMenu)
  const addMenu = useMenuStore((state) => state.addMenu)
  const updatePrice = useMenuStore((state) => state.updatePrice)
  const toggleHabis = useMenuStore((state) => state.toggleHabis)

  const [addOpen, setAddOpen] = useState(false)
  const [nama, setNama] = useState('')
  const [kategori, setKategori] = useState<Kategori>('kopi')
  const [hargaRaw, setHargaRaw] = useState('')
  const [hasVarian, setHasVarian] = useState(false)
  const [isHabis, setIsHabis] = useState(false)
  const [errors, setErrors] = useState<MenuErrors>({})
  const [saving, setSaving] = useState(false)

  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [editPriceRaw, setEditPriceRaw] = useState('')
  const [editError, setEditError] = useState<string>()
  const [editSaving, setEditSaving] = useState(false)

  const [actionError, setActionError] = useState('')
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null)

  useEffect(() => {
    void fetchMenu(true)
  }, [fetchMenu])

  useEffect(() => {
    if (!addOpen) return
    setNama('')
    setKategori('kopi')
    setHargaRaw('')
    setHasVarian(false)
    setIsHabis(false)
    setErrors({})
    setSaving(false)
    setActionError('')
  }, [addOpen])

  useEffect(() => {
    if (!editItem) return
    setEditPriceRaw(String(editItem.harga))
    setEditError(undefined)
    setEditSaving(false)
  }, [editItem])

  const validateAdd = () => {
    const nextErrors: MenuErrors = {}
    const trimmedName = nama.trim()

    if (trimmedName.length < 3 || trimmedName.length > 60) {
      nextErrors.nama = 'Nama menu harus 3 sampai 60 karakter.'
    }
    if (!kategoriOptions.some((option) => option.value === kategori)) {
      nextErrors.kategori = 'Pilih kategori menu.'
    }
    const nextPriceError = priceError(hargaRaw)
    if (nextPriceError) nextErrors.harga = nextPriceError

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleAddSubmit = async () => {
    if (!validateAdd()) return
    setSaving(true)
    setActionError('')

    try {
      await addMenu({
        nama,
        kategori,
        harga: Number(hargaRaw),
        hasVarian,
        isHabis,
      })
      setAddOpen(false)
    } catch (requestError) {
      const validation = getValidationErrors(requestError)
      if (validation.nama || validation.kategori || validation.harga) {
        setErrors({
          nama: validation.nama?.[0],
          kategori: validation.kategori?.[0],
          harga: validation.harga?.[0],
        })
      } else {
        setActionError(
          getFriendlyApiError(
            requestError,
            'Menu gagal disimpan. Periksa koneksi lalu coba lagi.',
          ),
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubmit = async () => {
    if (!editItem) return
    const nextError = priceError(editPriceRaw)
    if (nextError) {
      setEditError(nextError)
      return
    }

    setEditSaving(true)
    setEditError(undefined)

    try {
      await updatePrice(editItem.id, Number(editPriceRaw))
      setEditItem(null)
    } catch (requestError) {
      const validation = getValidationErrors(requestError)
      setEditError(
        validation.harga?.[0] ??
          getFriendlyApiError(
            requestError,
            'Harga gagal diperbarui. Periksa koneksi lalu coba lagi.',
          ),
      )
    } finally {
      setEditSaving(false)
    }
  }

  const handleToggleStatus = async (id: number) => {
    setStatusLoadingId(id)
    setActionError('')
    try {
      await toggleHabis(id)
    } catch (requestError) {
      setActionError(
        getFriendlyApiError(
          requestError,
          'Status menu gagal diperbarui. Periksa koneksi lalu coba lagi.',
        ),
      )
    } finally {
      setStatusLoadingId(null)
    }
  }

  const initialLoading = loading && items.length === 0
  const initialError = Boolean(error) && items.length === 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 xl:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display text-ink">Kelola Menu</h1>
          <p className="mt-1 text-body text-muted">
            Tambah menu, ubah harga, dan atur ketersediaan.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          icon={<Plus className="h-5 w-5" aria-hidden="true" />}
        >
          Tambah Menu
        </Button>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-panel text-ink">Daftar menu</h2>
          <span className="text-label text-muted tabular">{items.length} menu</span>
        </div>

        {initialLoading ? (
          <TableSkeleton />
        ) : initialError ? (
          <div
            className="flex flex-col items-start gap-4 rounded-xl border border-danger/30 bg-danger/10 p-5 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <WifiOff
                className="mt-0.5 h-5 w-5 shrink-0 text-danger-soft"
                aria-hidden="true"
              />
              <div>
                <p className="text-body font-semibold text-ink">
                  Gagal memuat daftar menu
                </p>
                <p className="mt-1 text-label text-muted">{error}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => void fetchMenu(true)}>
              Coba lagi
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="h-5 w-5" />}
            title="Belum ada menu"
            description="Tambahkan menu pertama agar katalog kasir dapat digunakan."
            action={
              <Button onClick={() => setAddOpen(true)}>Tambah Menu</Button>
            }
          />
        ) : (
          <>
            {error && (
              <div
                className="mb-3 flex items-center justify-between gap-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
                role="alert"
              >
                <span>{error}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void fetchMenu(true)}
                >
                  Coba lagi
                </Button>
              </div>
            )}

            {actionError && (
              <div
                className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
                role="alert"
              >
                {actionError}
              </div>
            )}

            <div className="overflow-hidden rounded-xl border border-line bg-slate">
              <div className="hidden grid-cols-[1.5fr_0.75fr_0.9fr_0.55fr_0.75fr_1.85fr] gap-4 border-b border-line bg-charcoal/40 px-4 py-3 text-label font-semibold text-muted lg:grid">
                <span>Nama menu</span>
                <span>Kategori</span>
                <span>Harga</span>
                <span>Varian</span>
                <span>Status</span>
                <span className="text-right">Aksi</span>
              </div>
              <ul>
                {items.map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    statusLoading={statusLoadingId === item.id}
                    onEditPrice={setEditItem}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Menu"
        description="Menu baru langsung tampil di katalog kasir."
        size="md"
        footer={
          <Button
            fullWidth
            size="lg"
            onClick={handleAddSubmit}
            loading={saving}
          >
            {saving ? 'Menyimpan menu' : 'Simpan Menu'}
          </Button>
        }
      >
        <div className="space-y-5">
          {actionError && (
            <div
              className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
              role="alert"
            >
              {actionError}
            </div>
          )}

          <Input
            label="Nama menu"
            required
            value={nama}
            onChange={(event) => {
              setNama(event.target.value)
              if (errors.nama) setErrors((current) => ({ ...current, nama: undefined }))
            }}
            maxLength={60}
            placeholder="Contoh: Kopi Susu Gula Aren"
            error={errors.nama}
            disabled={saving}
          />

          <Select
            label="Kategori"
            required
            value={kategori}
            onChange={(event) => {
              setKategori(event.target.value as Kategori)
              if (errors.kategori) {
                setErrors((current) => ({ ...current, kategori: undefined }))
              }
            }}
            error={errors.kategori}
            disabled={saving}
          >
            {kategoriOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Input
            label="Harga"
            required
            inputMode="numeric"
            prefix="Rp"
            value={hargaRaw ? formatNumber(Number(hargaRaw)) : ''}
            onChange={(event) => {
              setHargaRaw(parseDigits(event.target.value).slice(0, 9))
              if (errors.harga) {
                setErrors((current) => ({ ...current, harga: undefined }))
              }
            }}
            placeholder="0"
            error={errors.harga}
            helper="Rp 1.000 sampai Rp 1.000.000."
            disabled={saving}
          />

          <Switch
            checked={hasVarian}
            onChange={setHasVarian}
            label="Memiliki varian"
            description="Kasir memilih suhu dan takaran gula."
          />

          <Switch
            checked={isHabis}
            onChange={setIsHabis}
            label="Tandai Habis"
            description="Menu tetap tampil, tetapi tidak bisa dipesan."
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Ubah Harga"
        description={editItem?.nama}
        size="sm"
        footer={
          <Button
            fullWidth
            size="lg"
            onClick={handleEditSubmit}
            loading={editSaving}
          >
            {editSaving ? 'Menyimpan harga' : 'Simpan Harga'}
          </Button>
        }
      >
        <Input
          label="Harga baru"
          required
          inputMode="numeric"
          prefix="Rp"
          value={editPriceRaw ? formatNumber(Number(editPriceRaw)) : ''}
          onChange={(event) => {
            setEditPriceRaw(parseDigits(event.target.value).slice(0, 9))
            setEditError(undefined)
          }}
          error={editError}
          helper="Rp 1.000 sampai Rp 1.000.000."
          disabled={editSaving}
        />
      </Modal>
    </div>
  )
}
