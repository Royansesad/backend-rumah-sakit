<?php

namespace App\Http\Middleware;

use App\Models\Contracts\HasSimrsRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Allow the request only when the authenticated user's role is allowed.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user instanceof HasSimrsRole || ! in_array($user->getRoleAttribute(), $roles, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke resource ini.',
            ], 403);
        }

        return $next($request);
    }
}
