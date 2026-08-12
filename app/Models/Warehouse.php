<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    use HasUuids;

    protected $table = 'warehouses';

    protected $guarded = [];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    /** @return HasMany<InventoryItem, $this> */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'warehouse_id');
    }

    /** @return HasMany<InventoryStockMovement, $this> */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(InventoryStockMovement::class, 'warehouse_id');
    }
}