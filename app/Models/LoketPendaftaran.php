<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoketPendaftaran extends Model
{
    use HasUuids;

    protected $table = 'loket_pendaftaran';

    protected $guarded = [];

    /** @return HasMany<Resepsionis, $this> */
    public function resepsionis(): HasMany
    {
        return $this->hasMany(Resepsionis::class, 'loket_id');
    }
}
