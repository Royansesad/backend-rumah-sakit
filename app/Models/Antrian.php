<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Antrian extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'antrian';

    protected $guarded = [];

    protected $casts = [
        'angka_antrian' => 'integer',
        'waktu_skrining' => 'datetime',
        'waktu_dipanggil' => 'datetime',
        'waktu_dilayani' => 'datetime',
        'waktu_selesai' => 'datetime',
    ];

    /** @return BelongsTo<Poli, $this> */
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    /** @return BelongsTo<Dokter, $this> */
    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Dokter::class, 'dokter_id');
    }

    /** @return BelongsTo<JadwalDokter, $this> */
    public function jadwalDokter(): BelongsTo
    {
        return $this->belongsTo(JadwalDokter::class, 'jadwal_dokter_id');
    }

    /** @return BelongsTo<Pasien, $this> */
    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Pasien::class, 'pasien_id');
    }

    /** @return BelongsTo<LoketAntrian, $this> */
    public function loket(): BelongsTo
    {
        return $this->belongsTo(LoketAntrian::class, 'loket_id');
    }
}
