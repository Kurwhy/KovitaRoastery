<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_item_addons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaction_item_id');
            $table->unsignedBigInteger('addon_id');
            $table->string('nama_snapshot', 60);
            $table->unsignedInteger('harga_snapshot');

            $table->foreign('transaction_item_id', 'fk_item_addons_item')
                ->references('id')
                ->on('transaction_items')
                ->cascadeOnDelete();
            $table->foreign('addon_id', 'fk_item_addons_addon')
                ->references('id')
                ->on('addons');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_item_addons');
    }
};
