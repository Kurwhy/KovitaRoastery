<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalesReportRequest;
use App\Http\Resources\TransactionSummaryResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class SalesReportController extends Controller
{
    public function sales(SalesReportRequest $request): JsonResponse
    {
        $timezone = config('app.timezone', 'Asia/Jakarta');
        $data = $request->validated();

        if ($data['periode'] === 'harian') {
            $date = Carbon::createFromFormat(
                'Y-m-d',
                $data['tanggal'],
                $timezone,
            )->startOfDay();
            $start = $date->copy()->startOfDay();
            $end = $date->copy()->endOfDay();

            $transactions = Transaction::query()
                ->with('user')
                ->whereBetween('created_at', [$start, $end])
                ->orderByDesc('created_at')
                ->get();

            $summary = $this->summary($start, $end);

            return response()->json([
                'periode' => 'harian',
                'tanggal' => $date->toDateString(),
                'bulan' => null,
                'ringkasan' => $summary,
                'transaksi' => TransactionSummaryResource::collection($transactions)->resolve(),
                'harian' => [],
            ]);
        }

        $monthStart = Carbon::createFromFormat(
            'Y-m-d',
            $data['bulan'].'-01',
            $timezone,
        )->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $summary = $this->summary($monthStart, $monthEnd);

        $daily = Transaction::query()
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->where('status_bayar', 'paid')
            ->selectRaw(
                'DATE(created_at) as tanggal, COUNT(*) as jumlah_transaksi, SUM(total) as total_omzet, SUM(CASE WHEN metode_bayar = ? THEN total ELSE 0 END) as total_tunai, SUM(CASE WHEN metode_bayar = ? THEN total ELSE 0 END) as total_qris',
                ['tunai', 'qris'],
            )
            ->groupByRaw('DATE(created_at)')
            ->orderBy('tanggal')
            ->get()
            ->map(fn ($row) => [
                'tanggal' => (string) $row->tanggal,
                'jumlah_transaksi' => (int) $row->jumlah_transaksi,
                'total_omzet' => (int) $row->total_omzet,
                'total_tunai' => (int) $row->total_tunai,
                'total_qris' => (int) $row->total_qris,
            ])
            ->values();

        return response()->json([
            'periode' => 'bulanan',
            'tanggal' => null,
            'bulan' => $data['bulan'],
            'ringkasan' => $summary,
            'transaksi' => [],
            'harian' => $daily,
        ]);
    }

    private function summary(Carbon $start, Carbon $end): array
    {
        $paid = Transaction::query()
            ->whereBetween('created_at', [$start, $end])
            ->where('status_bayar', 'paid');

        return [
            'total_omzet' => (int) (clone $paid)->sum('total'),
            'jumlah_transaksi' => (clone $paid)->count(),
            'total_tunai' => (int) (clone $paid)
                ->where('metode_bayar', 'tunai')
                ->sum('total'),
            'total_qris' => (int) (clone $paid)
                ->where('metode_bayar', 'qris')
                ->sum('total'),
        ];
    }
}
