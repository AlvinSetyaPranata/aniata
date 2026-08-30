<?php

namespace App\Http\Controllers;

use App\Models\Color;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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
        $data = $this->validated($request, null);
        $this->applyFiles($request, $data);
        $this->transformColorImages($data);
        $data['slug'] = $this->uniqueSlug(
            Arr::get($data, 'slug') ?: $data['name']
        );

        $product = Product::create($data);
        $this->syncColors($data);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return $product;
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product);
        $this->applyFiles($request, $data);
        $this->transformColorImages($data);

        if (Arr::has($data, 'slug') && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);
        $this->syncColors($data);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Deleted'], 200);
    }

    /**
     * Pull uploaded files into stored /storage paths and drop the raw
     * UploadedFile entries so they don't get written to the model.
     */
    private function syncColors(array $data): void
    {
        foreach (($data['colors'] ?? []) as $color) {
            $name = trim((string) (Arr::get($color, 'name') ?? ''));
            if ($name !== '') {
                Color::firstOrCreate(['name' => $name]);
            }
        }
    }

    /**
     * Resolve each color's images: keep any existing URLs the client wants to
     * preserve, store any newly uploaded files, and merge them into a single
     * `images` array. Existing + new URLs end up as `/storage/...` paths.
     */
    private function transformColorImages(array &$data): void
    {
        if (empty($data['colors'])) {
            return;
        }

        foreach ($data['colors'] as &$color) {
            $existing = Arr::get($color, 'existing_images', []) ?? [];
            $uploaded = [];

            foreach (Arr::get($color, 'images', []) ?? [] as $file) {
                if ($file instanceof \Illuminate\Http\UploadedFile) {
                    $uploaded[] = '/storage/'.$file->store('products', 'public');
                }
            }

            $color['images'] = array_merge(array_values($existing), $uploaded);
            unset($color['existing_images']);
        }
    }

    private function applyFiles(Request $request, array &$data): void
    {
        if ($request->hasFile('image')) {
            $data['image'] = '/storage/'.$request->file('image')->store('products', 'public');
        } else {
            unset($data['image']);
        }

        if ($request->hasFile('images')) {
            $data['images'] = array_map(
                fn ($file) => '/storage/'.$file->store('products', 'public'),
                $request->file('images')
            );
        } else {
            unset($data['images']);
        }
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'blurb' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'accent' => ['nullable', 'string', 'max:32'],
            'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
            'colors' => ['nullable', 'array'],
            'colors.*.name' => ['nullable', 'string', 'max:255'],
            'colors.*.hex' => ['nullable', 'string', 'max:32'],
            'colors.*.sizes' => ['nullable', 'array'],
            'colors.*.sizes.*' => ['nullable', 'string', 'max:32'],
            'colors.*.existing_images' => ['nullable', 'array'],
            'colors.*.existing_images.*' => ['nullable', 'string'],
            'colors.*.images' => ['nullable', 'array'],
            'colors.*.images.*' => ['nullable', 'file', 'image', 'max:5120'],
            'sizes' => ['nullable', 'array'],
            'sizes.*' => ['nullable', 'string', 'max:32'],
            'stock' => ['nullable', 'array'],
            'stock.*' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'file', 'image', 'max:5120'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $hasNew = $request->hasFile('image')
            || collect($request->file('images') ?? [])->filter()->isNotEmpty()
            || collect($request->file('colors') ?? [])->flatten()->filter()->isNotEmpty();

        $kept = $product && $this->productHasImage($product);

        if (! $hasNew && ! $kept) {
            throw ValidationException::withMessages([
                'image' => 'Setiap produk harus memiliki minimal 1 gambar.',
            ]);
        }

        return $data;
    }

    /**
     * Whether the stored product already carries at least one image, across the
     * main image, the gallery, or any color variant gallery.
     */
    private function productHasImage(Product $product): bool
    {
        if ($product->image) {
            return true;
        }
        if (! empty($product->images)) {
            return true;
        }
        foreach (($product->colors ?? []) as $color) {
            if (! empty($color['images'])) {
                return true;
            }
        }
        return false;
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
