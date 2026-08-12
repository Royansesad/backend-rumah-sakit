<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use HasUuids;

    protected $table = 'assets';

    protected $guarded = [];

    protected $appends = ['nilai_buku'];

    protected function casts(): array
    {
        return [
            'tanggal_perolehan' => 'date',
            'nilai_perolehan' => 'decimal:2',
            'umur_ekonomis_tahun' => 'integer',
            'nilai_residu' => 'decimal:2',
            'garansi_sampai' => 'date',
            'is_aktif' => 'boolean',
        ];
    }

    /** @return BelongsTo<AssetCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    /** @return BelongsTo<Ruangan, $this> */
    public function ruangan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_id');
    }

    /** @return BelongsTo<Supplier, $this> */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /** @return HasMany<AssetMaintenance, $this> */
    public function maintenances(): HasMany
    {
        return $this->hasMany(AssetMaintenance::class, 'asset_id');
    }

    /** @return HasMany<AssetLoan, $this> */
    public function loans(): HasMany
    {
        return $this->hasMany(AssetLoan::class, 'asset_id');
    }

    /**
     * Nilai buku dengan depresiasi garis lurus.
     */
    public function getNilaiBukuAttribute(): float
    {
        $nilaiPerolehan = (float) $this->nilai_perolehan;
        $nilaiResidu = (float) $this->nilai_residu;
        $umur = max(1, (int) $this->umur_ekonomis_tahun);

        if (! $this->tanggal_perolehan) {
            return round($nilaiPerolehan, 2);
        }

        $tahunBerlalu = max(0, Carbon::today()->diffInYears(Carbon::parse($this->tanggal_perolehan)));
        $tahunBerlalu = min($tahunBerlalu, $umur);

        $penyusutanTahunan = max(0, ($nilaiPerolehan - $nilaiResidu) / $umur);

        return round($nilaiPerolehan - ($penyusutanTahunan * $tahunBerlalu), 2);
    }

    public function getNilaiPenyusutanAttribute(): float
    {
        return round((float) $this->nilai_perolehan - (float) $this->getNilaiBukuAttribute(), 2);
    }
}