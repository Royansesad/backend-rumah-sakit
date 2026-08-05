<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Poli extends Model
{
    use HasUuids;

    protected $table = 'poli';

    protected $guarded = [];

    /** @return HasMany<Dokter, $this> */
    public function dokters(): HasMany
    {
        return $this->hasMany(Dokter::class, 'poli_id');
    }
}
