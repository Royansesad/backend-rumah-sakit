<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Pasien extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'pasien';

    protected $table = 'pasien';

    protected $guarded = [];

    protected $hidden = ['password'];
}
