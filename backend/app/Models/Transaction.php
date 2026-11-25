<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'kode_transaksi',
        'user_id',
        'tipe_pesanan',
        'nomor_meja',
        'subtotal',
        'pb1_aktif',
        'pb1_nominal',
        'total',
        'metode_bayar',
        'status_bayar',
        'uang_diterima',
        'kembalian',
        'midtrans_order_id',
        'midtrans_transaction_id',
        'midtrans_payment_type',
        'midtrans_status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'nomor_meja' => 'integer',
            'subtotal' => 'integer',
            'pb1_aktif' => 'boolean',
            'pb1_nominal' => 'integer',
            'total' => 'integer',
            'uang_diterima' => 'integer',
            'kembalian' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }
}
