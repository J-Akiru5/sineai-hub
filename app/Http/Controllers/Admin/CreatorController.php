<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CreatorController extends Controller
{
    /**
     * Display a listing of all creators/users for admin management.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->withCount(['projects', 'followers', 'following']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('username', 'ilike', "%{$search}%");
            });
        }

        // Verification status filter
        if ($request->filled('verified')) {
            if ($request->verified === 'verified') {
                $query->whereNotNull('creator_verified_at');
            } elseif ($request->verified === 'unverified') {
                $query->whereNull('creator_verified_at');
            }
        }

        // Sort
        $sortBy = $request->get('sort', 'created_at');
        $sortDir = $request->get('direction', 'desc');
        
        $allowedSorts = ['name', 'email', 'created_at', 'followers_count', 'projects_count'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        }

        $creators = $query->paginate(20)->withQueryString();

        // Statistics
        $stats = [
            'total_creators' => User::count(),
            'verified_creators' => User::whereNotNull('creator_verified_at')->count(),
            'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            'with_projects' => User::has('projects')->count(),
        ];

        return Inertia::render('Admin/Creators/Index', [
            'creators' => $creators,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'verified' => $request->verified,
                'sort' => $sortBy,
                'direction' => $sortDir,
            ],
        ]);
    }

    /**
     * Toggle creator verification status.
     */
    public function toggleVerification(Request $request, User $user)
    {
        $wasVerified = $user->is_verified_creator;

        if ($wasVerified) {
            $user->update([
                'is_verified_creator' => false,
                'creator_verified_at' => null,
            ]);
            $message = 'Creator verification removed.';
        } else {
            $user->update([
                'is_verified_creator' => true,
                'creator_verified_at' => now(),
            ]);
            $message = 'Creator has been verified.';
        }

        // Log the activity
        activity()
            ->causedBy($request->user())
            ->performedOn($user)
            ->withProperties([
                'action' => $wasVerified ? 'unverify' : 'verify',
                'admin_id' => $request->user()->id,
            ])
            ->log($wasVerified ? 'Creator verification removed' : 'Creator verified');

        // Optionally notify the user
        \App\Models\Notification::notify(
            $user,
            $wasVerified 
                ? \App\Models\Notification::TYPE_SYSTEM 
                : \App\Models\Notification::TYPE_ACHIEVEMENT,
            $wasVerified 
                ? 'Your creator verification has been removed.' 
                : 'Congratulations! Your account has been verified as a creator.',
            'Your verification status has been updated.',
            $request->user()
        );

        return back()->with('success', $message);
    }
}
