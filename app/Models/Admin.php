<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Admin extends Authenticatable
{
    use HasUuids;

    protected $table = 'admins';
    protected $guarded = [];
}
