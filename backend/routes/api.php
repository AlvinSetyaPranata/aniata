<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminProductController;
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

Route::post('/admin/login', [AdminController::class, 'login']);

Route::middleware('admin.auth')->group(function () {
    Route::post('/admin/logout', [AdminController::class, 'logout']);
    Route::apiResource('admin/products', AdminProductController::class);
});
