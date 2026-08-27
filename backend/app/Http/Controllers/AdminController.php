<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

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

        $unitsByProduct = OrderItem::query()
            ->selectRaw('product_id, SUM(qty) as units')
            ->groupBy('product_id')
            ->pluck('units', 'product_id');

        $topCheckedOut = Product::orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($product) use ($unitsByProduct) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'units' => (int) ($unitsByProduct[$product->id] ?? 0),
                ];
            })
            ->sortByDesc('units')
            ->values()
            ->take(10);

        $totalUnitsCheckedOut = $topCheckedOut->sum('units');

        return response()->json([
            'total_products' => $totalProducts,
            'on_sale' => $onSale,
            'total_stock' => $totalStock,
            'out_of_stock_variants' => $outOfStock,
            'price_min' => $products->min('price'),
            'price_max' => $products->max('price'),
            'price_avg' => $products->avg('price'),
            'inventory_value' => $inventoryValue,
            'total_units_checked_out' => $totalUnitsCheckedOut,
            'top_checked_out' => $topCheckedOut,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password saat ini salah.'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password diperbarui.']);
    }

    public function getSettings()
    {
        return StoreSetting::firstOrNew([]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'cs_wa' => ['nullable', 'string', 'max:64'],
            'cashier_wa' => ['nullable', 'string', 'max:64'],
        ]);

        $settings = StoreSetting::firstOrNew([]);
        $settings->fill($data);
        $settings->save();

        return response()->json($settings);
    }
}
