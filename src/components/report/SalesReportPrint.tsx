import { createPortal } from 'react-dom'
import { brandName } from '../../data/brand'
import {
  formatRupiah,
  metodeBayarLabel,
  tipePesananLabel,
} from '../../lib/format'
import {
  formatWibDate,
  formatWibDateTime,
  formatWibTime,
  wibDateFromKey,
} from '../../lib/date'
import type { SalesReport, SalesReportPeriod } from '../../types'

type SalesReportPrintProps = {
  report: SalesReport
  period: SalesReportPeriod
  periodLabel: string
}

export function SalesReportPrint({
  report,
  period,
  periodLabel,
}: SalesReportPrintProps) {
  const paidTransactions = report.transaksi.filter(
    (transaction) => transaction.statusBayar === 'paid',
  )

  return createPortal(
    <div id="sales-report-print" aria-hidden="true">
      <div className="report-page">
        <header className="report-header">
          <div>
            <p className="report-brand">{brandName}</p>
          </div>
          <div className="report-meta">
            <p>Laporan Penjualan</p>
            <p>{period === 'harian' ? 'Harian' : 'Bulanan'}</p>
          </div>
        </header>

        <div className="report-period">
          <span>{period === 'harian' ? 'Tanggal' : 'Bulan'}</span>
          <strong>{periodLabel}</strong>
        </div>

        <section className="report-summary" aria-label="Ringkasan laporan">
          <div>
            <span>Total omzet</span>
            <strong>{formatRupiah(report.ringkasan.totalOmzet)}</strong>
          </div>
          <div>
            <span>Transaksi lunas</span>
            <strong>{report.ringkasan.jumlahTransaksi}</strong>
          </div>
          <div>
            <span>Total Tunai</span>
            <strong>{formatRupiah(report.ringkasan.totalTunai)}</strong>
          </div>
          <div>
            <span>Total QRIS</span>
            <strong>{formatRupiah(report.ringkasan.totalQris)}</strong>
          </div>
        </section>

        {period === 'harian' ? (
          <section className="report-section">
            <h2>Transaksi Lunas</h2>
            {paidTransactions.length === 0 ? (
              <p className="report-empty">Belum ada transaksi lunas pada tanggal ini.</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Nomor transaksi</th>
                    <th>Waktu</th>
                    <th>Tipe pesanan</th>
                    <th>Metode</th>
                    <th className="report-amount">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {paidTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.kodeTransaksi}</td>
                      <td>{formatWibTime(transaction.createdAt)}</td>
                      <td>
                        {tipePesananLabel(
                          transaction.tipePesanan,
                          transaction.nomorMeja,
                        )}
                      </td>
                      <td>{metodeBayarLabel(transaction.metodeBayar)}</td>
                      <td className="report-amount tabular">
                        {formatRupiah(transaction.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : (
          <section className="report-section">
            <h2>Rekap Harian</h2>
            {report.harian.length === 0 ? (
              <p className="report-empty">Belum ada penjualan lunas pada bulan ini.</p>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th className="report-amount">Transaksi lunas</th>
                    <th className="report-amount">Tunai</th>
                    <th className="report-amount">QRIS</th>
                    <th className="report-amount">Total omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {report.harian.map((row) => (
                    <tr key={row.tanggal}>
                      <td>{formatWibDate(wibDateFromKey(row.tanggal))}</td>
                      <td className="report-amount tabular">{row.jumlahTransaksi}</td>
                      <td className="report-amount tabular">
                        {formatRupiah(row.totalTunai)}
                      </td>
                      <td className="report-amount tabular">
                        {formatRupiah(row.totalQris)}
                      </td>
                      <td className="report-amount tabular">
                        {formatRupiah(row.totalOmzet)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        <footer className="report-footer">
          <p>Hanya transaksi lunas yang dicetak dan dihitung dalam laporan ini.</p>
          <p>Dicetak pada {formatWibDateTime(new Date())}</p>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
