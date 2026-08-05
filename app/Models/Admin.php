<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'admin';

    protected $table = 'admins';

    protected $guarded = [];

    protected $hidden = ['password'];
}
