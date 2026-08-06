<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JadwalDokter extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'jadwal_dokter';

    protected $guarded = [];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',
        'hari' => 'integer',
        'kuota_maksimal' => 'integer',
        'ada_bentrok' => 'boolean',
    ];

    /** @return BelongsTo<Dokter, $this> */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Dokter::class, 'dokter_id');
    }

    /** @return BelongsTo<Poli, $this> */
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    /** @return BelongsTo<Ruangan, $this> */
    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    /** @return HasMany<Antrian, $this> */
    public function antrian(): HasMany
    {
        return $this->hasMany(Antrian::class, 'jadwal_dokter_id');
    }
}
