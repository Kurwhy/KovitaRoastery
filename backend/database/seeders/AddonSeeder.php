<?php

namespace Database\Seeders;

use App\Models\Addon;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    public function run(): void
    {
        $addons = [
            ['kode' => 'extra_shot', 'nama' => 'Extra Shot', 'harga' => 5000],
            ['kode' => 'oat_milk', 'nama' => 'Oat Milk', 'harga' => 8000],
            ['kode' => 'boba', 'nama' => 'Boba', 'harga' => 6000],
        ];

        foreach ($addons as $addon) {
            Addon::updateOrCreate(['kode' => $addon['kode']], $addon);
        }
    }
}
