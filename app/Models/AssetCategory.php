<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetCategory extends Model
{
    use HasUuids;

    protected $table = 'asset_categories';

    protected $guarded = [];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    /** @return HasMany<Asset, $this> */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'asset_category_id');
    }
}