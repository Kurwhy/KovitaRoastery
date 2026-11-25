import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Coffee,
  Cookie,
  CupSoda,
  LayoutGrid,
  Search,
  SearchX,
  ShieldAlert,
  UtensilsCrossed,
  WifiOff,
} from 'lucide-react'
import type {
  Addon,
  Kategori,
  MenuItem,
  Suhu,
  TakaranGula,
  Transaction,
} from '../types'
import { useMenuStore } from '../stores/menuStore'
import { useAddonStore } from '../stores/addonStore'
import { useCartStore } from '../stores/cartStore'
import { MenuCard } from '../components/menu/MenuCard'
import { CartPanel } from '../components/cart/CartPanel'
import { CategoryChip } from '../components/ui/CategoryChip'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const VariantModal = lazy(() =>
  import('../components/menu/VariantModal').then((module) => ({
    default: module.VariantModal,
  })),
)

const PaymentFlow = lazy(() =>
  import('../components/payment/PaymentFlow').then((module) => ({
    default: module.PaymentFlow,
  })),
)

const ReceiptModal = lazy(() =>
  import('../components/payment/ReceiptModal').then((module) => ({
    default: module.ReceiptModal,
  })),
)

type CategoryFilter = 'semua' | Kategori

const categories: Array<{
  value: CategoryFilter
  label: string
  icon: ReactNode
}> = [
  {
    value: 'semua',
    label: 'Semua',
    icon: <LayoutGrid className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: 'kopi',
    label: 'Kopi',
    icon: <Coffee className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: 'non_kopi',
    label: 'Non-Kopi',
    icon: <CupSoda className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: 'makanan',
    label: 'Makanan',
    icon: <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: 'camilan',
    label: 'Camilan',
    icon: <Cookie className="h-4 w-4" aria-hidden="true" />,
  },
]

function CatalogSkeleton() {
  return (
    <div
      className="grid grid-cols-3 gap-3 lg:grid-cols-4"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Memuat menu</span>
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-line bg-slate"
        >
          <div className="aspect-[4/3] animate-pulse bg-charcoal" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-line" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/70" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function KasirPage() {
  useDocumentTitle('Kasir')

  const menuItems = useMenuStore((state) => state.items)
  const menuLoading = useMenuStore((state) => state.loading)
  const menuLoaded = useMenuStore((state) => state.loaded)
  const menuError = useMenuStore((state) => state.error)
  const fetchMenu = useMenuStore((state) => state.fetchMenu)
  const addons = useAddonStore((state) => state.items)
  const addonsLoading = useAddonStore((state) => state.loading)
  const addonsLoaded = useAddonStore((state) => state.loaded)
  const addonsError = useAddonStore((state) => state.error)
  const fetchAddons = useAddonStore((state) => state.fetchAddons)
  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const finishTransaction = useCartStore((state) => state.finishTransaction)
  const location = useLocation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('semua')
  const [variantMenu, setVariantMenu] = useState<MenuItem | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receipt, setReceipt] = useState<Transaction | null>(null)
  const [notice, setNotice] = useState('')
  const [availabilityError, setAvailabilityError] = useState('')

  const accessDenied = Boolean(
    (location.state as { accessDenied?: boolean } | null)?.accessDenied,
  )

  useEffect(() => {
    void fetchMenu()
    void fetchAddons()
  }, [fetchAddons, fetchMenu])

  useEffect(() => {
    if (!accessDenied) return
    const timer = window.setTimeout(() => {
      navigate('/kasir', { replace: true })
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [accessDenied, navigate])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return menuItems.filter((menu) => {
      const matchesCategory = category === 'semua' || menu.kategori === category
      const matchesKeyword =
        keyword.length === 0 || menu.nama.toLowerCase().includes(keyword)
      return matchesCategory && matchesKeyword
    })
  }, [category, menuItems, search])

  const initialLoading =
    (!menuLoaded && !menuError) ||
    (!addonsLoaded && !addonsError) ||
    (menuLoading && menuItems.length === 0) ||
    (addonsLoading && addons.length === 0)
  const catalogError = menuError ?? addonsError
  const showError = !initialLoading && Boolean(catalogError)

  const handleRetry = () => {
    void fetchMenu(true)
    void fetchAddons(true)
  }

  const handleSelectMenu = (menu: MenuItem) => {
    if (menu.isHabis) return
    if (menu.hasVarian) {
      setVariantMenu(menu)
      return
    }

    const result = addItem(menu)
    setAvailabilityError('')
    if (result === 'full') {
      setNotice('Keranjang mencapai batas 50 baris. Selesaikan pesanan lain dulu.')
    } else if (result === 'maxed') {
      setNotice('Jumlah item ini sudah mencapai batas 99.')
    } else {
      setNotice('')
    }
  }

  const handleAddVariant = (
    menu: MenuItem,
    options: {
      suhu: Suhu
      gula: TakaranGula
      addons: Addon[]
      catatan: string
    },
  ) => {
    const result = addItem(menu, options)
    if (result === 'added' || result === 'merged') {
      setAvailabilityError('')
      setNotice('')
    }
    return result
  }

  const handleOpenPayment = () => {
    const unavailable = cartItems.filter((item) => {
      const menu = menuItems.find((entry) => entry.id === item.menuItemId)
      return menu?.isHabis
    })

    if (unavailable.length > 0) {
      unavailable.forEach((item) => removeItem(item.key))
      setAvailabilityError(
        unavailable
          .map((item) => `Menu ${item.namaMenu} baru saja habis`)
          .join('. ')
          .concat('.'),
      )
      return
    }

    setAvailabilityError('')
    setNotice('')
    setPaymentOpen(true)
  }

  const handleUnavailable = (message: string, menuIds: number[]) => {
    const ids = new Set(menuIds)
    cartItems
      .filter((item) => ids.has(item.menuItemId))
      .forEach((item) => removeItem(item.key))

    setAvailabilityError(message.endsWith('.') ? message : `${message}.`)
    setPaymentOpen(false)
    setNotice('')
    void fetchMenu(true)
  }

  const handlePaymentSuccess = (transaction: Transaction) => {
    setPaymentOpen(false)
    setReceipt(transaction)
  }

  const handleReceiptClose = () => {
    setReceipt(null)
    finishTransaction()
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-4 xl:px-6">
      {accessDenied && (
        <div
          className="mb-4 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-label text-danger-soft"
          role="alert"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Akses ditolak. Halaman Kelola Menu hanya tersedia untuk peran
            Pemilik.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[65fr_35fr]">
        <section aria-labelledby="katalog-title" className="min-w-0">
          <div className="mb-4">
            <h1 id="katalog-title" className="text-display text-ink">
              Kasir
            </h1>
            <p className="mt-1 text-body text-muted">
              Pilih menu, atur varian, lalu selesaikan pembayaran.
            </p>
          </div>

          <h2 className="sr-only">Katalog menu</h2>

          {initialLoading ? (
            <CatalogSkeleton />
          ) : showError ? (
            <EmptyState
              icon={<WifiOff className="h-5 w-5" />}
              title="Gagal memuat menu"
              description={
                catalogError ??
                'Data menu tidak dapat dimuat. Periksa koneksi lalu coba lagi.'
              }
              action={
                <Button variant="secondary" onClick={handleRetry}>
                  Coba lagi
                </Button>
              }
            />
          ) : menuItems.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="h-5 w-5" />}
              title="Menu belum tersedia"
              description="Tambahkan menu dari halaman Kelola Menu agar katalog dapat digunakan."
            />
          ) : (
            <>
              <div className="mb-4 space-y-3 rounded-xl border border-line bg-slate p-3">
                <Input
                  label="Cari menu"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ketik nama menu"
                  prefix={<Search className="h-4 w-4" aria-hidden="true" />}
                  autoComplete="off"
                />

                <div className="flex flex-wrap gap-2" aria-label="Filter kategori">
                  {categories.map((item) => (
                    <CategoryChip
                      key={item.value}
                      label={item.label}
                      active={category === item.value}
                      icon={item.icon}
                      onClick={() => setCategory(item.value)}
                    />
                  ))}
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <EmptyState
                  icon={<SearchX className="h-5 w-5" />}
                  title="Menu tidak ditemukan"
                  description="Coba kata kunci lain atau pilih kategori yang berbeda."
                  action={
                    search ? (
                      <Button
                        variant="secondary"
                        onClick={() => setSearch('')}
                        className="min-h-12"
                      >
                        Hapus pencarian
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                  {filteredItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onSelect={handleSelectMenu}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <CartPanel
          onPay={handleOpenPayment}
          notice={notice}
          availabilityError={availabilityError}
        />
      </div>

      {variantMenu && (
        <Suspense fallback={null}>
          <VariantModal
            menu={variantMenu}
            addons={addons}
            onClose={() => setVariantMenu(null)}
            onAdd={handleAddVariant}
          />
        </Suspense>
      )}

      {paymentOpen && (
        <Suspense fallback={null}>
          <PaymentFlow
            open={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            onSuccess={handlePaymentSuccess}
            onUnavailable={handleUnavailable}
          />
        </Suspense>
      )}

      {receipt && (
        <Suspense fallback={null}>
          <ReceiptModal transaction={receipt} onClose={handleReceiptClose} />
        </Suspense>
      )}
    </div>
  )
}
