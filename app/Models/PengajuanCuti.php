<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengajuanCuti extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'pengajuan_cuti';

    protected $guarded = [];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];

    /** @return BelongsTo<Admin, $this> */
    public function disetujuiOlehAdmin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'disetujui_oleh_admin_id');
    }

    /** Polymorphic accessor for pemohon (Dokter or Perawat) */
    public function pemohon()
    {
        if ($this->peran_pemohon === 'dokter') {
            return $this->belongsTo(Dokter::class, 'pemohon_id');
        }

        return $this->belongsTo(Perawat::class, 'pemohon_id');
    }
}
