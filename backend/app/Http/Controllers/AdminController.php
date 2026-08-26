<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('admin')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => ['name' => $user->name, 'email' => $user->email],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function stats()
    {
        $products = Product::all();

        $totalProducts = $products->count();
        $onSale = $products->where('discount', '>', 0)->count();

        $totalStock = 0;
        $outOfStock = 0;
        foreach ($products as $product) {
            foreach (($product->stock ?? []) as $qty) {
                $qty = (int) $qty;
                $totalStock += $qty;
                if ($qty <= 0) {
                    $outOfStock++;
                }
            }
        }

        $inventoryValue = 0;
        foreach ($products as $product) {
            $inventoryValue += $product->price * array_sum(array_map('intval', $product->stock ?? []));
        }

        return response()->json([
            'total_products' => $totalProducts,
            'on_sale' => $onSale,
            'total_stock' => $totalStock,
            'out_of_stock_variants' => $outOfStock,
            'price_min' => $products->min('price'),
            'price_max' => $products->max('price'),
            'price_avg' => $products->avg('price'),
            'inventory_value' => $inventoryValue,
        ]);
    }
}
