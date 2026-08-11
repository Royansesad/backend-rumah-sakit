<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Obat extends Model
{
    protected $table = 'obats';

    protected $guarded = [];

    protected $casts = [
        'stok' => 'integer',
        'harga' => 'decimal:2',
        'tanggal_terbit' => 'date',
        'masa_berlaku' => 'date',
    ];

    /** @return BelongsTo<UnitFarmasi, $this> */
    public function unitFarmasi(): BelongsTo
    {
        return $this->belongsTo(UnitFarmasi::class, 'unit_farmasi_id');
    }
}
