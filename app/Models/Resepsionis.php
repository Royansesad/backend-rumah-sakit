<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Resepsionis extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'resepsionis';

    protected $table = 'resepsionis';

    protected $guarded = [];

    protected $hidden = ['password'];

    /** @return BelongsTo<LoketPendaftaran, $this> */
    public function loketPendaftaran(): BelongsTo
    {
        return $this->belongsTo(LoketPendaftaran::class, 'loket_id');
    }
}
