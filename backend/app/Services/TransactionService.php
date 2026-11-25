<?php

namespace App\Services;

use App\Exceptions\MenuUnavailableException;
use App\Models\Addon;
use App\Models\MenuItem;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function createCash(array $data, User $user): Transaction
    {
        return $this->create($data, $user, 'tunai', 'paid');
    }

    public function createPendingQris(array $data, User $user): Transaction
    {
        return $this->create($data, $user, 'qris', 'pending');
    }

    private function create(
        array $data,
        User $user,
        string $metodeBayar,
        string $statusBayar,
    ): Transaction {
        return DB::transaction(function () use ($data, $user, $metodeBayar, $statusBayar) {
            $lines = collect($data['items']);
            $menuIds = $lines->pluck('menu_item_id')->unique()->values();
            $menus = MenuItem::query()
                ->whereIn('id', $menuIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $unavailable = $lines
                ->map(function (array $line) use ($menus) {
                    $menu = $menus->get($line['menu_item_id']);

                    if ($menu?->is_habis) {
                        return ['id' => $menu->id, 'nama' => $menu->nama];
                    }

                    return null;
                })
                ->filter()
                ->unique('id')
                ->values()
                ->all();

            if ($unavailable !== []) {
                throw new MenuUnavailableException($unavailable);
            }

            $addonIds = $lines
                ->flatMap(fn (array $line) => $line['addon_ids'] ?? [])
                ->unique()
                ->values();
            $addons = Addon::query()
                ->whereIn('id', $addonIds)
                ->get()
                ->keyBy('id');

            if ($addons->count() !== $addonIds->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Add-on tidak ditemukan.',
                ]);
            }

            $subtotal = 0;
            $preparedItems = [];

            foreach ($lines as $line) {
                $menu = $menus->get($line['menu_item_id']);
                $hasVarian = (bool) $menu->has_varian;

                if ($hasVarian && empty($line['suhu'])) {
                    throw ValidationException::withMessages([
                        'items' => "Suhu wajib dipilih untuk {$menu->nama}.",
                    ]);
                }

                $lineAddons = $hasVarian
                    ? collect($line['addon_ids'] ?? [])
                        ->map(fn ($id) => $addons->get((int) $id))
                        ->filter()
                        ->values()
                    : collect();

                $addonTotal = $lineAddons->sum('harga');
                $hargaSatuan = $menu->harga + $addonTotal;
                $qty = (int) $line['qty'];
                $subtotalItem = $hargaSatuan * $qty;
                $subtotal += $subtotalItem;

                $note = $line['catatan'] ?? null;
                $note = $note !== null ? trim(strip_tags((string) $note)) : null;

                $preparedItems[] = [
                    'menu_item_id' => $menu->id,
                    'nama_menu_snapshot' => $menu->nama,
                    'harga_satuan_snapshot' => $hargaSatuan,
                    'suhu' => $hasVarian ? $line['suhu'] : null,
                    'takaran_gula' => $hasVarian
                        ? ($line['takaran_gula'] ?? 'normal')
                        : null,
                    'catatan' => $note === '' ? null : $note,
                    'qty' => $qty,
                    'subtotal_item' => $subtotalItem,
                    'addons' => $lineAddons,
                ];
            }

            $pb1Nominal = $data['pb1_aktif']
                ? (int) round($subtotal * (float) config('kovita.pb1_rate'))
                : 0;
            $total = $subtotal + $pb1Nominal;
            $isCash = $metodeBayar === 'tunai';

            if ($isCash) {
                $uangDiterima = (int) ($data['uang_diterima'] ?? 0);
                if ($uangDiterima < $total) {
                    throw ValidationException::withMessages([
                        'uang_diterima' => 'Uang diterima kurang dari total transaksi.',
                    ]);
                }
                $kembalian = $uangDiterima - $total;
                $paidAt = now();
            } else {
                $uangDiterima = null;
                $kembalian = null;
                $paidAt = null;
            }

            $kode = $this->nextKodeTransaksi();

            $transaction = Transaction::create([
                'kode_transaksi' => $kode,
                'user_id' => $user->id,
                'tipe_pesanan' => $data['tipe_pesanan'],
                'nomor_meja' => $data['tipe_pesanan'] === 'dine_in'
                    ? (int) $data['nomor_meja']
                    : null,
                'subtotal' => $subtotal,
                'pb1_aktif' => (bool) $data['pb1_aktif'],
                'pb1_nominal' => $pb1Nominal,
                'total' => $total,
                'metode_bayar' => $metodeBayar,
                'status_bayar' => $statusBayar,
                'uang_diterima' => $uangDiterima,
                'kembalian' => $kembalian,
                'midtrans_order_id' => $isCash ? null : $kode,
                'paid_at' => $paidAt,
            ]);

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

            return $transaction->load(['user', 'items.addons']);
        });
    }

    private function nextKodeTransaksi(): string
    {
        $prefix = 'KOV-'.now()->format('Ymd').'-';
        $last = Transaction::query()
            ->where('kode_transaksi', 'like', $prefix.'%')
            ->orderByDesc('kode_transaksi')
            ->lockForUpdate()
            ->first();

        $sequence = $last
            ? ((int) substr($last->kode_transaksi, strlen($prefix))) + 1
            : 1;

        return $prefix.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);
    }
}
