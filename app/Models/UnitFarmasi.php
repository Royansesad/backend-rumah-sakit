<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UnitFarmasi extends Model
{
    use HasUuids;

    protected $table = 'unit_farmasi';
    protected $guarded = [];

    public function apotekers()
    {
        return $this->hasMany(Apoteker::class, 'unit_farmasi_id');
    }
}
