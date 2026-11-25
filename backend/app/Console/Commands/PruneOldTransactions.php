<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;

class PruneOldTransactions extends Command
{
    protected $signature = 'transactions:prune';

    protected $description = 'Hapus transaksi yang lebih lama dari 2 bulan';

    public function handle(): int
    {
        $cutoff = now()->subMonthsNoOverflow(2)->startOfDay();
        $deleted = Transaction::query()
            ->where('created_at', '<', $cutoff)
            ->delete();

        $this->info(
            "Transaksi sebelum {$cutoff->toDateString()} dihapus: {$deleted}.",
        );

        return self::SUCCESS;
    }
}
