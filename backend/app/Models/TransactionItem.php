<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'transaction_id',
        'menu_item_id',
        'nama_menu_snapshot',
        'harga_satuan_snapshot',
        'suhu',
        'takaran_gula',
        'catatan',
        'qty',
        'subtotal_item',
    ];

    protected function casts(): array
    {
        return [
            'harga_satuan_snapshot' => 'integer',
            'qty' => 'integer',
            'subtotal_item' => 'integer',
        ];
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(TransactionItemAddon::class);
    }
}
