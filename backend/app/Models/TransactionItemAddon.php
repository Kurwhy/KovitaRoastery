<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionItemAddon extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'transaction_item_id',
        'addon_id',
        'nama_snapshot',
        'harga_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'harga_snapshot' => 'integer',
        ];
    }

    public function transactionItem(): BelongsTo
    {
        return $this->belongsTo(TransactionItem::class);
    }

    public function addon(): BelongsTo
    {
        return $this->belongsTo(Addon::class);
    }
}
