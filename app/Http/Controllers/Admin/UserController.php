<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a paginated listing of users with roles.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $status = $request->input('status'); // expected: 'all'|'active'|'banned'

        $query = User::with('roles')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q2) use ($search) {
                    $q2->where('name', 'LIKE', "%{$search}%")
                        ->orWhere('email', 'LIKE', "%{$search}%");
                });
            })
            ->when($roleFilter, function ($q) use ($roleFilter) {
                $q->whereHas('roles', function ($qr) use ($roleFilter) {
                    $qr->where('name', $roleFilter);
                });
            })
            ->when(in_array($status, ['active', 'banned']), function ($q) use ($status) {
                if ($status === 'banned') {
                    $q->where('is_banned', true);
                } else {
                    $q->where(function ($q2) {
                        $q2->whereNull('is_banned')->orWhere('is_banned', false);
                    });
                }
            });

        $users = $query->paginate(10)->appends($request->query());
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Update the user profile and roles.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'position' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
        ]);

        // Update basic info if provided
        if (!empty($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (!empty($validated['email'])) {
            $user->email = $validated['email'];
        }
        
        // Update position and tags
        $user->position = $validated['position'] ?? null;
        $user->tags = $validated['tags'] ?? null;
        $user->save();

        // Sync roles if provided
        if (isset($validated['roles'])) {
            $user->roles()->sync($validated['roles']);
        }

        try {
            \App\Services\Logger::log('USER_MGMT', 'USER_UPDATED', sprintf('%s updated user %s', auth()->user()?->name ?? 'System', $user->email));
        } catch (\Throwable $e) {
        }

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Toggle ban status for a user.
     */
    public function toggleBan(Request $request, User $user)
    {
        // Prevent banning yourself
        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'You cannot ban yourself.');
        }

        // Prevent banning administrators
        $roleNames = $user->roles->pluck('name')->map(fn($n) => Str::lower($n))->toArray();
        if (in_array('admin', $roleNames) || in_array('super-admin', $roleNames)) {
            return redirect()->back()->with('error', 'Cannot ban an administrator.');
        }

        // Flip the is_banned flag
        $user->is_banned = ! (bool) $user->is_banned;
        $user->save();

        // Log activity
        try {
            \App\Services\Logger::log('USER_MGMT', $user->is_banned ? 'USER_BANNED' : 'USER_UNBANNED', sprintf('%s %s user %s', auth()->user()?->name ?? 'System', $user->is_banned ? 'banned' : 'unbanned', $user->email));
        } catch (\Throwable $e) {
            // ignore logging errors
        }

        return redirect()->back()->with('success', 'User ban status updated.');
    }

    /**
     * Store a new user (manual onboarding).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'integer', 'exists:roles,id'],
            'position' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
        ]);

        // Default password (informational) - using a safe hashed default
        $defaultPassword = 'password';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($defaultPassword),
            'position' => $validated['position'] ?? null,
            'tags' => $validated['tags'] ?? null,
        ]);

        // Attach role
        $role = Role::find($validated['role']);
        if ($role) {
            $user->roles()->attach($role->id);
        }

        // Log creation
        try {
            \App\Services\Logger::log('USER_MGMT', 'USER_CREATED', sprintf('%s created user %s with role %s', auth()->user()?->name ?? 'System', $user->email, $role?->name ?? 'N/A'));
        } catch (\Throwable $e) {
        }

        return redirect()->back()->with('success', 'User created. Default password will be: password');
    }
}
