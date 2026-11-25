<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\TransactionSummaryResource;
use App\Models\Transaction;
use App\Services\MidtransService;
use App\Services\TransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Log;
use Throwable;

class TransactionController extends Controller
{
    public function store(
        StoreTransactionRequest $request,
        TransactionService $transactionService,
        MidtransService $midtransService,
    ): JsonResponse {
        $data = $request->validated();
        $user = $request->user();

        if ($data['metode_bayar'] === 'qris') {
            if (! $midtransService->isConfigured()) {
                return response()->json([
                    'message' => 'Pembayaran QRIS belum dikonfigurasi.',
                ], 503);
            }

            $transaction = $transactionService->createPendingQris($data, $user);

            try {
                $charge = $midtransService->chargeQris($transaction);
                $transaction = $midtransService->applyCharge($transaction, $charge);
                $qris = $midtransService->extractQris($charge);
            } catch (Throwable $error) {
                Log::error('Midtrans QRIS charge failed.', [
                    'transaction_id' => $transaction->id,
                    'message' => $error->getMessage(),
                ]);
                $midtransService->markChargeFailed($transaction);

                return response()->json([
                    'message' => 'Pembayaran QRIS gagal dibuat. Coba lagi.',
                ], 502);
            }

            return response()->json([
                'data' => (new TransactionResource(
                    $transaction->load(['user', 'items.addons']),
                ))->resolve(),
                'qris' => $qris,
            ], 201);
        }

        $transaction = $transactionService->createCash($data, $user);

        return (new TransactionResource($transaction))
            ->response()
            ->setStatusCode(201);
    }

    public function today(): AnonymousResourceCollection
    {
        $transactions = Transaction::query()
            ->with('user')
            ->whereDate('created_at', now()->toDateString())
            ->orderByDesc('created_at')
            ->paginate(50);

        return TransactionSummaryResource::collection($transactions);
    }

    public function status(
        Transaction $transaction,
        MidtransService $midtransService,
    ): JsonResponse|TransactionResource {
        if ($transaction->status_bayar !== 'pending') {
            return new TransactionResource(
                $transaction->load(['user', 'items.addons']),
            );
        }

        if (! $midtransService->isConfigured()) {
            return response()->json([
                'message' => 'Pembayaran QRIS belum dikonfigurasi.',
            ], 503);
        }

        if (! $transaction->midtrans_order_id) {
            return response()->json([
                'message' => 'Transaksi tidak memiliki nomor Midtrans.',
            ], 409);
        }

        try {
            $status = $midtransService->fetchStatus($transaction);
            $transaction = $midtransService->applyStatus($transaction, $status);
        } catch (Throwable $error) {
            Log::error('Midtrans status check failed.', [
                'transaction_id' => $transaction->id,
                'message' => $error->getMessage(),
            ]);

            return response()->json([
                'message' => 'Gagal memeriksa status pembayaran.',
            ], 502);
        }

        return new TransactionResource(
            $transaction->load(['user', 'items.addons']),
        );
    }
}
