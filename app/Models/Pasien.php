<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Pasien extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'pasien';

    protected $table = 'pasien';

    protected $guarded = [];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tanggal_pendaftaran' => 'date',
        ];
    }

    // --- Relasi Pendaftaran ---

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

    // --- Relasi RME ---

    /** @return HasMany<RekamMedis, $this> */
    public function rekamMedis(): HasMany
    {
        return $this->hasMany(RekamMedis::class, 'pasien_id');
    }

    /** @return HasMany<Resep, $this> */
    public function reseps(): HasMany
    {
        return $this->hasMany(Resep::class, 'pasien_id');
    }

    /** @return HasMany<RawatInapAdmission, $this> */
    public function rawatInapAdmissions(): HasMany
    {
        return $this->hasMany(RawatInapAdmission::class, 'pasien_id');
    }

    // --- Query Scopes ---

    /** @param Builder<Pasien> $query */
    public function scopeJenisLayanan(Builder $query, string $jenis): void
    {
        $query->where('jenis_layanan', $jenis);
    }

    /** @param Builder<Pasien> $query */
    public function scopeStatusPendaftaran(Builder $query, string $status): void
    {
        $query->where('status_pendaftaran', $status);
    }

    /** @param Builder<Pasien> $query */
    public function scopeTerdaftar(Builder $query): void
    {
        $query->whereNotNull('jenis_layanan')
            ->where('status_pendaftaran', '!=', 'belum_daftar');
    }

    /** @param Builder<Pasien> $query */
    public function scopeTanggalPendaftaran(Builder $query, string $tanggal): void
    {
        $query->whereDate('tanggal_pendaftaran', $tanggal);
    }
}
