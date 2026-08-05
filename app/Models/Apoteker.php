<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Apoteker extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'apoteker';

    protected $table = 'apotekers';

    protected $guarded = [];

    protected $hidden = ['password'];

    /** @return BelongsTo<UnitFarmasi, $this> */
    public function unitFarmasi(): BelongsTo
    {
        return $this->belongsTo(UnitFarmasi::class, 'unit_farmasi_id');
    }
}
