<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['name' => 'Stoneware Mug', 'slug' => 'stoneware-mug', 'price' => 145000, 'blurb' => 'Hand-thrown, unglazed rim. Holds heat longer than it should.', 'accent' => '#C8553D'],
            ['name' => 'Washed Linen Tote', 'slug' => 'washed-linen-tote', 'price' => 189000, 'blurb' => 'One seam, no lining. Softens with every carry.', 'accent' => '#3D5A80'],
            ['name' => 'Solid Brass Pen', 'slug' => 'solid-brass-pen', 'price' => 220000, 'blurb' => 'Machined from a single rod. Ages to a deep patina.', 'accent' => '#A68A56'],
            ['name' => 'Pine Tar Soap', 'slug' => 'pine-tar-soap', 'price' => 58000, 'blurb' => 'Cold-pressed, three ingredients, no fragrance added.', 'accent' => '#4A5742'],
            ['name' => 'Undyed Wool Throw', 'slug' => 'undyed-wool-throw', 'price' => 410000, 'blurb' => 'Loomed from one fleece. Weight you can feel.', 'accent' => '#8C7A6B'],
            ['name' => 'Oak Serving Tray', 'slug' => 'oak-serving-tray', 'price' => 275000, 'blurb' => 'Oil-finished, finger joints. For the slow mornings.', 'accent' => '#9C6B3F'],
            ['name' => 'Mouth-blown Jar', 'slug' => 'mouth-blown-jar', 'price' => 96000, 'blurb' => 'Slight wobble is the point. No two are alike.', 'accent' => '#5C7A89'],
            ['name' => 'Heavy Cotton Apron', 'slug' => 'heavy-cotton-apron', 'price' => 165000, 'blurb' => 'Cross-back straps, deep pocket. Made to be stained.', 'accent' => '#7A4B52'],
        ];

        foreach ($items as $item) {
            $image = 'https://picsum.photos/seed/' . $item['slug'] . '/600/800';
            \App\Models\Product::updateOrCreate(
                ['slug' => $item['slug']],
                array_merge($item, ['image' => $image])
            );
        }
    }
}
