<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resep extends Model
{
    use HasUuids;

    protected $table = 'reseps';

    protected $guarded = [];

    /** @return BelongsTo<Pasien, $this> */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class, 'pasien_id');
    }

    /** @return BelongsTo<Dokter, $this> */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Dokter::class, 'dokter_id');
    }

    /** @return BelongsTo<RekamMedis, $this> */
    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    /** @return HasMany<ResepDetail, $this> */
    public function details(): HasMany
    {
        return $this->hasMany(ResepDetail::class, 'resep_id');
    }
}
