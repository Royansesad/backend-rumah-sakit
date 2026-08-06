<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class JadwalShiftPerawat extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'jadwal_shift_perawat';

    protected $guarded = [];

    protected $casts = [
        'tanggal' => 'date',
    ];

    /** @return BelongsTo<Perawat, $this> */
    public function perawat(): BelongsTo
    {
        return $this->belongsTo(Perawat::class, 'perawat_id');
    }

    /** @return BelongsTo<Bangsal, $this> */
    public function bangsal(): BelongsTo
    {
        return $this->belongsTo(Bangsal::class, 'bangsal_id');
    }
}
