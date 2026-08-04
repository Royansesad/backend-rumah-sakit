<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Pasien extends Model
{
    use HasUuids;

    protected $table = 'pasien';
    protected $guarded = [];
}
