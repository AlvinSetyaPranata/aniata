<?php

use App\Http\Controllers\AdminColorController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\StoreOrderController;
use App\Models\Product;
use Illuminate\Support\Facades\Route;

Route::get('/message', function () {
    return response()->json([
        'message' => 'Hello from the Laravel backend!',
        'time' => now()->toDateTimeString(),
    ]);
});

Route::get('/products', function () {
    return Product::all();
});

Route::post('/orders', [StoreOrderController::class, 'store']);

Route::get('/settings', [AdminController::class, 'getSettings']);

Route::post('/admin/login', [AdminController::class, 'login']);

Route::middleware('admin.auth')->group(function () {
    Route::post('/admin/logout', [AdminController::class, 'logout']);
    Route::post('/admin/password', [AdminController::class, 'updatePassword']);
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/settings', [AdminController::class, 'getSettings']);
    Route::put('/admin/settings', [AdminController::class, 'updateSettings']);
    Route::apiResource('admin/products', AdminProductController::class);
    Route::apiResource('admin/colors', AdminColorController::class)->only([
      'index', 'store', 'destroy',
    ]);
});
