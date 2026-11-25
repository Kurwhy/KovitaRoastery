<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'nama' => 'Kopi Susu Gula Aren',
                'kategori' => 'kopi',
                'harga' => 22000,
                'foto_url' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Americano',
                'kategori' => 'kopi',
                'harga' => 18000,
                'foto_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Kopi Kovita Signature',
                'kategori' => 'kopi',
                'harga' => 24000,
                'foto_url' => 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => true,
            ],
            [
                'nama' => 'Matcha Latte',
                'kategori' => 'non_kopi',
                'harga' => 25000,
                'foto_url' => 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Cokelat Pandan',
                'kategori' => 'non_kopi',
                'harga' => 20000,
                'foto_url' => 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Lemon Tea',
                'kategori' => 'non_kopi',
                'harga' => 16000,
                'foto_url' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Nasi Ayam Geprek Keju',
                'kategori' => 'makanan',
                'harga' => 28000,
                'foto_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Roti Bakar Cokelat Keju',
                'kategori' => 'makanan',
                'harga' => 18000,
                'foto_url' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => true,
            ],
            [
                'nama' => 'Kentang Goreng',
                'kategori' => 'camilan',
                'harga' => 15000,
                'foto_url' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Pisang Coklat Crispy',
                'kategori' => 'camilan',
                'harga' => 12000,
                'foto_url' => 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Mie Goreng Jawa',
                'kategori' => 'makanan',
                'harga' => 26000,
                'foto_url' => 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Croissant Butter',
                'kategori' => 'camilan',
                'harga' => 18000,
                'foto_url' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Cappuccino',
                'kategori' => 'kopi',
                'harga' => 24000,
                'foto_url' => 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Kopi Tubruk',
                'kategori' => 'kopi',
                'harga' => 15000,
                'foto_url' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Es Kopi Pandan',
                'kategori' => 'kopi',
                'harga' => 23000,
                'foto_url' => 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Thai Tea',
                'kategori' => 'non_kopi',
                'harga' => 21000,
                'foto_url' => 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Strawberry Mojito',
                'kategori' => 'non_kopi',
                'harga' => 24000,
                'foto_url' => 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Susu Vanila',
                'kategori' => 'non_kopi',
                'harga' => 18000,
                'foto_url' => 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => true,
                'is_habis' => false,
            ],
            [
                'nama' => 'Indomie Telur Kornet',
                'kategori' => 'makanan',
                'harga' => 22000,
                'foto_url' => 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Sandwich Ayam Panggang',
                'kategori' => 'makanan',
                'harga' => 26000,
                'foto_url' => 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Nasi Goreng Kampung',
                'kategori' => 'makanan',
                'harga' => 27000,
                'foto_url' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Donat Gula Aren',
                'kategori' => 'camilan',
                'harga' => 14000,
                'foto_url' => 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Risoles Mayo',
                'kategori' => 'camilan',
                'harga' => 13000,
                'foto_url' => 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
            [
                'nama' => 'Churros Cokelat',
                'kategori' => 'camilan',
                'harga' => 17000,
                'foto_url' => 'https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&w=600&h=450&q=75',
                'has_varian' => false,
                'is_habis' => false,
            ],
        ];

        foreach ($items as $item) {
            MenuItem::updateOrCreate(['nama' => $item['nama']], $item);
        }
    }
}
