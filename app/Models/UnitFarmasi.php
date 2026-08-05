<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitFarmasi extends Model
{
    use HasUuids;

    protected $table = 'unit_farmasi';

    protected $guarded = [];

    /** @return HasMany<Apoteker, $this> */
    public function apotekers(): HasMany
    {
        return $this->hasMany(Apoteker::class, 'unit_farmasi_id');
    }
}
