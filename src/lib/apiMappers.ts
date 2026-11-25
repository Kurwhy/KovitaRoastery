import type {
  Addon,
  DailyRecap,
  Kategori,
  MetodeBayar,
  QrisCharge,
  SalesReport,
  SalesReportPeriod,
  StatusBayar,
  TipePesanan,
  Transaction,
  TransactionAddon,
  TransactionListItem,
  User,
} from '../types'

export type ApiUser = User

export type ApiMenuItem = {
  id: number
  nama: string
  kategori: Kategori
  harga: number
  foto_url: string | null
  has_varian: boolean
  is_habis: boolean
}

export type ApiAddon = {
  id: number
  kode: string
  nama: string
  harga: number
}

export type ApiTransactionSummary = {
  id: number
  kode_transaksi: string
  created_at: string
  nama_kasir?: string
  tipe_pesanan: TipePesanan
  nomor_meja: number | null
  metode_bayar: MetodeBayar
  status_bayar: StatusBayar
  total: number
}

export type ApiTransactionItem = {
  id: number
  menu_item_id: number
  nama_menu: string
  harga_satuan: number
  suhu: 'hot' | 'ice' | null
  gula: 'normal' | 'kurang' | 'tanpa' | null
  catatan: string | null
  qty: number
  subtotal_item: number
  addons: Array<{ id: number; nama: string; harga: number }>
}

export type ApiTransaction = {
  id: number
  kode_transaksi: string
  created_at: string
  nama_kasir?: string
  tipe_pesanan: TipePesanan
  nomor_meja: number | null
  subtotal: number
  pb1_aktif: boolean
  pb1_nominal: number
  total: number
  metode_bayar: MetodeBayar
  status_bayar: StatusBayar
  uang_diterima: number | null
  kembalian: number | null
  paid_at: string | null
  items: ApiTransactionItem[]
}

export type ApiQrisCharge = {
  order_id: string
  transaction_id: string | null
  qr_code_url: string | null
  qr_string: string | null
  status: string
}

export type ApiDailySalesRow = {
  tanggal: string
  jumlah_transaksi: number
  total_omzet: number
  total_tunai: number
  total_qris: number
}

export type ApiSalesReport = {
  periode: SalesReportPeriod
  tanggal: string | null
  bulan: string | null
  ringkasan: ApiDailyRecap
  transaksi: ApiTransactionSummary[]
  harian: ApiDailySalesRow[]
}

export type ApiQrisChargeResponse = {
  data: ApiTransaction
  qris: ApiQrisCharge
}

export type ApiDailyRecap = {
  total_omzet: number
  jumlah_transaksi: number
  total_tunai: number
  total_qris: number
}

export function mapAddon(raw: ApiAddon): Addon {
  return {
    id: raw.id,
    kode: raw.kode as Addon['kode'],
    nama: raw.nama,
    harga: raw.harga,
  }
}

export function mapMenuItem(raw: ApiMenuItem) {
  return {
    id: raw.id,
    nama: raw.nama,
    kategori: raw.kategori,
    harga: raw.harga,
    fotoUrl: raw.foto_url,
    hasVarian: raw.has_varian,
    isHabis: raw.is_habis,
  }
}

export function mapQrisCharge(raw: ApiQrisCharge): QrisCharge {
  return {
    orderId: raw.order_id,
    transactionId: raw.transaction_id,
    qrCodeUrl: raw.qr_code_url,
    qrString: raw.qr_string,
    status: raw.status,
  }
}

export function mapTransactionSummary(raw: ApiTransactionSummary): TransactionListItem {
  return {
    id: raw.id,
    kodeTransaksi: raw.kode_transaksi,
    createdAt: new Date(raw.created_at),
    namaKasir: raw.nama_kasir ?? '',
    tipePesanan: raw.tipe_pesanan,
    nomorMeja: raw.nomor_meja,
    metodeBayar: raw.metode_bayar,
    statusBayar: raw.status_bayar,
    total: raw.total,
  }
}

export function mapTransaction(raw: ApiTransaction): Transaction {
  return {
    id: raw.id,
    kodeTransaksi: raw.kode_transaksi,
    createdAt: new Date(raw.created_at),
    namaKasir: raw.nama_kasir ?? '',
    tipePesanan: raw.tipe_pesanan,
    nomorMeja: raw.nomor_meja,
    subtotal: raw.subtotal,
    pb1Aktif: raw.pb1_aktif,
    pb1Nominal: raw.pb1_nominal,
    total: raw.total,
    metodeBayar: raw.metode_bayar,
    statusBayar: raw.status_bayar,
    uangDiterima: raw.uang_diterima,
    kembalian: raw.kembalian,
    paidAt: raw.paid_at ? new Date(raw.paid_at) : null,
    items: raw.items.map((item) => ({
      menuItemId: item.menu_item_id,
      namaMenu: item.nama_menu,
      hargaSatuan: item.harga_satuan,
      suhu: item.suhu,
      gula: item.gula,
      addons: item.addons.map<TransactionAddon>((addon) => ({
        id: addon.id,
        nama: addon.nama,
        harga: addon.harga,
      })),
      catatan: item.catatan,
      qty: item.qty,
      subtotalItem: item.subtotal_item,
    })),
  }
}

export function mapSalesReport(raw: ApiSalesReport): SalesReport {
  return {
    periode: raw.periode,
    tanggal: raw.tanggal,
    bulan: raw.bulan,
    ringkasan: mapDailyRecap(raw.ringkasan),
    transaksi: raw.transaksi.map(mapTransactionSummary),
    harian: raw.harian.map((row) => ({
      tanggal: row.tanggal,
      jumlahTransaksi: row.jumlah_transaksi,
      totalOmzet: row.total_omzet,
      totalTunai: row.total_tunai,
      totalQris: row.total_qris,
    })),
  }
}

export function mapDailyRecap(raw: ApiDailyRecap): DailyRecap {
  return {
    totalOmzet: raw.total_omzet,
    jumlahTransaksi: raw.jumlah_transaksi,
    totalTunai: raw.total_tunai,
    totalQris: raw.total_qris,
  }
}
