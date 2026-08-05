<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWebAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! session('simrs_user') || ! session('simrs_role')) {
            return redirect()->route('login');
        }

        return $next($request);
    }
}
