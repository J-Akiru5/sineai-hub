<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Project;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CreatorController extends Controller
{
    /**
     * Show public creator profile.
     */
    public function show(Request $request, $identifier)
    {
        // Find user by username or ID
        $creator = User::where('username', $identifier)
            ->orWhere('id', $identifier)
            ->firstOrFail();

        // Check privacy settings
        $settings = $creator->settings;
        $canView = true;
        
        if ($settings && $settings->profile_visibility === 'private') {
            $canView = auth()->check() && (auth()->id() === $creator->id || auth()->user()->isAdmin());
        } elseif ($settings && $settings->profile_visibility === 'followers') {
            $canView = auth()->check() && (
                auth()->id() === $creator->id || 
                auth()->user()->isAdmin() ||
                $creator->followers()->where('follower_id', auth()->id())->exists()
            );
        }

        if (!$canView) {
            return Inertia::render('Creator/Private', [
                'creator' => $creator->only(['id', 'name', 'username', 'avatar_url', 'is_verified_creator']),
            ]);
        }

        // Get public projects
        $projects = $creator->projects()
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->withCount('likes')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        // Stats
        $stats = [
            'projects_count' => $creator->projects()->where('visibility', 'public')->where('moderation_status', 'approved')->count(),
            'total_views' => $creator->projects()->sum('views_count'),
            'total_likes' => $creator->projects()->withCount('likes')->get()->sum('likes_count'),
            'followers_count' => $creator->followers_count,
            'following_count' => $creator->following_count,
        ];

        // Check if current user is following
        $isFollowing = auth()->check() ? auth()->user()->isFollowing($creator) : false;
        $isOwnProfile = auth()->check() && auth()->id() === $creator->id;

        return Inertia::render('Creator/Show', [
            'creator' => [
                'id' => $creator->id,
                'name' => $creator->name,
                'username' => $creator->username,
                'avatar_url' => $creator->avatar_url,
                'banner_url' => $creator->banner_url,
                'bio' => $creator->bio,
                'headline' => $creator->headline,
                'location' => $settings?->show_social_links !== false ? $creator->location : null,
                'website' => $settings?->show_social_links !== false ? $creator->website : null,
                'social_links' => $settings?->show_social_links !== false ? $creator->social_links : null,
                'is_verified_creator' => $creator->is_verified_creator,
                'created_at' => $creator->created_at,
            ],
            'projects' => $projects,
            'stats' => $stats,
            'isFollowing' => $isFollowing,
            'isOwnProfile' => $isOwnProfile,
        ]);
    }

    /**
     * Follow a creator.
     */
    public function follow(Request $request, User $user)
    {
        $request->user()->follow($user);
        
        return back()->with('success', "You are now following {$user->name}");
    }

    /**
     * Unfollow a creator.
     */
    public function unfollow(Request $request, User $user)
    {
        $request->user()->unfollow($user);
        
        return back()->with('success', "You unfollowed {$user->name}");
    }

    /**
     * Get creator's followers.
     */
    public function followers(Request $request, $identifier)
    {
        $creator = User::where('username', $identifier)
            ->orWhere('id', $identifier)
            ->firstOrFail();

        $followers = $creator->followers()
            ->select(['users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.is_verified_creator'])
            ->paginate(20);

        if ($request->wantsJson()) {
            return response()->json($followers);
        }

        return Inertia::render('Creator/Followers', [
            'creator' => $creator->only(['id', 'name', 'username', 'avatar_url']),
            'followers' => $followers,
        ]);
    }

    /**
     * Get creator's following.
     */
    public function following(Request $request, $identifier)
    {
        $creator = User::where('username', $identifier)
            ->orWhere('id', $identifier)
            ->firstOrFail();

        $following = $creator->following()
            ->select(['users.id', 'users.name', 'users.username', 'users.avatar_url', 'users.is_verified_creator'])
            ->paginate(20);

        if ($request->wantsJson()) {
            return response()->json($following);
        }

        return Inertia::render('Creator/Following', [
            'creator' => $creator->only(['id', 'name', 'username', 'avatar_url']),
            'following' => $following,
        ]);
    }
}
