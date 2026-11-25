<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionSummaryResource extends JsonResource
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
            'metode_bayar' => $this->metode_bayar,
            'status_bayar' => $this->status_bayar,
            'total' => $this->total,
        ];
    }
}
