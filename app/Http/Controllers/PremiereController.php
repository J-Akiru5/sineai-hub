<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PremiereController extends Controller
{
    public function index(Request $request)
    {
        // Featured: one random public + approved project
        $featured = Project::where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->inRandomOrder()
            ->first();

        // New arrivals: latest 10 public + approved
        $newArrivals = Project::with('user')
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->latest()
            ->take(10)
            ->get();

        // Trending: top 10 by views_count
        $trending = Project::with('user')
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->orderByDesc('views_count')
            ->take(10)
            ->get();

        return Inertia::render('Premiere/Index', [
            'featured' => $featured,
            'featuredProject' => $featured,
            'newArrivals' => $newArrivals,
            'trending' => $trending,
        ]);
    }

    public function show(Project $project)
    {
        // Check if project exists and has valid video (not deleted)
        if (!$project || !$project->video_url) {
            return Inertia::render('Premiere/VideoNotFound', [
                'message' => 'This video is no longer available.',
            ]);
        }

        // eager-load user and comments relationship
        $project->load(['user', 'comments.user']);

        // load top-level comments (paginated)
        $comments = $project->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $user = auth()->user();
        $userId = $user?->id;
        $isAdmin = $user && method_exists($user, 'hasRole') && 
                   ($user->hasRole('admin') || $user->hasRole('super-admin'));

        // If not owner and not admin, enforce public + approved
        if ($userId !== $project->user_id && !$isAdmin) {
            if ($project->visibility !== 'public' || $project->moderation_status !== 'approved') {
                abort(403);
            }
        }

        try {
            $project->increment('views_count');
        } catch (\Exception $e) {
            // ignore increment failures
        }

        // Suggested videos: same creator + same category (public & approved), exclude current
        $sameCreator = Project::with('user')
            ->where('user_id', $project->user_id)
            ->where('id', '<>', $project->id)
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->latest()
            ->take(5)
            ->get();

        $sameCategory = collect();
        if (!empty($project->category)) {
            $sameCategory = Project::with('user')
                ->where('category', $project->category)
                ->where('id', '<>', $project->id)
                ->where('visibility', 'public')
                ->where('moderation_status', 'approved')
                ->latest()
                ->take(5)
                ->get();
        }

        $suggestedVideos = $sameCreator->merge($sameCategory)->unique('id')->values()->take(8);

        return Inertia::render('Premiere/Show', [
            'project' => $project,
            'comments' => $comments,
            'suggestedVideos' => $suggestedVideos,
        ]);
    }
}
