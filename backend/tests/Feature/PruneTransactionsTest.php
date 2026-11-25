<?php

namespace Tests\Feature;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\Console\Command\Command;
use Tests\TestCase;

class PruneTransactionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_transactions_older_than_two_months_are_deleted(): void
    {
        $user = User::factory()->create();
        $old = $this->transaction($user, 'KOV-OLD-000001', now()->subMonthsNoOverflow(2)->subDay());
        $recent = $this->transaction($user, 'KOV-RECENT-000001', now()->subMonth());

        $this->artisan('transactions:prune')
            ->assertExitCode(Command::SUCCESS);

        $this->assertDatabaseMissing('transactions', ['id' => $old->id]);
        $this->assertDatabaseHas('transactions', ['id' => $recent->id]);
    }

    private function transaction(User $user, string $code, \DateTimeInterface $createdAt): Transaction
    {
        $transaction = new Transaction;
        $transaction->fill([
            'kode_transaksi' => $code,
            'user_id' => $user->id,
            'tipe_pesanan' => 'takeaway',
            'nomor_meja' => null,
            'subtotal' => 10000,
            'pb1_aktif' => false,
            'pb1_nominal' => 0,
            'total' => 10000,
            'metode_bayar' => 'tunai',
            'status_bayar' => 'paid',
            'uang_diterima' => 10000,
            'kembalian' => 0,
            'paid_at' => $createdAt,
        ]);
        $transaction->created_at = $createdAt;
        $transaction->updated_at = $createdAt;
        $transaction->save();

        return $transaction;
    }
}
