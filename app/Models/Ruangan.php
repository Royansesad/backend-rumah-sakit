<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ruangan extends Model
{
    use HasUuids;

    protected $table = 'ruangan';

    public $timestamps = false;

    protected $guarded = [];

    /** @return HasMany<Perawat, $this> */
    public function perawats(): HasMany
    {
        return $this->hasMany(Perawat::class, 'ruangan_id');
    }

    /** @return HasMany<Bed, $this> */
    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class, 'ruangan_id');
    }
}

