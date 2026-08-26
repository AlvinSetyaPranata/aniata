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
            [
                'name' => 'Stoneware Mug',
                'slug' => 'stoneware-mug',
                'price' => 145000,
                'blurb' => 'Hand-thrown, unglazed rim. Holds heat longer than it should.',
                'description' => 'A daily mug thrown on the wheel in small batches, left raw at the lip so the clay warms to the touch. The body is glazed in a matte oatmeal that hides the ring marks of years. Sits balanced in the hand, a little heavier than you expect.',
                'accent' => '#C8553D',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Oat', 'hex' => '#E7DFD2'],
                    ['name' => 'Slate', 'hex' => '#6E7479'],
                    ['name' => 'Clay', 'hex' => '#B5694E'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Oat|One size' => 24,
                    'Slate|One size' => 0,
                    'Clay|One size' => 11,
                ],
            ],
            [
                'name' => 'Washed Linen Tote',
                'slug' => 'washed-linen-tote',
                'price' => 189000,
                'blurb' => 'One seam, no lining. Softens with every carry.',
                'description' => 'Cut from a single length of stonewashed linen and finished with one flat-felled seam, so there is nothing inside to catch. It starts crisp and folds soft within a week of use. Roomy enough for a market run, supple enough to ball up in a coat pocket.',
                'accent' => '#3D5A80',
                'discount' => 20,
                'colors' => [
                    ['name' => 'Natural', 'hex' => '#D8CBB4'],
                    ['name' => 'Indigo', 'hex' => '#2F3C56'],
                    ['name' => 'Rust', 'hex' => '#9C5B3B'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Natural|One size' => 18,
                    'Indigo|One size' => 9,
                    'Rust|One size' => 0,
                ],
            ],
            [
                'name' => 'Solid Brass Pen',
                'slug' => 'solid-brass-pen',
                'price' => 220000,
                'blurb' => 'Machined from a single rod. Ages to a deep patina.',
                'description' => 'Turned from one solid brass rod on a CNC lathe, then left unlacquered so the metal reacts to your hands. The weight anchors the page; the patina is the record of whoever carries it. Refillable with any standard G2 cartridge.',
                'accent' => '#A68A56',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Raw', 'hex' => '#B08D57'],
                    ['name' => 'Patina', 'hex' => '#5E7C6B'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Raw|One size' => 30,
                    'Patina|One size' => 7,
                ],
            ],
            [
                'name' => 'Pine Tar Soap',
                'slug' => 'pine-tar-soap',
                'price' => 58000,
                'blurb' => 'Cold-pressed, three ingredients, no fragrance added.',
                'description' => 'Three ingredients only: pine tar, olive oil, and lye, cured six weeks after the pour. The scent is the forest, not a perfumer’s idea of one. A dense, long-lasting bar that lathers slow and rinses clean. For hands that have been outside.',
                'accent' => '#4A5742',
                'discount' => 15,
                'colors' => [
                    ['name' => 'Unscented', 'hex' => '#8A8F86'],
                ],
                'sizes' => ['Single', 'Triple'],
                'stock' => [
                    'Unscented|Single' => 60,
                    'Unscented|Triple' => 22,
                ],
            ],
            [
                'name' => 'Undyed Wool Throw',
                'slug' => 'undyed-wool-throw',
                'price' => 410000,
                'blurb' => 'Loomed from one fleece. Weight you can feel.',
                'description' => 'Loomed from the unbleached, undyed wool of a single fleece, so the colour is whatever the sheep grew. Heavy enough to anchor a cold evening, breathable enough to stay on through the night. Finished with a hand-knotted fringe that will outlast the wearer.',
                'accent' => '#8C7A6B',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Ivory', 'hex' => '#EAE5DA'],
                    ['name' => 'Moorit', 'hex' => '#A9764E'],
                    ['name' => 'Grey', 'hex' => '#9A958A'],
                ],
                'sizes' => ['130×180', '180×240'],
                'stock' => [
                    'Ivory|130×180' => 8,
                    'Ivory|180×240' => 0,
                    'Moorit|130×180' => 5,
                    'Moorit|180×240' => 3,
                    'Grey|130×180' => 0,
                    'Grey|180×240' => 6,
                ],
            ],
            [
                'name' => 'Oak Serving Tray',
                'slug' => 'oak-serving-tray',
                'price' => 275000,
                'blurb' => 'Oil-finished, finger joints. For the slow mornings.',
                'description' => 'Joined with exposed finger joints and finished in nothing but food-safe oil, so the grain stays open to the touch. The handles are cut from the solid, not added on. Built for breakfast in bed and the long Sunday that follows it.',
                'accent' => '#9C6B3F',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Oiled', 'hex' => '#9C6B3F'],
                    ['name' => 'Raw', 'hex' => '#C9B08C'],
                ],
                'sizes' => ['Small', 'Large'],
                'stock' => [
                    'Oiled|Small' => 14,
                    'Oiled|Large' => 9,
                    'Raw|Small' => 0,
                    'Raw|Large' => 12,
                ],
            ],
            [
                'name' => 'Mouth-blown Jar',
                'slug' => 'mouth-blown-jar',
                'price' => 96000,
                'blurb' => 'Slight wobble is the point. No two are alike.',
                'description' => 'Blown by hand at the furnace, so each jar keeps the breath of the maker — a wonk in the rim, a seam where the punt was sheared. Hold it to the light and the walls go green at the thick parts. Made to hold pencils, honey, or nothing at all.',
                'accent' => '#5C7A89',
                'discount' => 25,
                'colors' => [
                    ['name' => 'Sea', 'hex' => '#5C7A89'],
                    ['name' => 'Fern', 'hex' => '#6E7C5A'],
                    ['name' => 'Smoke', 'hex' => '#6B6B6B'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Sea|One size' => 20,
                    'Fern|One size' => 4,
                    'Smoke|One size' => 0,
                ],
            ],
            [
                'name' => 'Heavy Cotton Apron',
                'slug' => 'heavy-cotton-apron',
                'price' => 165000,
                'blurb' => 'Cross-back straps, deep pocket. Made to be stained.',
                'description' => 'Cut from a 12oz cotton canvas with cross-back straps that take the weight off the neck during a long cook. One deep front pocket for a thermometer and a trout. Sent raw so it fades and stains into something that is yours alone.',
                'accent' => '#7A4B52',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Ecru', 'hex' => '#D9CDB6'],
                    ['name' => 'Black', 'hex' => '#21201C'],
                    ['name' => 'Olive', 'hex' => '#6F6B3A'],
                ],
                'sizes' => ['OS'],
                'stock' => [
                    'Ecru|OS' => 25,
                    'Black|OS' => 13,
                    'Olive|OS' => 0,
                ],
            ],
        ];

        foreach ($items as $item) {
            $slug = $item['slug'];
            $gallery = [
                'https://picsum.photos/seed/' . $slug . '-1/900/1200',
                'https://picsum.photos/seed/' . $slug . '-2/900/1200',
                'https://picsum.photos/seed/' . $slug . '-3/900/1200',
            ];
            \App\Models\Product::updateOrCreate(
                ['slug' => $slug],
                array_merge($item, [
                    'image' => $gallery[0],
                    'images' => $gallery,
                ])
            );
        }
    }
}
