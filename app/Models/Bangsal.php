<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bangsal extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'bangsal';

    protected $guarded = [];

    protected $casts = [
        'kapasitas' => 'integer',
        'is_aktif' => 'boolean',
    ];

    /** @return HasMany<JadwalShiftPerawat, $this> */
    public function jadwalShiftPerawat(): HasMany
    {
        return $this->hasMany(JadwalShiftPerawat::class, 'bangsal_id');
    }
}
