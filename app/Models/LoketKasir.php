<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoketKasir extends Model
{
    use HasUuids;

    protected $table = 'loket_kasir';

    protected $guarded = [];

    /** @return HasMany<Kasir, $this> */
    public function kasirs(): HasMany
    {
        return $this->hasMany(Kasir::class, 'loket_id');
    }
}
