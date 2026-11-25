<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\MenuItem;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->where('role', 'kasir')->first()
            ?? User::query()->first();

        $menus = MenuItem::query()
            ->where('is_habis', false)
            ->get();

        $addons = Addon::query()->get();

        if (! $user || $menus->isEmpty()) {
            return;
        }

        $today = now()->startOfDay();
        $start = now()->subMonthsNoOverflow(2)->startOfDay();
        $cursor = $start->copy();
        $createdDays = 0;
        $createdTransactions = 0;

        while ($cursor->lte($today)) {
            $day = $cursor->copy();

            if (Transaction::query()->whereDate('created_at', $day->toDateString())->exists()) {
                $cursor->addDay();

                continue;
            }

            $isToday = $day->isSameDay($today);

            if ($isToday) {
                $startTime = $day->copy()->addMinutes(5);
                $endTime = now()->subMinute();

                if ($startTime->greaterThanOrEqualTo($endTime)) {
                    $startTime = $endTime->copy()->subMinutes(15);
                }

                if ($startTime->lessThan($day)) {
                    $startTime = $day->copy();
                }

                $statuses = array_merge(
                    array_fill(0, 34, 'paid'),
                    array_fill(0, 3, 'pending'),
                    array_fill(0, 3, 'failed'),
                );
                shuffle($statuses);
            } else {
                $startTime = $day->copy()->setTime(8, 0);
                $endTime = $day->copy()->setTime(21, 30);
                $statuses = array_fill(0, random_int(14, 22), 'paid');
            }

            $created = $this->seedDay(
                $day,
                $startTime,
                $endTime,
                $statuses,
                $user,
                $menus,
                $addons,
            );

            $createdDays++;
            $createdTransactions += $created;
            $cursor->addDay();
        }

        $this->command?->info(
            "DemoTransactionSeeder: {$createdTransactions} transaksi pada {$createdDays} hari dibuat.",
        );
    }

    private function seedDay(
        $day,
        $startTime,
        $endTime,
        array $statuses,
        User $user,
        $menus,
        $addons,
    ): int {
        return DB::transaction(function () use (
            $day,
            $startTime,
            $endTime,
            $statuses,
            $user,
            $menus,
            $addons,
        ) {
            $count = count($statuses);
            $span = max(1, $startTime->diffInSeconds($endTime));
            $codeDate = $day->format('Ymd');
            $now = now();
            $tables = [3, 4, 6, 7, 9, 12, 15];
            $notes = ['Kurangi es sedikit', 'Tanpa sedotan', 'Gula terpisah', 'Es terpisah'];
            $created = 0;

            foreach ($statuses as $index => $status) {
                $createdAt = $startTime->copy()->addSeconds(
                    (int) round($span * $index / max(1, $count - 1)),
                );
                $kode = 'KOV-'.$codeDate.'-'.str_pad((string) ($index + 1), 6, '0', STR_PAD_LEFT);
                $isDineIn = random_int(1, 10) <= 6;
                $selectedMenus = $menus->shuffle()->take(random_int(1, 3));
                $subtotal = 0;
                $preparedItems = [];

                foreach ($selectedMenus as $menu) {
                    $qty = random_int(1, 10) <= 8 ? 1 : 2;
                    $chosenAddons = collect();

                    if ($menu->has_varian && $addons->isNotEmpty() && random_int(1, 10) <= 4) {
                        $chosenAddons = $addons->shuffle()->take(random_int(1, min(2, $addons->count())));
                    }

                    $unitPrice = $menu->harga + $chosenAddons->sum('harga');
                    $itemSubtotal = $unitPrice * $qty;
                    $subtotal += $itemSubtotal;

                    $preparedItems[] = [
                        'menu_item_id' => $menu->id,
                        'nama_menu_snapshot' => $menu->nama,
                        'harga_satuan_snapshot' => $unitPrice,
                        'suhu' => $menu->has_varian
                            ? (random_int(0, 1) === 1 ? 'hot' : 'ice')
                            : null,
                        'takaran_gula' => $menu->has_varian
                            ? ['normal', 'normal', 'kurang', 'tanpa'][random_int(0, 3)]
                            : null,
                        'catatan' => random_int(1, 10) <= 2
                            ? $notes[array_rand($notes)]
                            : null,
                        'qty' => $qty,
                        'subtotal_item' => $itemSubtotal,
                        'addons' => $chosenAddons,
                    ];
                }

                $pb1Aktif = random_int(1, 10) <= 9;
                $pb1Nominal = $pb1Aktif
                    ? (int) round($subtotal * (float) config('kovita.pb1_rate'))
                    : 0;
                $total = $subtotal + $pb1Nominal;
                $method = $status === 'paid'
                    ? (random_int(0, 1) === 1 ? 'tunai' : 'qris')
                    : 'qris';

                $uangDiterima = null;
                $kembalian = null;
                $paidAt = null;
                $midtransOrderId = null;
                $midtransTransactionId = null;
                $midtransPaymentType = null;
                $midtransStatus = null;

                if ($method === 'tunai') {
                    $uangDiterima = (int) (ceil($total / 10000) * 10000);
                    if (random_int(1, 10) <= 3) {
                        $uangDiterima += 10000;
                    }
                    $kembalian = $uangDiterima - $total;
                    $paidAt = $createdAt->copy()->addSeconds(random_int(10, 90));
                } else {
                    $midtransOrderId = $kode;
                    $midtransTransactionId = 'demo-'.$kode;
                    $midtransPaymentType = 'qris';
                    $midtransStatus = match ($status) {
                        'paid' => 'settlement',
                        'pending' => 'pending',
                        default => random_int(0, 1) === 1 ? 'expire' : 'deny',
                    };

                    if ($status === 'paid') {
                        $paidAt = $createdAt->copy()->addSeconds(random_int(20, 180));
                    }
                }

                if ($paidAt && $paidAt->greaterThan($now)) {
                    $paidAt = $now->copy();
                }

                $transaction = new Transaction;
                $transaction->fill([
                    'kode_transaksi' => $kode,
                    'user_id' => $user->id,
                    'tipe_pesanan' => $isDineIn ? 'dine_in' : 'takeaway',
                    'nomor_meja' => $isDineIn ? $tables[array_rand($tables)] : null,
                    'subtotal' => $subtotal,
                    'pb1_aktif' => $pb1Aktif,
                    'pb1_nominal' => $pb1Nominal,
                    'total' => $total,
                    'metode_bayar' => $method,
                    'status_bayar' => $status,
                    'uang_diterima' => $uangDiterima,
                    'kembalian' => $kembalian,
                    'midtrans_order_id' => $midtransOrderId,
                    'midtrans_transaction_id' => $midtransTransactionId,
                    'midtrans_payment_type' => $midtransPaymentType,
                    'midtrans_status' => $midtransStatus,
                    'paid_at' => $paidAt,
                ]);
                $transaction->created_at = $createdAt;
                $transaction->updated_at = $createdAt;
                $transaction->save();

                foreach ($preparedItems as $preparedItem) {
                    $item = $transaction->items()->create([
                        'menu_item_id' => $preparedItem['menu_item_id'],
                        'nama_menu_snapshot' => $preparedItem['nama_menu_snapshot'],
                        'harga_satuan_snapshot' => $preparedItem['harga_satuan_snapshot'],
                        'suhu' => $preparedItem['suhu'],
                        'takaran_gula' => $preparedItem['takaran_gula'],
                        'catatan' => $preparedItem['catatan'],
                        'qty' => $preparedItem['qty'],
                        'subtotal_item' => $preparedItem['subtotal_item'],
                    ]);

                    foreach ($preparedItem['addons'] as $addon) {
                        $item->addons()->create([
                            'addon_id' => $addon->id,
                            'nama_snapshot' => $addon->nama,
                            'harga_snapshot' => $addon->harga,
                        ]);
                    }
                }

                $created++;
            }

            return $created;
        });
    }
}
