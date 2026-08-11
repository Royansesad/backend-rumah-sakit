<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RawatInapAdmission extends Model
{
    use HasUuids;

    protected $table = 'rawat_inap_admissions';

    protected $guarded = [];

    protected $casts = [
        'tanggal_masuk' => 'datetime',
        'tanggal_keluar_rencana' => 'datetime',
        'tanggal_keluar_aktual' => 'datetime',
    ];

    /** @return BelongsTo<Pasien, $this> */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class, 'pasien_id');
    }

    /** @return BelongsTo<Bed, $this> */
    public function bed(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'bed_id');
    }

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

    /** @return BelongsTo<Dokter, $this> */
    public function dpjp(): BelongsTo
    {
        return $this->belongsTo(Dokter::class, 'dpjp_id');
    }

    /** @return HasMany<RiwayatPindahBed, $this> */
    public function riwayatPindah(): HasMany
    {
        return $this->hasMany(RiwayatPindahBed::class, 'admission_id');
    }
}
