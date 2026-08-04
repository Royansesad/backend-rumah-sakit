<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class LoketKasir extends Model
{
    use HasUuids;

    protected $table = 'loket_kasir';
    protected $guarded = [];

    public function kasirs()
    {
        return $this->hasMany(Kasir::class, 'loket_id');
    }
}
