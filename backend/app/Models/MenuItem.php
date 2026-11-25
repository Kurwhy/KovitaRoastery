<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = [
        'nama',
        'kategori',
        'harga',
        'foto_url',
        'has_varian',
        'is_habis',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'integer',
            'has_varian' => 'boolean',
            'is_habis' => 'boolean',
        ];
    }
}
