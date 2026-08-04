<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Manajemen extends Model
{
    use HasUuids;

    protected $table = 'manajemen';
    protected $guarded = [];
}
