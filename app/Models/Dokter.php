<?php

namespace App\Models;

use App\Models\Concerns\HasRole;
use App\Models\Contracts\HasSimrsRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Dokter extends Authenticatable implements HasSimrsRole
{
    use HasApiTokens, HasRole, HasUuids;

    public const ROLE = 'dokter';

    protected $table = 'dokters';

    protected $guarded = [];

    protected $hidden = ['password'];

    /** @return BelongsTo<Poli, $this> */
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }
}
