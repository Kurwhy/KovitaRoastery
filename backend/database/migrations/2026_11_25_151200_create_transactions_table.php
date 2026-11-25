<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi', 30)->unique();
            $table->unsignedBigInteger('user_id');
            $table->enum('tipe_pesanan', ['dine_in', 'takeaway']);
            $table->unsignedTinyInteger('nomor_meja')->nullable();
            $table->unsignedInteger('subtotal');
            $table->boolean('pb1_aktif')->default(true);
            $table->unsignedInteger('pb1_nominal')->default(0);
            $table->unsignedInteger('total');
            $table->enum('metode_bayar', ['tunai', 'qris']);
            $table->enum('status_bayar', ['pending', 'paid', 'failed']);
            $table->unsignedInteger('uang_diterima')->nullable();
            $table->unsignedInteger('kembalian')->nullable();
            $table->string('midtrans_order_id', 50)->nullable()->unique();
            $table->string('midtrans_transaction_id', 100)->nullable();
            $table->string('midtrans_payment_type', 30)->nullable();
            $table->string('midtrans_status', 30)->nullable();
            $table->dateTime('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id', 'fk_transactions_user')
                ->references('id')
                ->on('users');
            $table->index(['status_bayar', 'paid_at'], 'idx_transactions_status_paid');
            $table->index('created_at', 'idx_transactions_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
