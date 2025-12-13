<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Check if the user is logged in
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // 2. Check if the user has the required role
        // We assume your User model has the hasRole() method we planned earlier.
        // If not, we will check that next.
        if (! $request->user()->hasRole($role)) {
            abort(403, 'Unauthorized. You do not have the ' . $role . ' role.');
        }

        return $next($request);
    }
}