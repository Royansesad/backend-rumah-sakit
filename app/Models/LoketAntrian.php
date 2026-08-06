<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoketAntrian extends Model
{
    use HasUuids;

    protected $table = 'loket_antrian';

    protected $guarded = [];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    /** @return BelongsTo<Poli, $this> */
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    /** @return HasMany<Antrian, $this> */
    public function antrian(): HasMany
    {
        return $this->hasMany(Antrian::class, 'loket_id');
    }
}
