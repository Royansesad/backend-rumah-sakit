<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasUuids;

    protected $table = 'inventory_items';

    protected $guarded = [];

    protected $appends = ['status_stok'];

    protected function casts(): array
    {
        return [
            'stok_minimum' => 'integer',
            'stok_saat_ini' => 'integer',
            'harga_beli' => 'decimal:2',
            'harga_jual' => 'decimal:2',
            'masa_berlaku' => 'date',
            'is_aktif' => 'boolean',
        ];
    }

    /** @return BelongsTo<InventoryCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    /** @return BelongsTo<Warehouse, $this> */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /** @return HasMany<InventoryStockMovement, $this> */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(InventoryStockMovement::class, 'inventory_item_id');
    }

    public function getStatusStokAttribute(): string
    {
        if ($this->stok_saat_ini <= 0) {
            return 'habis';
        }

        return $this->stok_saat_ini <= $this->stok_minimum ? 'menipis' : 'aman';
    }
}