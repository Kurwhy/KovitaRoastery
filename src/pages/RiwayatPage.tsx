import { useEffect, useState } from 'react'
import {
  Banknote,
  Loader2,
  Printer,
  QrCode,
  ReceiptText,
  Wallet,
  WifiOff,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { StatusBadge } from '../components/ui/StatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SalesReportPrint } from '../components/report/SalesReportPrint'
import { api } from '../lib/api'
import { getFriendlyApiError } from '../lib/apiError'
import {
  mapSalesReport,
  mapTransactionSummary,
  type ApiSalesReport,
  type ApiTransactionSummary,
} from '../lib/apiMappers'
import {
  formatRupiah,
  metodeBayarLabel,
  tipePesananLabel,
} from '../lib/format'
import {
  formatWibDate,
  formatWibMonth,
  formatWibTime,
  getTodayWibDayKey,
  getWibDayKeyMonthsAgo,
  getWibMonthKey,
  getWibMonthKeyMonthsAgo,
  wibDateFromKey,
} from '../lib/date'
import { cn } from '../lib/cn'
import type {
  DailySalesRow,
  SalesReport,
  SalesReportPeriod,
  TransactionListItem,
} from '../types'

function TransactionRow({ transaction }: { transaction: TransactionListItem }) {
  return (
    <li className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line/70 px-4 py-4 last:border-b-0 lg:grid-cols-[1.65fr_0.8fr_1.1fr_0.8fr_0.8fr_1fr] lg:items-center">
      <div className="col-span-2 lg:col-span-1">
        <p className="text-label text-muted lg:hidden">Nomor transaksi</p>
        <p className="mt-0.5 font-semibold text-ink lg:mt-0">
          {transaction.kodeTransaksi}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Waktu</p>
        <p className="mt-0.5 text-ink lg:mt-0">
          {formatWibTime(transaction.createdAt)}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Tipe</p>
        <p className="mt-0.5 text-ink lg:mt-0">
          {tipePesananLabel(transaction.tipePesanan, transaction.nomorMeja)}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Metode</p>
        <p className="mt-0.5 text-ink lg:mt-0">
          {metodeBayarLabel(transaction.metodeBayar)}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Status</p>
        <div className="mt-1 lg:mt-0">
          <StatusBadge status={transaction.statusBayar} />
        </div>
      </div>

      <div className="lg:text-right">
        <p className="text-label text-muted lg:hidden">Total</p>
        <p className="mt-0.5 text-body font-bold tabular text-ink lg:mt-0">
          {formatRupiah(transaction.total)}
        </p>
      </div>
    </li>
  )
}

function DailyReportRow({ row }: { row: DailySalesRow }) {
  return (
    <li className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line/70 px-4 py-4 last:border-b-0 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr_1fr] lg:items-center">
      <div className="col-span-2 lg:col-span-1">
        <p className="text-label text-muted lg:hidden">Tanggal</p>
        <p className="mt-0.5 font-semibold text-ink lg:mt-0">
          {formatWibDate(wibDateFromKey(row.tanggal))}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Transaksi lunas</p>
        <p className="mt-0.5 tabular text-ink lg:mt-0">
          {row.jumlahTransaksi}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">Tunai</p>
        <p className="mt-0.5 tabular text-ink lg:mt-0">
          {formatRupiah(row.totalTunai)}
        </p>
      </div>

      <div>
        <p className="text-label text-muted lg:hidden">QRIS</p>
        <p className="mt-0.5 tabular text-ink lg:mt-0">
          {formatRupiah(row.totalQris)}
        </p>
      </div>

      <div className="lg:text-right">
        <p className="text-label text-muted lg:hidden">Total omzet</p>
        <p className="mt-0.5 text-body font-bold tabular text-ink lg:mt-0">
          {formatRupiah(row.totalOmzet)}
        </p>
      </div>
    </li>
  )
}

export function RiwayatPage() {
  useDocumentTitle('Riwayat')

  const user = useAuthStore((state) => state.user)
  const isOwner = user?.role === 'pemilik'
  const todayKey = getTodayWibDayKey()
  const currentMonthKey = getWibMonthKey()
  const minimumDate = getWibDayKeyMonthsAgo(2)
  const minimumMonth = getWibMonthKeyMonthsAgo(2)

  const [mode, setMode] = useState<SalesReportPeriod>('harian')
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey)
  const [report, setReport] = useState<SalesReport | null>(null)
  const [kasirTransactions, setKasirTransactions] = useState<
    TransactionListItem[]
  >([])
  const [kasirTotal, setKasirTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')
      setReport(null)

      try {
        if (isOwner) {
          const params =
            mode === 'harian'
              ? { periode: 'harian', tanggal: selectedDate }
              : { periode: 'bulanan', bulan: selectedMonth }
          const { data } = await api.get<ApiSalesReport>('/laporan/penjualan', {
            params,
          })
          if (!cancelled) setReport(mapSalesReport(data))
        } else {
          const { data } = await api.get<{
            data: ApiTransactionSummary[]
            meta: { total: number }
          }>('/transaksi/hari-ini', { params: { page: 1 } })
          if (!cancelled) {
            setKasirTransactions(data.data.map(mapTransactionSummary))
            setKasirTotal(data.meta?.total ?? data.data.length)
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            getFriendlyApiError(
              requestError,
              isOwner
                ? 'Gagal memuat laporan penjualan. Periksa koneksi lalu coba lagi.'
                : 'Gagal memuat riwayat transaksi. Periksa koneksi lalu coba lagi.',
            ),
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isOwner, mode, reloadKey, selectedDate, selectedMonth])

  const periodLabel = report
    ? mode === 'harian'
      ? formatWibDate(
          wibDateFromKey(report.tanggal ?? selectedDate),
        )
      : formatWibMonth(report.bulan ?? selectedMonth)
    : ''

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 xl:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display text-ink">Riwayat</h1>
          <p className="mt-1 text-body text-muted">
            {isOwner
              ? 'Laporan penjualan Kovita Roastery.'
              : 'Transaksi hari ini di Kovita Roastery.'}
          </p>
        </div>
        {!isOwner && (
          <p className="text-label text-muted">
            Hari ini, {formatWibDate(new Date())}
          </p>
        )}
      </div>

      {isOwner && (
        <section
          aria-label="Filter laporan"
          className="mt-6 rounded-xl border border-line bg-slate p-4"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <p className="mb-2 text-label font-medium text-ink">Periode</p>
                <div className="flex gap-2" role="group" aria-label="Periode laporan">
                  {(['harian', 'bulanan'] as SalesReportPeriod[]).map(
                    (per) => (
                      <button
                        key={per}
                        type="button"
                        aria-pressed={mode === per}
                        onClick={() => setMode(per)}
                        className={cn(
                          'h-12 rounded-lg border px-4 text-label font-semibold transition-colors duration-150',
                          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                          mode === per
                            ? 'border-brand-500 bg-brand-500 text-charcoal active:bg-brand-600'
                            : 'border-line bg-charcoal text-muted hover:border-brand-500/50 hover:text-ink active:bg-white/[0.06]',
                        )}
                      >
                        {per === 'harian' ? 'Harian' : 'Bulanan'}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="w-full sm:w-52">
                {mode === 'harian' ? (
                  <Input
                    label="Tanggal laporan"
                    type="date"
                    value={selectedDate}
                    min={minimumDate}
                    max={todayKey}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                ) : (
                  <Input
                    label="Bulan laporan"
                    type="month"
                    value={selectedMonth}
                    min={minimumMonth}
                    max={currentMonthKey}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <p className="text-label text-muted">
                Data tersimpan maksimal 2 bulan terakhir.
              </p>
              <Button
                onClick={() => window.print()}
                disabled={loading || Boolean(error) || !report}
                icon={<Printer className="h-4 w-4" aria-hidden="true" />}
              >
                Cetak Laporan
              </Button>
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div
          className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-line bg-slate px-4 py-16 text-label text-muted"
          role="status"
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {isOwner
            ? 'Memuat laporan penjualan.'
            : 'Memuat riwayat transaksi.'}
        </div>
      ) : error ? (
        <div
          className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-danger/30 bg-danger/10 p-5 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <WifiOff
              className="mt-0.5 h-5 w-5 shrink-0 text-danger-soft"
              aria-hidden="true"
            />
            <div>
              <p className="text-body font-semibold text-ink">
                Gagal memuat laporan
              </p>
              <p className="mt-1 text-label text-muted">{error}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Coba lagi
          </Button>
        </div>
      ) : isOwner && report ? (
        <>
          <section
            aria-label="Ringkasan dan rekap laporan"
            className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_1fr]"
          >
            <div className="rounded-xl border border-line bg-slate p-5">
              <p className="text-label font-semibold text-muted">
                Total omzet
              </p>
              <p className="mt-2 text-display font-bold tabular text-brand-400">
                {formatRupiah(report.ringkasan.totalOmzet)}
              </p>
              <p className="mt-1 text-label text-muted">
                {periodLabel}. Hanya transaksi berstatus lunas yang dihitung.
              </p>

              <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
                <span className="text-label text-muted">
                  Jumlah transaksi lunas
                </span>
                <span className="text-panel font-bold tabular text-ink">
                  {report.ringkasan.jumlahTransaksi}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-slate p-5">
              <h2 className="text-panel text-ink">
                {mode === 'harian' ? 'Rekap Harian' : 'Rekap Bulanan'}
              </h2>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-label text-muted">
                    <Banknote className="h-4 w-4" aria-hidden="true" />
                    Total Tunai
                  </dt>
                  <dd className="text-body font-semibold tabular text-ink">
                    {formatRupiah(report.ringkasan.totalTunai)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-label text-muted">
                    <QrCode className="h-4 w-4" aria-hidden="true" />
                    Total QRIS
                  </dt>
                  <dd className="text-body font-semibold tabular text-ink">
                    {formatRupiah(report.ringkasan.totalQris)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                  <dt className="flex items-center gap-2 text-label font-semibold text-ink">
                    <Wallet className="h-4 w-4" aria-hidden="true" />
                    Total gabungan
                  </dt>
                  <dd className="text-panel font-bold tabular text-brand-400">
                    {formatRupiah(
                      report.ringkasan.totalTunai +
                        report.ringkasan.totalQris,
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="daftar-transaksi" className="mt-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="daftar-transaksi" className="text-panel text-ink">
                {mode === 'harian' ? 'Transaksi' : 'Rekap harian'}
              </h2>
              <span className="text-label text-muted tabular">
                {mode === 'harian'
                  ? `${report.transaksi.length} transaksi`
                  : `${report.harian.length} hari`}
              </span>
            </div>

            {mode === 'harian' ? (
              report.transaksi.length === 0 ? (
                <EmptyState
                  icon={<ReceiptText className="h-5 w-5" />}
                  title="Belum ada transaksi pada tanggal ini"
                  description="Pilih tanggal lain atau periksa kembali setelah transaksi tercatat."
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-line bg-slate">
                  <div className="hidden grid-cols-[1.65fr_0.8fr_1.1fr_0.8fr_0.8fr_1fr] gap-4 border-b border-line bg-charcoal/40 px-4 py-3 text-label font-semibold text-muted lg:grid">
                    <span>Nomor transaksi</span>
                    <span>Waktu</span>
                    <span>Tipe pesanan</span>
                    <span>Metode</span>
                    <span>Status</span>
                    <span className="text-right">Total</span>
                  </div>
                  <ul>
                    {report.transaksi.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </ul>
                </div>
              )
            ) : report.harian.length === 0 ? (
              <EmptyState
                icon={<ReceiptText className="h-5 w-5" />}
                title="Belum ada penjualan lunas pada bulan ini"
                description="Pilih bulan lain atau kembali setelah transaksi tercatat."
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-line bg-slate">
                <div className="hidden grid-cols-[1.3fr_0.8fr_1fr_1fr_1fr] gap-4 border-b border-line bg-charcoal/40 px-4 py-3 text-label font-semibold text-muted lg:grid">
                  <span>Tanggal</span>
                  <span>Transaksi lunas</span>
                  <span>Tunai</span>
                  <span>QRIS</span>
                  <span className="text-right">Total omzet</span>
                </div>
                <ul>
                  {report.harian.map((row) => (
                    <DailyReportRow key={row.tanggal} row={row} />
                  ))}
                </ul>
              </div>
            )}
          </section>

          <SalesReportPrint
            report={report}
            period={mode}
            periodLabel={periodLabel}
          />
        </>
      ) : !isOwner ? (
        <section aria-labelledby="daftar-transaksi" className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="daftar-transaksi" className="text-panel text-ink">
              Transaksi hari ini
            </h2>
            <span className="text-label text-muted tabular">
              {kasirTotal} transaksi
            </span>
          </div>

          {kasirTransactions.length === 0 ? (
            <EmptyState
              icon={<ReceiptText className="h-5 w-5" />}
              title="Belum ada transaksi hari ini"
              description="Transaksi yang selesai pada hari ini akan muncul di sini."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-slate">
              <div className="hidden grid-cols-[1.65fr_0.8fr_1.1fr_0.8fr_0.8fr_1fr] gap-4 border-b border-line bg-charcoal/40 px-4 py-3 text-label font-semibold text-muted lg:grid">
                <span>Nomor transaksi</span>
                <span>Waktu</span>
                <span>Tipe pesanan</span>
                <span>Metode</span>
                <span>Status</span>
                <span className="text-right">Total</span>
              </div>
              <ul>
                {kasirTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
