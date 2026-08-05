<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class FlushAuthGuards
{
    /**
     * Clear any cached auth guard instances at the start of each request.
     *
     * Sanctum's guard is resolved as a singleton and Laravel's RequestGuard caches
     * the resolved user, so the user must be re-resolved per request to support
     * the multiple tokenable models used across the SIMRS roles (long-running
     * processes such as Octane or test suites would otherwise reuse a stale user).
     */
    public function handle(Request $request, Closure $next): Response
    {
        Auth::forgetGuards();

        return $next($request);
    }
}
