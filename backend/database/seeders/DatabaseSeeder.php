<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $seeders = [
            UserSeeder::class,
            AddonSeeder::class,
            MenuSeeder::class,
        ];

        if (app()->environment('local')) {
            $seeders[] = DemoTransactionSeeder::class;
        }

        $this->call($seeders);
    }
}
