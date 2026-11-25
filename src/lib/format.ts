import type { Kategori, MetodeBayar, Role, StatusBayar, TipePesanan } from '../types'

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number) {
  return `Rp ${rupiahFormatter.format(Math.max(0, Math.round(value)))}`
}

export function formatNumber(value: number) {
  return rupiahFormatter.format(value)
}

export function kategoriLabel(kategori: Kategori) {
  const labels: Record<Kategori, string> = {
    kopi: 'Kopi',
    non_kopi: 'Non-Kopi',
    makanan: 'Makanan',
    camilan: 'Camilan',
  }
  return labels[kategori]
}

export function roleLabel(role: Role) {
  return role === 'pemilik' ? 'Pemilik' : 'Kasir'
}

export function tipePesananLabel(tipe: TipePesanan, nomorMeja: number | null) {
  if (tipe === 'takeaway') return 'Takeaway'
  return nomorMeja ? `Dine-In, Meja ${nomorMeja}` : 'Dine-In'
}

export function metodeBayarLabel(metode: MetodeBayar) {
  return metode === 'tunai' ? 'Tunai' : 'QRIS'
}

export function statusBayarLabel(status: StatusBayar) {
  const labels: Record<StatusBayar, string> = {
    paid: 'Lunas',
    pending: 'Pending',
    failed: 'Gagal',
  }
  return labels[status]
}

export function suhuLabel(suhu: 'hot' | 'ice') {
  return suhu === 'hot' ? 'Hot' : 'Ice'
}

export function gulaLabel(gula: 'normal' | 'kurang' | 'tanpa') {
  const labels = {
    normal: 'Normal',
    kurang: 'Kurang Manis',
    tanpa: 'Tanpa Gula',
  }
  return labels[gula]
}

export function parseDigits(value: string) {
  return value.replace(/\D/g, '')
}
