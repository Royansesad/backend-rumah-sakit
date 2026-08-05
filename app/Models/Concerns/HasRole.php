<?php

namespace App\Models\Concerns;

/**
 * @property-read string $role The SIMRS role key for the model (e.g. "admin", "pasien").
 */
trait HasRole
{
    /**
     * Resolve the SIMRS role of the authenticated model.
     */
    public function getRoleAttribute(): string
    {
        return static::ROLE;
    }
}
