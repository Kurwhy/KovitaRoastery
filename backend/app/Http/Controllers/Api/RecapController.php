<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

class RecapController extends Controller
{
    public function daily(): JsonResponse
    {
        $paid = Transaction::query()
            ->whereDate('created_at', now()->toDateString())
            ->where('status_bayar', 'paid');

        $totalOmzet = (int) (clone $paid)->sum('total');
        $totalTunai = (int) (clone $paid)
            ->where('metode_bayar', 'tunai')
            ->sum('total');
        $totalQris = (int) (clone $paid)
            ->where('metode_bayar', 'qris')
            ->sum('total');

        return response()->json([
            'total_omzet' => $totalOmzet,
            'jumlah_transaksi' => (clone $paid)->count(),
            'total_tunai' => $totalTunai,
            'total_qris' => $totalQris,
        ]);
    }
}
