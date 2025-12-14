<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $stats = [
            'projects_count' => $user->projects()->count(),
            'scripts_count' => $user->scripts()->count(),
            'followers_count' => $user->followers_count ?? 0,
            'following_count' => $user->following_count ?? 0,
            'total_views' => $user->projects()->sum('views_count'),
        ];

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'stats' => $stats,
            'settings' => $user->getOrCreateSettings(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:30', 'alpha_dash', Rule::unique('users')->ignore($user->id)],
            'bio' => ['nullable', 'string', 'max:500'],
            'headline' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'url', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'social_links.twitter' => ['nullable', 'string', 'max:255'],
            'social_links.instagram' => ['nullable', 'string', 'max:255'],
            'social_links.youtube' => ['nullable', 'string', 'max:255'],
            'social_links.tiktok' => ['nullable', 'string', 'max:255'],
            'social_links.linkedin' => ['nullable', 'string', 'max:255'],
        ]);

        // Fill validated fields
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Handle avatar upload if present
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'digitalocean');

            // Attempt to delete old avatar if present
            if ($old = $user->avatar_url) {
                try {
                    $oldPath = parse_url($old, PHP_URL_PATH);
                    if ($oldPath) {
                        $oldKey = ltrim($oldPath, '/');
                        if (Storage::disk('digitalocean')->exists($oldKey)) {
                            Storage::disk('digitalocean')->delete($oldKey);
                        }
                    }
                } catch (\Exception $e) {
                    // ignore deletion errors
                }
            }

            // Construct the correct CDN URL for DigitalOcean Spaces
            $bucket = env('DO_SPACES_BUCKET');
            $region = env('DO_SPACES_REGION', 'sgp1');
            $avatarUrl = "https://{$bucket}.{$region}.cdn.digitaloceanspaces.com/{$path}";
            $user->avatar_url = $avatarUrl;
        }

        // Handle banner upload if present
        if ($request->hasFile('banner')) {
            $file = $request->file('banner');
            $path = $file->store('banners', 'digitalocean');

            // Delete old banner
            if ($old = $user->banner_url) {
                try {
                    $oldPath = parse_url($old, PHP_URL_PATH);
                    if ($oldPath) {
                        $oldKey = ltrim($oldPath, '/');
                        if (Storage::disk('digitalocean')->exists($oldKey)) {
                            Storage::disk('digitalocean')->delete($oldKey);
                        }
                    }
                } catch (\Exception $e) {}
            }

            $bucket = env('DO_SPACES_BUCKET');
            $region = env('DO_SPACES_REGION', 'sgp1');
            $user->banner_url = "https://{$bucket}.{$region}.cdn.digitaloceanspaces.com/{$path}";
        }

        $user->save();

        // Log profile update
        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->withProperties(['updated_fields' => array_keys($validated)])
            ->log('Profile updated');

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current-password'],
        ]);

        $user = $request->user();

        // Log deletion
        activity()
            ->causedBy($user)
            ->withProperties(['email' => $user->email, 'name' => $user->name])
            ->log('Account deleted');

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
