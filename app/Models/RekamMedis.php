<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RekamMedis extends Model
{
    use HasUuids;

    protected $table = 'rekam_medis';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'finalized_at' => 'datetime',
        ];
    }

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

    /** @return BelongsTo<Perawat, $this> */
    public function perawat(): BelongsTo
    {
        return $this->belongsTo(Perawat::class, 'perawat_id');
    }

    /** @return BelongsTo<Poli, $this> */
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    /** @return HasOne<Resep, $this> */
    public function resep(): HasOne
    {
        return $this->hasOne(Resep::class, 'rekam_medis_id');
    }
}
