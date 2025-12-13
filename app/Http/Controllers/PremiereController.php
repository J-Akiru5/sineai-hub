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
            'newArrivals' => $newArrivals,
            'trending' => $trending,
        ]);
    }

    public function show(Project $project)
    {
        // eager-load user and comments relationship
        $project->load(['user', 'comments.user']);

        // load top-level comments (paginated)
        $comments = $project->comments()
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $userId = auth()->id();

        // If not owner, enforce public + approved
        if ($userId !== $project->user_id) {
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
