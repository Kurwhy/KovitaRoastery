<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'kode',
        'nama',
        'harga',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'integer',
        ];
    }
}
