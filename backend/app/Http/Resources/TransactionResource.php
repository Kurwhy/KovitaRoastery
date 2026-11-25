<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_transaksi' => $this->kode_transaksi,
            'created_at' => $this->created_at?->toIso8601String(),
            'nama_kasir' => $this->whenLoaded('user', fn () => $this->user->nama),
            'tipe_pesanan' => $this->tipe_pesanan,
            'nomor_meja' => $this->nomor_meja,
            'subtotal' => $this->subtotal,
            'pb1_aktif' => $this->pb1_aktif,
            'pb1_nominal' => $this->pb1_nominal,
            'total' => $this->total,
            'metode_bayar' => $this->metode_bayar,
            'status_bayar' => $this->status_bayar,
            'uang_diterima' => $this->uang_diterima,
            'kembalian' => $this->kembalian,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'menu_item_id' => $item->menu_item_id,
                'nama_menu' => $item->nama_menu_snapshot,
                'harga_satuan' => $item->harga_satuan_snapshot,
                'suhu' => $item->suhu,
                'gula' => $item->takaran_gula,
                'catatan' => $item->catatan,
                'qty' => $item->qty,
                'subtotal_item' => $item->subtotal_item,
                'addons' => $item->addons->map(fn ($addon) => [
                    'id' => $addon->addon_id,
                    'nama' => $addon->nama_snapshot,
                    'harga' => $addon->harga_snapshot,
                ]),
            ])),
        ];
    }
}
