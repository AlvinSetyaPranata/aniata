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
                'name' => 'Instant Hijab',
                'slug' => 'instant-hijab',
                'price' => 89000,
                'blurb' => 'Slip it on, adjust the neck, walk out. The ten-second hijab.',
                'description' => 'A ready-to-wear instant hijab with a built-in visor and soft jersey undercap, sewn from a breathable stretch fabric that holds its shape all day. No pins, no fuss — just pull it over and go. The face opening stays put through school runs and long meetings alike.',
                'accent' => '#C9A9A6',
                'discount' => 15,
                'colors' => [
                    ['name' => 'Cream', 'hex' => '#EFE7D6'],
                    ['name' => 'Black', 'hex' => '#1B1A17'],
                    ['name' => 'Dusty Rose', 'hex' => '#C9A9A6'],
                    ['name' => 'Sage', 'hex' => '#9CA98C'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Cream|One size' => 40,
                    'Black|One size' => 0,
                    'Dusty Rose|One size' => 22,
                    'Sage|One size' => 15,
                ],
            ],
            [
                'name' => 'Square Hijab',
                'slug' => 'square-hijab',
                'price' => 125000,
                'blurb' => 'The classic square shawl, hemmed by hand.',
                'description' => 'The wardrobe essential: a generous square hijab finished with a delicate rolled hem, woven from a matte crepe that drapes without slipping. Wear it pinned, twisted, or layered. Comes in three lengths so it falls exactly where you like.',
                'accent' => '#2B3A55',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Navy', 'hex' => '#2B3A55'],
                    ['name' => 'Maroon', 'hex' => '#6E2B2B'],
                    ['name' => 'Olive', 'hex' => '#6F6B3A'],
                    ['name' => 'Mustard', 'hex' => '#C9A227'],
                ],
                'sizes' => ['90cm', '110cm', '120cm'],
                'stock' => [
                    'Navy|90cm' => 14,
                    'Navy|110cm' => 9,
                    'Navy|120cm' => 0,
                    'Maroon|90cm' => 0,
                    'Maroon|110cm' => 6,
                    'Maroon|120cm' => 3,
                    'Olive|90cm' => 8,
                    'Olive|110cm' => 0,
                    'Olive|120cm' => 5,
                    'Mustard|90cm' => 4,
                    'Mustard|110cm' => 7,
                    'Mustard|120cm' => 2,
                ],
            ],
            [
                'name' => 'Pashmina Hijab',
                'slug' => 'pashmina-hijab',
                'price' => 165000,
                'blurb' => 'Featherlight warmth for the cooler months.',
                'description' => 'A whisper-thin pashmina blend that warms without weight, with a subtle nap you can feel between your fingers. Large enough to wrap twice and still pool at the shoulder. The kind of scarf that disappears into a coat pocket until the wind turns.',
                'accent' => '#5B2A4B',
                'discount' => 20,
                'colors' => [
                    ['name' => 'Cashmere', 'hex' => '#D8C3A5'],
                    ['name' => 'Plum', 'hex' => '#5B2A4B'],
                    ['name' => 'Teal', 'hex' => '#2E6B6B'],
                    ['name' => 'Sand', 'hex' => '#D8C39A'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Cashmere|One size' => 18,
                    'Plum|One size' => 0,
                    'Teal|One size' => 9,
                    'Sand|One size' => 14,
                ],
            ],
            [
                'name' => 'Jersey Hijab',
                'slug' => 'jersey-hijab',
                'price' => 75000,
                'blurb' => 'Everyday stretch that never loses its give.',
                'description' => 'The workhorse hijab: a medium-weight jersey with just enough stretch to style tight or loose, and a finish that resists lint and pilling. Opaque in a single layer, cool against the skin, and easy to wash on repeat. The one you reach for first.',
                'accent' => '#8794A0',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Black', 'hex' => '#1B1A17'],
                    ['name' => 'Mocha', 'hex' => '#6F5642'],
                    ['name' => 'Blush', 'hex' => '#E3B7B0'],
                    ['name' => 'Steel', 'hex' => '#8794A0'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Black|One size' => 60,
                    'Mocha|One size' => 24,
                    'Blush|One size' => 0,
                    'Steel|One size' => 31,
                ],
            ],
            [
                'name' => 'Silk Hijab',
                'slug' => 'silk-hijab',
                'price' => 245000,
                'blurb' => 'Pure silk with a low, liquid sheen.',
                'description' => 'A 100% mulberry silk hijab with a hand-rolled edge and a sheen that moves as you do. Cool in heat, elegant for evenings, and light enough to pack for travel. Tie it once and it stays; the surface catches light without a hint of glare.',
                'accent' => '#1F6F52',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Champagne', 'hex' => '#E7D8C2'],
                    ['name' => 'Emerald', 'hex' => '#1F6F52'],
                    ['name' => 'Wine', 'hex' => '#5C1F2B'],
                    ['name' => 'Ink', 'hex' => '#2A2C3A'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Champagne|One size' => 12,
                    'Emerald|One size' => 0,
                    'Wine|One size' => 7,
                    'Ink|One size' => 15,
                ],
            ],
            [
                'name' => 'Cotton Hijab',
                'slug' => 'cotton-hijab',
                'price' => 95000,
                'blurb' => 'Breathable woven cotton for hot days.',
                'description' => 'A crisp woven-cotton hijab that breathes through the heaviest day, with a structured drape that holds a fold. Pre-washed so it starts soft and only relaxes further. The honest, no-fuss choice for daily wear and prayer.',
                'accent' => '#B5694E',
                'discount' => 10,
                'colors' => [
                    ['name' => 'White', 'hex' => '#F2EFE9'],
                    ['name' => 'Clay', 'hex' => '#B5694E'],
                    ['name' => 'Sage', 'hex' => '#9CA98C'],
                    ['name' => 'Indigo', 'hex' => '#3D4A6B'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'White|One size' => 50,
                    'Clay|One size' => 0,
                    'Sage|One size' => 28,
                    'Indigo|One size' => 16,
                ],
            ],
            [
                'name' => 'Embroidered Hijab',
                'slug' => 'embroidered-hijab',
                'price' => 189000,
                'blurb' => 'Hand-embroidered edge, made to be noticed.',
                'description' => 'A square hijab edged with hand-guided embroidery in a tone-on-tone motif, so the detail reveals itself up close. The base is a smooth crepe that stays put while the stitching does the talking. Three lengths, one quiet kind of statement.',
                'accent' => '#C98B95',
                'discount' => 25,
                'colors' => [
                    ['name' => 'Ivory', 'hex' => '#EAE5DA'],
                    ['name' => 'Rose', 'hex' => '#C98B95'],
                    ['name' => 'Navy', 'hex' => '#2B3A55'],
                ],
                'sizes' => ['90cm', '110cm', '120cm'],
                'stock' => [
                    'Ivory|90cm' => 10,
                    'Ivory|110cm' => 0,
                    'Ivory|120cm' => 4,
                    'Rose|90cm' => 0,
                    'Rose|110cm' => 6,
                    'Rose|120cm' => 3,
                    'Navy|90cm' => 5,
                    'Navy|110cm' => 2,
                    'Navy|120cm' => 0,
                ],
            ],
            [
                'name' => 'Sports Hijab',
                'slug' => 'sports-hijab',
                'price' => 135000,
                'blurb' => 'Stay-put coverage for movement.',
                'description' => 'Built for motion: a lightweight, moisture-wicking hijab with a long back panel and a snug undercap that keeps everything in place through a run or a class. Flat seams, no tags, and a fabric that dries before you reach the lockers.',
                'accent' => '#E08A6E',
                'discount' => 0,
                'colors' => [
                    ['name' => 'Black', 'hex' => '#1B1A17'],
                    ['name' => 'Grey', 'hex' => '#9A958A'],
                    ['name' => 'Coral', 'hex' => '#E08A6E'],
                ],
                'sizes' => ['One size'],
                'stock' => [
                    'Black|One size' => 30,
                    'Grey|One size' => 0,
                    'Coral|One size' => 12,
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
            if (!empty($item['colors'])) {
                $item['colors'] = array_map(function ($c) use ($slug) {
                    $cSlug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $c['name']));
                    $c['images'] = [
                        'https://picsum.photos/seed/' . $slug . '-' . $cSlug . '-1/900/1200',
                        'https://picsum.photos/seed/' . $slug . '-' . $cSlug . '-2/900/1200',
                        'https://picsum.photos/seed/' . $slug . '-' . $cSlug . '-3/900/1200',
                    ];
                    return $c;
                }, $item['colors']);
            }
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
