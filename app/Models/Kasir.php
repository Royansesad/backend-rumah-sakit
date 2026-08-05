<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Kasir extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'kasir';

    protected $table = 'kasirs';

    protected $guarded = [];

    protected $hidden = ['password'];

    /** @return BelongsTo<LoketKasir, $this> */
    public function loketKasir(): BelongsTo
    {
        return $this->belongsTo(LoketKasir::class, 'loket_id');
    }
}
