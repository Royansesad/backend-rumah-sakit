<?php

namespace App\Services;

use App\Models\Contracts\HasSimrsRole;
use Illuminate\Http\Request;

class SimrsOperatorService
{
    /**
     * Resolve operator aktif (id + role) dari user Sanctum (API)
     * atau staff session (Web).
     *
     * @return array{id: string|null, role: string}
     */
    public function resolve(Request $request): array
    {
        $user = $request->user();
        if ($user instanceof HasSimrsRole) {
            return [
                'id' => (string) $user->getAuthIdentifier(),
                'role' => $user->getRoleAttribute(),
            ];
        }

        $sessionUser = $request->session()->get('simrs_user', null);

        return [
            'id' => $sessionUser['id'] ?? null,
            'role' => (string) $request->session()->get('simrs_role', 'admin'),
        ];
    }
}