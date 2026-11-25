<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransController extends Controller
{
    public function notification(
        Request $request,
        MidtransService $midtransService,
    ): JsonResponse {
        if (! $midtransService->isConfigured()) {
            return response()->json([
                'message' => 'Pembayaran QRIS belum dikonfigurasi.',
            ], 503);
        }

        $payload = $request->all();

        if (! $midtransService->validateSignature($payload)) {
            return response()->json([
                'message' => 'Notifikasi tidak valid.',
            ], 403);
        }

        $orderId = (string) ($payload['order_id'] ?? '');
        $transaction = Transaction::query()
            ->where('midtrans_order_id', $orderId)
            ->first();

        if (! $transaction) {
            return response()->json([
                'message' => 'Transaksi tidak ditemukan.',
            ], 404);
        }

        $grossAmount = $payload['gross_amount'] ?? null;
        if (! is_numeric($grossAmount) || (int) round((float) $grossAmount) !== $transaction->total) {
            return response()->json([
                'message' => 'Jumlah notifikasi tidak sesuai.',
            ], 422);
        }

        $midtransService->applyNotification($transaction, $payload);

        return response()->json([
            'message' => 'Notifikasi diterima.',
        ]);
    }
}
