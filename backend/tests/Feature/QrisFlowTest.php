<?php

namespace Tests\Feature;

use App\Models\MenuItem;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery\MockInterface;
use Tests\TestCase;

class QrisFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_qris_charge_requires_midtrans_configuration(): void
    {
        config()->set('midtrans.server_key', '');
        $user = User::factory()->create();
        $menu = $this->menu();
        Sanctum::actingAs($user);

        $this->postJson('/api/transaksi', $this->payload($menu))
            ->assertStatus(503);

        $this->assertDatabaseCount('transactions', 0);
    }

    public function test_qris_charge_creates_pending_transaction_and_returns_qr_data(): void
    {
        $user = User::factory()->create();
        $menu = $this->menu();
        Sanctum::actingAs($user);

        $this->partialMock(MidtransService::class, function (MockInterface $mock) {
            $mock->shouldReceive('isConfigured')->once()->andReturnTrue();
            $mock->shouldReceive('chargeQris')->once()->andReturn((object) [
                'status_code' => '201',
                'transaction_status' => 'pending',
                'transaction_id' => 'midtrans-tx-qris-1',
                'payment_type' => 'qris',
                'actions' => [
                    (object) [
                        'name' => 'generate-qr-code',
                        'url' => 'https://example.test/qr.png',
                    ],
                ],
            ]);
        });

        $response = $this->postJson('/api/transaksi', $this->payload($menu))
            ->assertCreated()
            ->assertJsonPath('data.status_bayar', 'pending')
            ->assertJsonPath('data.metode_bayar', 'qris')
            ->assertJsonPath('data.total', 11000)
            ->assertJsonPath('qris.qr_code_url', 'https://example.test/qr.png');

        $transaction = Transaction::query()->firstOrFail();
        $this->assertSame('pending', $transaction->status_bayar);
        $this->assertSame('pending', $transaction->midtrans_status);
        $this->assertSame('midtrans-tx-qris-1', $transaction->midtrans_transaction_id);
        $this->assertSame($transaction->kode_transaksi, $transaction->midtrans_order_id);
        $this->assertNotNull($response->json('data.kode_transaksi'));
    }

    public function test_status_endpoint_updates_pending_transaction_from_midtrans(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $transaction = $this->pendingTransaction($user);

        $this->partialMock(MidtransService::class, function (MockInterface $mock) {
            $mock->shouldReceive('isConfigured')->once()->andReturnTrue();
            $mock->shouldReceive('fetchStatus')->once()->andReturn((object) [
                'transaction_status' => 'settlement',
                'transaction_id' => 'midtrans-tx-poll-1',
                'payment_type' => 'qris',
            ]);
        });

        $this->getJson("/api/transaksi/{$transaction->id}/status")
            ->assertOk()
            ->assertJsonPath('data.status_bayar', 'paid');

        $transaction->refresh();
        $this->assertSame('paid', $transaction->status_bayar);
        $this->assertSame('settlement', $transaction->midtrans_status);
        $this->assertNotNull($transaction->paid_at);
    }

    private function menu(): MenuItem
    {
        return MenuItem::create([
            'nama' => 'Croissant Butter',
            'kategori' => 'camilan',
            'harga' => 10000,
            'foto_url' => null,
            'has_varian' => false,
            'is_habis' => false,
        ]);
    }

    private function payload(MenuItem $menu): array
    {
        return [
            'tipe_pesanan' => 'takeaway',
            'nomor_meja' => null,
            'pb1_aktif' => true,
            'metode_bayar' => 'qris',
            'items' => [
                [
                    'menu_item_id' => $menu->id,
                    'suhu' => null,
                    'takaran_gula' => null,
                    'catatan' => null,
                    'qty' => 1,
                    'addon_ids' => [],
                ],
            ],
        ];
    }

    private function pendingTransaction(User $user): Transaction
    {
        return Transaction::create([
            'kode_transaksi' => 'KOV-20261125-000010',
            'user_id' => $user->id,
            'tipe_pesanan' => 'takeaway',
            'nomor_meja' => null,
            'subtotal' => 10000,
            'pb1_aktif' => false,
            'pb1_nominal' => 0,
            'total' => 10000,
            'metode_bayar' => 'qris',
            'status_bayar' => 'pending',
            'midtrans_order_id' => 'KOV-20261125-000010',
        ]);
    }
}
