<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'blurb',
        'description',
        'accent',
        'image',
        'images',
        'discount',
        'colors',
        'sizes',
        'stock',
    ];

    protected $casts = [
        'price' => 'integer',
        'discount' => 'integer',
        'images' => 'array',
        'colors' => 'array',
        'sizes' => 'array',
        'stock' => 'array',
    ];
}
