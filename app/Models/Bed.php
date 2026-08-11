<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bed extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'beds';

    protected $guarded = [];

    protected $casts = [
        'tarif_per_hari' => 'decimal:2',
    ];

    /** @return BelongsTo<Ruangan, $this> */
    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    /** @return BelongsTo<Bangsal, $this> */
    public function bangsal(): BelongsTo
    {
        return $this->belongsTo(Bangsal::class, 'bangsal_id');
    }

    /** @return HasMany<RawatInapAdmission, $this> */
    public function admissions(): HasMany
    {
        return $this->hasMany(RawatInapAdmission::class, 'bed_id');
    }

    public function activeAdmission()
    {
        return $this->hasOne(RawatInapAdmission::class, 'bed_id')->where('status', 'aktif');
    }
}
