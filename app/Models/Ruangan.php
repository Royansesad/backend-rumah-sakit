<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Ruangan extends Model
{
    use HasUuids;

    protected $table = 'ruangan';
    protected $guarded = [];

    public function perawats()
    {
        return $this->hasMany(Perawat::class, 'ruangan_id');
    }
}
