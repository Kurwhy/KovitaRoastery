<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'kasir@kovita.test'],
            [
                'nama' => 'Rina Pratiwi',
                'password' => Hash::make('kovita123'),
                'role' => 'kasir',
            ],
        );

        User::updateOrCreate(
            ['email' => 'pemilik@kovita.test'],
            [
                'nama' => 'Bagas Wirawan',
                'password' => Hash::make('kovita123'),
                'role' => 'pemilik',
            ],
        );
    }
}
