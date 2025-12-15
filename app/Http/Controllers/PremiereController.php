<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PremiereController extends Controller
{
    public function index(Request $request)
    {
        // Featured: projects marked as featured, or random if none
        $featured = Project::with('user')
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->where('is_featured', true)
            ->inRandomOrder()
            ->first();

        // Fallback to random if no featured
        if (!$featured) {
            $featured = Project::with('user')
                ->where('visibility', 'public')
                ->where('moderation_status', 'approved')
                ->inRandomOrder()
                ->first();
        }

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

        // Categories with project counts
        $categories = Category::active()
            ->ordered()
            ->withCount(['projects' => function ($query) {
                $query->where('visibility', 'public')
                    ->where('moderation_status', 'approved');
            }])
            ->get();

        return Inertia::render('Premiere/Index', [
            'featured' => $featured,
            'featuredProject' => $featured,
            'newArrivals' => $newArrivals,
            'trending' => $trending,
            'categories' => $categories,
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

        // Check if current user is the owner
        $isOwner = Auth::id() === $project->user_id;

        // Check if user has liked this project
        $hasLiked = Auth::check() ? $project->isLikedBy(Auth::user()) : false;

        return Inertia::render('Premiere/Show', [
            'project' => $project,
            'comments' => $comments,
            'suggestedVideos' => $suggestedVideos,
            'isOwner' => $isOwner,
            'hasLiked' => $hasLiked,
        ]);
    }

    /**
     * Update project metadata (owner or admin only)
     */
    public function update(Request $request, Project $project)
    {
        $user = Auth::user();
        $isAdmin = $user && method_exists($user, 'hasRole') && 
                   ($user->hasRole('admin') || $user->hasRole('super-admin'));

        if ($project->user_id !== Auth::id() && !$isAdmin) {
            abort(403);
        }

        $validated = $request->validate([
            'directors_note' => 'nullable|string|max:5000',
            'chapters' => 'nullable|array',
            'chapters.*.time' => 'required_with:chapters|integer|min:0',
            'chapters.*.title' => 'required_with:chapters|string|max:255',
            'tags' => 'nullable|array|max:10',
            'tags.*' => 'string|max:50',
        ]);

        $project->update($validated);

        return back()->with('success', 'Project updated successfully.');
    }

    /**
     * Like or unlike a project
     */
    public function toggleLike(Project $project)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Please log in to like videos.'], 401);
        }

        $user = Auth::user();
        $alreadyLiked = $project->likes()->where('user_id', $user->id)->exists();

        if ($alreadyLiked) {
            $project->likes()->detach($user->id);
            $project->decrement('likes_count');
            $hasLiked = false;
        } else {
            $project->likes()->attach($user->id);
            $project->increment('likes_count');
            $hasLiked = true;
        }

        return response()->json([
            'hasLiked' => $hasLiked,
            'likesCount' => $project->fresh()->likes_count,
        ]);
    }
}
