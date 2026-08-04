<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Dokter extends Model
{
    use HasUuids;

    protected $table = 'dokters';
    protected $guarded = [];

    public function poli()
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }
}
