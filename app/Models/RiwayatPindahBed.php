<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatPindahBed extends Model
{
    use HasUuids;

    protected $table = 'riwayat_pindah_bed';

    protected $guarded = [];

    protected $casts = [
        'tanggal_pindah' => 'datetime',
    ];

    /** @return BelongsTo<RawatInapAdmission, $this> */
    public function admission(): BelongsTo
    {
        return $this->belongsTo(RawatInapAdmission::class, 'admission_id');
    }

    /** @return BelongsTo<Bed, $this> */
    public function bedAsal(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'bed_asal_id');
    }

    /** @return BelongsTo<Bed, $this> */
    public function bedTujuan(): BelongsTo
    {
        return $this->belongsTo(Bed::class, 'bed_tujuan_id');
    }
}
