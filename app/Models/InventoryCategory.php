<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryCategory extends Model
{
    use HasUuids;

    protected $table = 'inventory_categories';

    protected $guarded = [];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    /** @return HasMany<InventoryItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'inventory_category_id');
    }
}