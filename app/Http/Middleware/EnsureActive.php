<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureActive
{
    /**
     * Handle an incoming request.
     * If the authenticated user is banned, log them out and redirect to login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && isset($user->is_banned) && $user->is_banned) {
            // Log out and invalidate session
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect to login with error message
            return redirect()->route('login')->withErrors(['email' => 'Your account has been suspended.']);
        }

        return $next($request);
    }
}
