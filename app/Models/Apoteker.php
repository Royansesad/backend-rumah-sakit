<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Apoteker extends Model
{
    use HasUuids;

    protected $table = 'apotekers';
    protected $guarded = [];

    public function unitFarmasi()
    {
        return $this->belongsTo(UnitFarmasi::class, 'unit_farmasi_id');
    }
}
