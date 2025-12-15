<?php

namespace App\Http\Middleware;

use App\Models\SiteVisit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackSiteVisits
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only track GET requests (not API calls, POST submissions, etc.)
        if ($request->isMethod('GET') && !$request->ajax() && !$request->is('api/*')) {
            $this->recordVisit($request);
        }

        return $next($request);
    }

    /**
     * Record the site visit.
     */
    protected function recordVisit(Request $request): void
    {
        try {
            $ip = $request->ip();
            $today = now()->toDateString();

            // Avoid duplicate visits from same IP in short time (within same day, limit to unique pages)
            $exists = SiteVisit::where('ip_address', $ip)
                ->where('visit_date', $today)
                ->where('page', $request->path())
                ->exists();

            if (!$exists) {
                SiteVisit::create([
                    'ip_address' => $ip,
                    'user_agent' => substr($request->userAgent() ?? '', 0, 500),
                    'page' => $request->path(),
                    'referrer' => $request->header('referer'),
                    'user_id' => $request->user()?->id,
                    'visit_date' => $today,
                ]);
            }
        } catch (\Exception $e) {
            // Silently fail - don't break the app for analytics
            \Illuminate\Support\Facades\Log::warning('Failed to track visit: ' . $e->getMessage());
        }
    }
}
