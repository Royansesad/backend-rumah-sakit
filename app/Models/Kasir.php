<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Kasir extends Model
{
    use HasUuids;

    protected $table = 'kasirs';
    protected $guarded = [];

    public function loketKasir()
    {
        return $this->belongsTo(LoketKasir::class, 'loket_id');
    }
}
