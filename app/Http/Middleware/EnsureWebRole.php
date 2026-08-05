<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWebRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! in_array((string) session('simrs_role'), $roles, true)) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
