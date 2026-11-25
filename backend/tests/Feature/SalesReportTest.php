<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SalesReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_view_daily_report_with_all_transaction_statuses(): void
    {
        $owner = User::factory()->create(['role' => 'pemilik']);
        $date = now()->startOfDay();
        $this->transaction($owner, 'paid', 'tunai', 10000, $date->copy()->setTime(9, 0));
        $this->transaction($owner, 'paid', 'qris', 20000, $date->copy()->setTime(10, 0));
        $this->transaction($owner, 'pending', 'qris', 5000, $date->copy()->setTime(11, 0));
        Sanctum::actingAs($owner);

        $this->getJson(
            '/api/laporan/penjualan?periode=harian&tanggal='.$date->toDateString(),
        )
            ->assertOk()
            ->assertJsonPath('periode', 'harian')
            ->assertJsonPath('ringkasan.total_omzet', 30000)
            ->assertJsonPath('ringkasan.jumlah_transaksi', 2)
            ->assertJsonPath('ringkasan.total_tunai', 10000)
            ->assertJsonPath('ringkasan.total_qris', 20000)
            ->assertJsonCount(3, 'transaksi');
    }

    public function test_owner_can_view_monthly_daily_breakdown(): void
    {
        $owner = User::factory()->create(['role' => 'pemilik']);
        $month = now()->startOfMonth();
        $this->transaction($owner, 'paid', 'tunai', 15000, $month->copy()->addDay()->setTime(10, 0));
        $this->transaction($owner, 'paid', 'qris', 25000, $month->copy()->addDays(2)->setTime(10, 0));
        $this->transaction($owner, 'failed', 'qris', 9000, $month->copy()->addDays(2)->setTime(11, 0));
        Sanctum::actingAs($owner);

        $this->getJson(
            '/api/laporan/penjualan?periode=bulanan&bulan='.$month->format('Y-m'),
        )
            ->assertOk()
            ->assertJsonPath('periode', 'bulanan')
            ->assertJsonPath('ringkasan.total_omzet', 40000)
            ->assertJsonPath('ringkasan.jumlah_transaksi', 2)
            ->assertJsonCount(2, 'harian')
            ->assertJsonPath('harian.0.tanggal', $month->copy()->addDay()->toDateString())
            ->assertJsonPath('harian.0.total_omzet', 15000)
            ->assertJsonPath('harian.1.total_omzet', 25000)
            ->assertJsonCount(0, 'transaksi');
    }

    public function test_kasir_cannot_view_sales_report(): void
    {
        $kasir = User::factory()->create(['role' => 'kasir']);
        Sanctum::actingAs($kasir);

        $this->getJson(
            '/api/laporan/penjualan?periode=harian&tanggal='.now()->toDateString(),
        )->assertForbidden();
    }

    public function test_report_rejects_date_older_than_two_months(): void
    {
        $owner = User::factory()->create(['role' => 'pemilik']);
        Sanctum::actingAs($owner);
        $oldDate = now()->subMonthsNoOverflow(3)->toDateString();

        $this->getJson(
            '/api/laporan/penjualan?periode=harian&tanggal='.$oldDate,
        )->assertStatus(422);
    }

    private function transaction(
        User $user,
        string $status,
        string $method,
        int $total,
        Carbon $createdAt,
    ): Transaction {
        $transaction = new Transaction;
        $transaction->fill([
            'kode_transaksi' => 'KOV-'.$createdAt->format('YmdHis'),
            'user_id' => $user->id,
            'tipe_pesanan' => 'takeaway',
            'nomor_meja' => null,
            'subtotal' => $total,
            'pb1_aktif' => false,
            'pb1_nominal' => 0,
            'total' => $total,
            'metode_bayar' => $method,
            'status_bayar' => $status,
            'uang_diterima' => $method === 'tunai' ? $total : null,
            'kembalian' => $method === 'tunai' ? 0 : null,
            'paid_at' => $status === 'paid' ? $createdAt->copy() : null,
            'midtrans_order_id' => $method === 'qris' ? 'KOV-'.$createdAt->format('YmdHis') : null,
        ]);
        $transaction->created_at = $createdAt;
        $transaction->updated_at = $createdAt;
        $transaction->save();

        return $transaction;
    }
}
