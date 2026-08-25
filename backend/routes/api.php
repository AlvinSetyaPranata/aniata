<?php

use App\Models\Product;
use Illuminate\Http\Request;
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
