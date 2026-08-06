<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Obat extends Model
{
    protected $table = 'obats';

    protected $guarded = [];

    /** @return BelongsTo<UnitFarmasi, $this> */
    public function unitFarmasi(): BelongsTo
    {
        return $this->belongsTo(UnitFarmasi::class, 'unit_farmasi_id');
    }
}
