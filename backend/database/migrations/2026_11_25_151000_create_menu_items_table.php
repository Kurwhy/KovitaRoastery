<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 60);
            $table->enum('kategori', ['kopi', 'non_kopi', 'makanan', 'camilan']);
            $table->unsignedInteger('harga');
            $table->string('foto_url', 255)->nullable();
            $table->boolean('has_varian')->default(false);
            $table->boolean('is_habis')->default(false);
            $table->timestamps();

            $table->index('kategori', 'idx_menu_kategori');
            $table->index('is_habis', 'idx_menu_habis');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
