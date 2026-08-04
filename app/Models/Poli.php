<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Poli extends Model
{
    use HasUuids;

    protected $table = 'poli';
    protected $guarded = [];

    public function dokters()
    {
        return $this->hasMany(Dokter::class, 'poli_id');
    }
}
