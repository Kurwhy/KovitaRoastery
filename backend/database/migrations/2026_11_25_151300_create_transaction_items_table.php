<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedBigInteger('menu_item_id');
            $table->string('nama_menu_snapshot', 60);
            $table->unsignedInteger('harga_satuan_snapshot');
            $table->enum('suhu', ['hot', 'ice'])->nullable();
            $table->enum('takaran_gula', ['normal', 'kurang', 'tanpa'])->nullable();
            $table->string('catatan', 150)->nullable();
            $table->unsignedTinyInteger('qty');
            $table->unsignedInteger('subtotal_item');

            $table->foreign('transaction_id', 'fk_items_transaction')
                ->references('id')
                ->on('transactions')
                ->cascadeOnDelete();
            $table->foreign('menu_item_id', 'fk_items_menu')
                ->references('id')
                ->on('menu_items');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
    }
};
