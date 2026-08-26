<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index()
    {
        return Product::orderBy('id')->get();
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug(
            Arr::get($data, 'slug') ?: $data['name']
        );

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return $product;
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request);
        if (Arr::has($data, 'slug') && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'blurb' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'accent' => ['nullable', 'string', 'max:32'],
            'image' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string'],
            'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'colors' => ['nullable', 'array'],
            'sizes' => ['nullable', 'array'],
            'sizes.*' => ['string'],
            'stock' => ['nullable', 'array'],
        ]);
    }

    private function uniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::slug($source);
        $slug = $base;
        $i = 1;

        while (Product::where('slug', $slug)
            ->where('id', '<>', $ignoreId ?? -1)
            ->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
