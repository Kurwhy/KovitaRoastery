<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MidtransNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('midtrans.server_key', 'test-server-key');
        config()->set('midtrans.is_production', false);
    }

    public function test_invalid_signature_is_rejected_and_transaction_is_unchanged(): void
    {
        $transaction = $this->pendingTransaction();
        $payload = $this->notificationPayload($transaction, 'settlement');
        $payload['signature_key'] = str_repeat('0', 128);

        $this->postJson('/api/midtrans/notification', $payload)
            ->assertForbidden();

        $transaction->refresh();
        $this->assertSame('pending', $transaction->status_bayar);
        $this->assertNull($transaction->paid_at);
    }

    public function test_settlement_marks_transaction_as_paid(): void
    {
        $transaction = $this->pendingTransaction();

        $this->postJson('/api/midtrans/notification', $this->notificationPayload($transaction, 'settlement'))
            ->assertOk();

        $transaction->refresh();
        $this->assertSame('paid', $transaction->status_bayar);
        $this->assertSame('settlement', $transaction->midtrans_status);
        $this->assertSame('midtrans-tx-1', $transaction->midtrans_transaction_id);
        $this->assertNotNull($transaction->paid_at);
    }

    public function test_capture_marks_transaction_as_paid(): void
    {
        $transaction = $this->pendingTransaction();

        $this->postJson('/api/midtrans/notification', $this->notificationPayload($transaction, 'capture'))
            ->assertOk();

        $this->assertSame('paid', $transaction->refresh()->status_bayar);
    }

    public function test_pending_remains_pending(): void
    {
        $transaction = $this->pendingTransaction();

        $this->postJson('/api/midtrans/notification', $this->notificationPayload($transaction, 'pending'))
            ->assertOk();

        $this->assertSame('pending', $transaction->refresh()->status_bayar);
    }

    public function test_expire_marks_transaction_as_failed(): void
    {
        $transaction = $this->pendingTransaction();

        $this->postJson('/api/midtrans/notification', $this->notificationPayload($transaction, 'expire', '202'))
            ->assertOk();

        $transaction->refresh();
        $this->assertSame('failed', $transaction->status_bayar);
        $this->assertSame('expire', $transaction->midtrans_status);
        $this->assertNull($transaction->paid_at);
    }

    public function test_valid_signature_with_wrong_gross_amount_is_rejected(): void
    {
        $transaction = $this->pendingTransaction();

        $this->postJson(
            '/api/midtrans/notification',
            $this->notificationPayload($transaction, 'settlement', '200', '12000.00'),
        )->assertStatus(422);

        $this->assertSame('pending', $transaction->refresh()->status_bayar);
    }

    public function test_unknown_order_is_not_found(): void
    {
        $payload = [
            'order_id' => 'KOV-20260101-999999',
            'status_code' => '200',
            'gross_amount' => '10000.00',
            'signature_key' => $this->signature('KOV-20260101-999999', '200', '10000.00'),
            'transaction_status' => 'settlement',
            'transaction_id' => 'midtrans-unknown',
            'payment_type' => 'qris',
        ];

        $this->postJson('/api/midtrans/notification', $payload)->assertNotFound();
    }

    public function test_notification_is_rejected_when_configuration_is_missing(): void
    {
        config()->set('midtrans.server_key', '');
        $transaction = $this->pendingTransaction();
        $payload = $this->notificationPayload($transaction, 'settlement');

        $this->postJson('/api/midtrans/notification', $payload)->assertStatus(503);
        $this->assertSame('pending', $transaction->refresh()->status_bayar);
    }

    private function pendingTransaction(): Transaction
    {
        $user = User::factory()->create();

        return Transaction::create([
            'kode_transaksi' => 'KOV-20261125-000001',
            'user_id' => $user->id,
            'tipe_pesanan' => 'takeaway',
            'nomor_meja' => null,
            'subtotal' => 10000,
            'pb1_aktif' => false,
            'pb1_nominal' => 0,
            'total' => 10000,
            'metode_bayar' => 'qris',
            'status_bayar' => 'pending',
            'midtrans_order_id' => 'KOV-20261125-000001',
        ]);
    }

    private function notificationPayload(
        Transaction $transaction,
        string $status,
        string $statusCode = '200',
        string $grossAmount = '10000.00',
    ): array {
        return [
            'order_id' => $transaction->midtrans_order_id,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $this->signature(
                $transaction->midtrans_order_id,
                $statusCode,
                $grossAmount,
            ),
            'transaction_status' => $status,
            'transaction_id' => 'midtrans-tx-1',
            'payment_type' => 'qris',
        ];
    }

    private function signature(string $orderId, string $statusCode, string $grossAmount): string
    {
        return hash(
            'sha512',
            $orderId.$statusCode.$grossAmount.'test-server-key',
        );
    }
}
