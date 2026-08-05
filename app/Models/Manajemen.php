<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Manajemen extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'manajemen';

    protected $table = 'manajemen';

    protected $guarded = [];

    protected $hidden = ['password'];
}
