<?php

namespace App\Models\Contracts;

use Illuminate\Contracts\Auth\Authenticatable;

/**
 * Contract for SIMRS staff/patient models that authenticate via Sanctum
 * bearer tokens against the SPA API.
 *
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array<string> $abilities = ['*'], \DateTimeInterface|null $expiresAt = null)
 * @method \Laravel\Sanctum\PersonalAccessToken|null currentAccessToken()
 * @method string getAuthPassword()
 */
interface HasSimrsRole extends Authenticatable
{
    /**
     * Resolve the SIMRS role key of the model (e.g. "admin", "pasien").
     */
    public function getRoleAttribute(): string;
}
