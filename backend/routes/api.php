<?php

use App\Http\Controllers\Api\AddonController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MidtransController;
use App\Http\Controllers\Api\RecapController;
use App\Http\Controllers\Api\SalesReportController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::post('/midtrans/notification', [MidtransController::class, 'notification']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/menu', [MenuController::class, 'index']);
    Route::get('/addons', [AddonController::class, 'index']);

    Route::post('/transaksi', [TransactionController::class, 'store']);
    Route::get('/transaksi/hari-ini', [TransactionController::class, 'today']);
    Route::get('/transaksi/{transaction}/status', [TransactionController::class, 'status']);

    Route::middleware('role:pemilik')->group(function () {
        Route::get('/rekap/harian', [RecapController::class, 'daily']);
        Route::get('/laporan/penjualan', [SalesReportController::class, 'sales']);

        Route::post('/menu', [MenuController::class, 'store']);
        Route::patch('/menu/{menuItem}', [MenuController::class, 'update']);
        Route::patch('/menu/{menuItem}/status', [MenuController::class, 'updateStatus']);
    });
});
