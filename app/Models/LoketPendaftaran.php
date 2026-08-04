<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LoketPendaftaran extends Model
{
    use HasUuids;

    protected $table = 'loket_pendaftaran';
    protected $guarded = [];

    public function resepsionis()
    {
        return $this->hasMany(Resepsionis::class, 'loket_id');
    }
}
