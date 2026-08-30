<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;

class StoreOrderController extends Controller
{
    /**
     * Record a checkout as an order. The storefront is account-free, so this
     * is a public endpoint hit when the customer taps "Checkout" (which opens
     * WhatsApp). Records the order, its variant lines, and decreases the
     * stock of each purchased color/size variant. Best-effort from the
     * storefront's point of view — errors are swallowed there so a failure
     * never blocks the WhatsApp flow.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:64'],
            'customer_address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'integer', 'min:0'],
            'items.*.color' => ['nullable', 'string', 'max:255'],
            'items.*.size' => ['nullable', 'string', 'max:64'],
        ]);

        $total = collect($data['items'])->reduce(
            fn ($sum, $item) => $sum + ((int) $item['qty'] * (int) $item['price']),
            0
        );

        $order = Order::create([
            'customer_name' => $data['customer_name'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'customer_address' => $data['customer_address'] ?? null,
            'notes' => $data['notes'] ?? null,
            'total' => $total,
            'status' => 'pending',
        ]);

        foreach ($data['items'] as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'qty' => $item['qty'],
                'price' => $item['price'],
                'color' => $item['color'] ?? null,
                'size' => $item['size'] ?? null,
            ]);

            $this->decrementStock(
                (int) $item['product_id'],
                (string) ($item['color'] ?? ''),
                (string) ($item['size'] ?? ''),
                (int) $item['qty']
            );
        }

        return response()->json([
            'message' => 'Order recorded',
            'order_id' => $order->id,
        ], 201);
    }

    /**
     * Decrease the stock of the exact color/size variant that was checked out,
     * never below zero. No-op when the stock key doesn't exist yet (e.g. a
     * product that still has no stock grid filled in the admin).
     */
    private function decrementStock(int $productId, string $color, string $size, int $qty): void
    {
        $product = Product::find($productId);

        if ($product === null) {
            return;
        }

        $stock = $product->stock ?? [];
        $key = $color.'|'.$size;

        if (! array_key_exists($key, $stock)) {
            return;
        }

        $stock[$key] = max(0, (int) $stock[$key] - $qty);
        $product->stock = $stock;
        $product->save();
    }
}
