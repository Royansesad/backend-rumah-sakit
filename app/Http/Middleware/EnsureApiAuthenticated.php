<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiAuthenticated
{
    /**
     * Handle authentication for API requests according to API_SECURITY_ENABLED configuration.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        if (! config('app.api_security', true)) {
            try {
                return app(\Illuminate\Auth\Middleware\Authenticate::class)->handle($request, $next, ...$guards);
            } catch (AuthenticationException) {
                return $next($request);
            }
        }

        return app(\Illuminate\Auth\Middleware\Authenticate::class)->handle($request, $next, ...$guards);
    }
}
