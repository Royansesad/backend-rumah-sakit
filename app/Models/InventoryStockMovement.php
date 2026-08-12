<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStockMovement extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'inventory_stock_movements';

    protected $guarded = [];

    protected $casts = [
        'qty' => 'integer',
        'stok_setelah' => 'integer',
        'created_at' => 'datetime',
    ];

    /** @return BelongsTo<InventoryItem, $this> */
    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    /** @return BelongsTo<Warehouse, $this> */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }
}