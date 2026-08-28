<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_address',
        'total',
        'status',
        'notes',
    ];

    protected $casts = [
        'total' => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
