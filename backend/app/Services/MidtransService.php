<?php

namespace App\Services;

use App\Exceptions\MidtransNotConfiguredException;
use App\Models\Transaction;
use Midtrans\Config as MidtransConfig;
use Midtrans\CoreApi;
use Midtrans\Transaction as MidtransTransaction;
use RuntimeException;

class MidtransService
{
    public function __construct()
    {
        $this->configure();
    }

    public function isConfigured(): bool
    {
        return trim((string) config('midtrans.server_key')) !== '';
    }

    public function chargeQris(Transaction $transaction): object
    {
        $this->ensureConfigured();

        return CoreApi::charge([
            'payment_type' => 'qris',
            'transaction_details' => [
                'order_id' => $transaction->midtrans_order_id,
                'gross_amount' => $transaction->total,
            ],
        ]);
    }

    public function fetchStatus(Transaction $transaction): object
    {
        $this->ensureConfigured();

        return MidtransTransaction::status($transaction->midtrans_order_id);
    }

    public function applyCharge(Transaction $transaction, object $charge): Transaction
    {
        $rawStatus = (string) ($charge->transaction_status ?? 'pending');
        $mappedStatus = $this->mapStatus($rawStatus);

        $transaction->update([
            'midtrans_transaction_id' => $charge->transaction_id ?? null,
            'midtrans_payment_type' => $charge->payment_type ?? 'qris',
            'midtrans_status' => $rawStatus,
            'status_bayar' => $mappedStatus,
            'paid_at' => $mappedStatus === 'paid'
                ? ($transaction->paid_at ?? now())
                : $transaction->paid_at,
        ]);

        return $transaction->refresh();
    }

    public function extractQris(object $charge): array
    {
        $actions = collect($charge->actions ?? []);
        $action = $actions->first(function ($candidate) {
            $name = is_array($candidate)
                ? ($candidate['name'] ?? null)
                : ($candidate->name ?? null);

            return in_array($name, ['generate-qr-code', 'qr-code'], true);
        });

        $url = is_array($action)
            ? ($action['url'] ?? null)
            : ($action->url ?? null);
        $qrString = $charge->qr_string ?? null;

        if (empty($url) && empty($qrString)) {
            throw new RuntimeException('Midtrans tidak mengembalikan data QR.');
        }

        return [
            'order_id' => $charge->order_id ?? null,
            'transaction_id' => $charge->transaction_id ?? null,
            'qr_code_url' => $url,
            'qr_string' => $qrString,
            'status' => $charge->transaction_status ?? 'pending',
        ];
    }

    public function validateSignature(array $payload): bool
    {
        $serverKey = trim((string) config('midtrans.server_key'));
        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signature = $payload['signature_key'] ?? null;

        if (
            $serverKey === ''
            || ! is_scalar($orderId)
            || ! is_scalar($statusCode)
            || ! is_scalar($grossAmount)
            || ! is_scalar($signature)
            || (string) $signature === ''
        ) {
            return false;
        }

        $expected = hash(
            'sha512',
            (string) $orderId.(string) $statusCode.(string) $grossAmount.$serverKey,
        );

        return hash_equals($expected, (string) $signature);
    }

    public function applyNotification(Transaction $transaction, array $payload): Transaction
    {
        return $this->applyStatus($transaction, (object) [
            'transaction_status' => $payload['transaction_status'] ?? null,
            'transaction_id' => $payload['transaction_id'] ?? null,
            'payment_type' => $payload['payment_type'] ?? null,
        ]);
    }

    public function applyStatus(Transaction $transaction, object $status): Transaction
    {
        $rawStatus = (string) ($status->transaction_status ?? 'pending');
        $mappedStatus = $this->mapStatus($rawStatus);

        $data = [
            'midtrans_transaction_id' => $status->transaction_id
                ?? $transaction->midtrans_transaction_id,
            'midtrans_payment_type' => $status->payment_type
                ?? $transaction->midtrans_payment_type,
            'midtrans_status' => $rawStatus,
        ];

        if ($transaction->status_bayar !== 'paid' || $mappedStatus === 'paid') {
            $data['status_bayar'] = $mappedStatus;
        }

        if ($mappedStatus === 'paid' && $transaction->paid_at === null) {
            $data['paid_at'] = now();
        }

        $transaction->update($data);

        return $transaction->refresh();
    }

    public function markChargeFailed(Transaction $transaction): void
    {
        if ($transaction->status_bayar === 'paid') {
            return;
        }

        $transaction->update([
            'status_bayar' => 'failed',
            'midtrans_status' => 'failure',
        ]);
    }

    public function mapStatus(string $midtransStatus): string
    {
        return match ($midtransStatus) {
            'settlement', 'capture' => 'paid',
            'pending' => 'pending',
            'deny', 'cancel', 'expire', 'failure' => 'failed',
            default => 'pending',
        };
    }

    private function configure(): void
    {
        MidtransConfig::$serverKey = trim((string) config('midtrans.server_key'));
        MidtransConfig::$isProduction = (bool) config('midtrans.is_production');
        MidtransConfig::$isSanitized = true;
        MidtransConfig::$is3ds = true;
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new MidtransNotConfiguredException;
        }
    }
}
