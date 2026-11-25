export type Role = 'kasir' | 'pemilik'

export type User = {
  id: number
  nama: string
  email: string
  role: Role
}

export type Kategori = 'kopi' | 'non_kopi' | 'makanan' | 'camilan'

export type Suhu = 'hot' | 'ice'

export type TakaranGula = 'normal' | 'kurang' | 'tanpa'

export type Addon = {
  id: number
  kode: 'extra_shot' | 'oat_milk' | 'boba'
  nama: string
  harga: number
}

export type MenuItem = {
  id: number
  nama: string
  kategori: Kategori
  harga: number
  fotoUrl: string | null
  hasVarian: boolean
  isHabis: boolean
}

export type CartItem = {
  key: string
  menuItemId: number
  namaMenu: string
  kategori: Kategori
  hargaDasar: number
  suhu: Suhu | null
  gula: TakaranGula | null
  addons: Addon[]
  catatan: string
  qty: number
}

export type TipePesanan = 'dine_in' | 'takeaway'

export type MetodeBayar = 'tunai' | 'qris'

export type StatusBayar = 'pending' | 'paid' | 'failed'

export type TransactionAddon = {
  id: number
  nama: string
  harga: number
}

export type TransactionItem = {
  menuItemId: number
  namaMenu: string
  hargaSatuan: number
  suhu: Suhu | null
  gula: TakaranGula | null
  addons: TransactionAddon[]
  catatan: string | null
  qty: number
  subtotalItem: number
}

export type Transaction = {
  id: number
  kodeTransaksi: string
  createdAt: Date
  namaKasir: string
  tipePesanan: TipePesanan
  nomorMeja: number | null
  subtotal: number
  pb1Aktif: boolean
  pb1Nominal: number
  total: number
  metodeBayar: MetodeBayar
  statusBayar: StatusBayar
  uangDiterima: number | null
  kembalian: number | null
  paidAt: Date | null
  items: TransactionItem[]
}

export type QrisCharge = {
  orderId: string
  transactionId: string | null
  qrCodeUrl: string | null
  qrString: string | null
  status: string
}

export type TransactionListItem = {
  id: number
  kodeTransaksi: string
  createdAt: Date
  namaKasir: string
  tipePesanan: TipePesanan
  nomorMeja: number | null
  metodeBayar: MetodeBayar
  statusBayar: StatusBayar
  total: number
}

export type DailyRecap = {
  totalOmzet: number
  jumlahTransaksi: number
  totalTunai: number
  totalQris: number
}


export type SalesReportPeriod = 'harian' | 'bulanan'

export type DailySalesRow = {
  tanggal: string
  jumlahTransaksi: number
  totalOmzet: number
  totalTunai: number
  totalQris: number
}

export type SalesReport = {
  periode: SalesReportPeriod
  tanggal: string | null
  bulan: string | null
  ringkasan: DailyRecap
  transaksi: TransactionListItem[]
  harian: DailySalesRow[]
}
