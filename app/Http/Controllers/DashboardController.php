<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Script;
use App\Models\Message;
use App\Models\Channel;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with recent projects and scripts.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        $user = Auth::user();

        $recentProjects = Project::where('user_id', $userId)
            ->latest()
            ->take(6)
            ->get();

        $recentScripts = Script::where('user_id', $userId)
            ->latest()
            ->take(3)
            ->get();

        // Stats
        $projectsCount = Project::where('user_id', $userId)->count();
        $scriptsCount = Script::where('user_id', $userId)->count();
        $totalViews = Project::where('user_id', $userId)->sum('views_count');
        
        // Unread messages count (messages in channels the user has access to, excluding their own)
        $unreadMessages = $user->notifications()->unread()->count();

        // Trending project (public, approved, most views in last 7 days)
        $trendingProject = Project::with('user')
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->where('created_at', '>=', now()->subDays(7))
            ->orderByDesc('views_count')
            ->first();

        // Channels with unread indicator (simplified - just show accessible channels)
        $unreadChannels = [];
        if ($user) {
            $channels = Channel::orderBy('category')
                ->orderBy('name')
                ->where(function ($q) use ($user) {
                    $q->whereNull('allowed_role_id')
                      ->orWhere(function ($q2) use ($user) {
                          if (method_exists($user, 'hasRole') && ($user->hasRole('admin') || $user->hasRole('super-admin') || $user->hasRole('officer'))) {
                              $q2->orWhereNotNull('id');
                              return;
                          }
                          $roleIds = $user->roles->pluck('id')->toArray();
                          if (!empty($roleIds)) {
                              $q2->whereIn('allowed_role_id', $roleIds);
                          }
                      });
                })
                ->take(3)
                ->get();

            $unreadChannels = $channels->map(function ($channel) {
                return [
                    'id' => $channel->id,
                    'name' => $channel->name,
                    'unread_count' => 0, // Would need last_read tracking for real unread counts
                ];
            })->toArray();
        }

        return Inertia::render('Dashboard', [
            'recentProjects' => $recentProjects,
            'recentScripts' => $recentScripts,
            'trendingProject' => $trendingProject,
            'unreadChannels' => $unreadChannels,
            'stats' => [
                'projects_count' => $projectsCount,
                'scripts_count' => $scriptsCount,
                'total_views' => $totalViews,
                'unread_messages' => $unreadMessages,
            ],
        ]);
    }
}

