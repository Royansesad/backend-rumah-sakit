<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasUuids;

    protected $table = 'suppliers';

    protected $guarded = [];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    /** @return HasMany<InventoryItem, $this> */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'supplier_id');
    }
}