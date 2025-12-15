<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Project;
use App\Models\Script;
use Carbon\Carbon;

class HomeController extends Controller
{
    /**
     * Show the public landing page.
     */
    public function index()
    {
        // Fetch site team members (admins / super-admins)
        $teamMembers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'super-admin']);
        })->get();

        // Fetch 3 public, approved projects for the Box Office section
        $boxOfficeProjects = Project::where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        // Build live activity data from recent events
        $liveActivities = $this->getLiveActivities();

        // Serve the cinematic landing page at Home/Index
        return Inertia::render('Home/Index', [
            'teamMembers' => $teamMembers,
            'boxOfficeProjects' => $boxOfficeProjects,
            'liveActivities' => $liveActivities,
        ]);
    }

    /**
     * Get recent platform activity for the live feed.
     */
    private function getLiveActivities(): array
    {
        $activities = [];

        // Recent scripts published (last 24 hours)
        $recentScripts = Script::where('created_at', '>=', Carbon::now()->subHours(24))
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get();

        foreach ($recentScripts as $script) {
            $activities[] = [
                'id' => 'script_' . $script->id,
                'type' => 'script',
                'text' => ($script->user->name ?? 'Someone') . ' published a new script',
                'time' => $script->created_at->diffForHumans(null, true) . ' ago',
                'timestamp' => $script->created_at->timestamp,
            ];
        }

        // Recent approved projects (premieres)
        $recentProjects = Project::where('moderation_status', 'approved')
            ->where('updated_at', '>=', Carbon::now()->subHours(24))
            ->with('user')
            ->orderBy('updated_at', 'desc')
            ->limit(2)
            ->get();

        foreach ($recentProjects as $project) {
            $activities[] = [
                'id' => 'project_' . $project->id,
                'type' => 'premiere',
                'text' => 'New premiere: ' . $project->title,
                'time' => $project->updated_at->diffForHumans(null, true) . ' ago',
                'timestamp' => $project->updated_at->timestamp,
            ];
        }

        // New members (last 24 hours)
        $newMembersCount = User::where('created_at', '>=', Carbon::now()->subHours(24))->count();
        if ($newMembersCount > 0) {
            $activities[] = [
                'id' => 'members_new',
                'type' => 'members',
                'text' => $newMembersCount . ' new member' . ($newMembersCount > 1 ? 's' : '') . ' joined',
                'time' => 'Today',
                'timestamp' => Carbon::now()->timestamp,
            ];
        }

        // Sort by timestamp and take top 3
        usort($activities, fn($a, $b) => $b['timestamp'] - $a['timestamp']);
        $activities = array_slice($activities, 0, 3);

        // If no activities, show fallback
        if (empty($activities)) {
            $activities = [
                ['id' => 'welcome', 'type' => 'system', 'text' => 'Welcome to SineAI Hub', 'time' => 'Now'],
                ['id' => 'community', 'type' => 'members', 'text' => 'Join our growing community', 'time' => ''],
                ['id' => 'create', 'type' => 'script', 'text' => 'Start creating your scripts', 'time' => ''],
            ];
        }

        return $activities;
    }
}
