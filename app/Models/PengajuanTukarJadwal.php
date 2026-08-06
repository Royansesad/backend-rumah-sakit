<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengajuanTukarJadwal extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'pengajuan_tukar_jadwal';

    protected $guarded = [];

    protected $casts = [
        'waktu_persetujuan_target' => 'datetime',
    ];

    /** @return BelongsTo<Admin, $this> */
    public function disetujuiOlehAdmin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'disetujui_oleh_admin_id');
    }

    /** Accessor for pemohon schedule */
    public function jadwalPemohon()
    {
        if ($this->kategori_tukar === 'jadwal_dokter') {
            return $this->belongsTo(JadwalDokter::class, 'jadwal_pemohon_id');
        }

        return $this->belongsTo(JadwalShiftPerawat::class, 'jadwal_pemohon_id');
    }

    /** Accessor for target schedule */
    public function jadwalTarget()
    {
        if ($this->kategori_tukar === 'jadwal_dokter') {
            return $this->belongsTo(JadwalDokter::class, 'jadwal_target_id');
        }

        return $this->belongsTo(JadwalShiftPerawat::class, 'jadwal_target_id');
    }
}
