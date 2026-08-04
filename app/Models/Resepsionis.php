<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Resepsionis extends Model
{
    use HasUuids;

    protected $table = 'resepsionis';
    protected $guarded = [];

    public function loketPendaftaran()
    {
        return $this->belongsTo(LoketPendaftaran::class, 'loket_id');
    }
}
