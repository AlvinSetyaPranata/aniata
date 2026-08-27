<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class StoreOrderController extends Controller
{
    /**
     * Record a checkout as an order. The storefront is account-free, so this
     * is a public endpoint hit when the customer taps "Checkout" (which opens
     * WhatsApp). Best-effort analytics only — it never blocks the WhatsApp flow.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:64'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'integer', 'min:0'],
        ]);

        $total = collect($data['items'])->reduce(
            fn ($sum, $item) => $sum + ((int) $item['qty'] * (int) $item['price']),
            0
        );

        $order = Order::create([
            'customer_name' => $data['customer_name'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'notes' => $data['notes'] ?? null,
            'total' => $total,
            'status' => 'pending',
        ]);

        foreach ($data['items'] as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'price' => $item['price'],
            ]);
        }

        return response()->json([
            'message' => 'Order recorded',
            'order_id' => $order->id,
        ], 201);
    }
}
