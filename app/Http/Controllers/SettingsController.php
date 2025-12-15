<?php

namespace App\Http\Controllers;

use App\Models\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Show settings page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $settings = $user->getOrCreateSettings();

        return Inertia::render('Settings/Index', [
            'user' => $user,
            'settings' => $settings,
        ]);
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $validated = $request->validate([
            'notify_likes' => 'boolean',
            'notify_comments' => 'boolean',
            'notify_follows' => 'boolean',
            'notify_mentions' => 'boolean',
            'notify_messages' => 'boolean',
            'notify_system' => 'boolean',
            'notify_project_updates' => 'boolean',
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'digest_frequency' => 'in:realtime,daily,weekly,never',
        ]);

        $settings = $request->user()->getOrCreateSettings();
        $settings->update($validated);

        return back()->with('success', 'Notification settings updated.');
    }

    /**
     * Update privacy settings.
     */
    public function updatePrivacy(Request $request)
    {
        $validated = $request->validate([
            'profile_visibility' => 'in:public,followers,private,hidden',
            'show_email' => 'boolean',
            'show_social_links' => 'boolean',
            'allow_messages' => 'in:everyone,followers,nobody',
            'show_activity' => 'boolean',
            'show_online_status' => 'boolean',
        ]);

        // Convert allow_messages to boolean if it's still expected as boolean in DB
        // Otherwise keep as string
        $settings = $request->user()->getOrCreateSettings();
        $settings->update($validated);

        return back()->with('success', 'Privacy settings updated.');
    }

    /**
     * Update appearance settings.
     */
    public function updateAppearance(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'in:dark,light,system',
            'accent_color' => 'in:amber,blue,emerald,rose,purple,orange',
            'language' => 'in:en,es,fr,de,ja,ko,zh',
            'reduce_motion' => 'boolean',
            'reduced_motion' => 'boolean',
        ]);

        $settings = $request->user()->getOrCreateSettings();
        $settings->update($validated);

        return back()->with('success', 'Appearance settings updated.');
    }

    /**
     * Update player settings.
     */
    public function updatePlayer(Request $request)
    {
        $validated = $request->validate([
            'autoplay' => 'boolean',
            'default_quality' => 'in:auto,2160,1080p,1080,720p,720,480p,480,360p,360',
            'theater_mode' => 'boolean',
            'playback_speed' => 'in:0.25,0.5,0.75,1,1.25,1.5,1.75,2',
        ]);

        $settings = $request->user()->getOrCreateSettings();
        $settings->update($validated);

        return back()->with('success', 'Player settings updated.');
    }

    /**
     * Update all settings at once.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            // Notifications
            'notify_likes' => 'boolean',
            'notify_comments' => 'boolean',
            'notify_follows' => 'boolean',
            'notify_mentions' => 'boolean',
            'notify_messages' => 'boolean',
            'notify_system' => 'boolean',
            'email_notifications' => 'boolean',
            // Privacy
            'profile_visibility' => 'in:public,followers,private',
            'show_email' => 'boolean',
            'show_social_links' => 'boolean',
            'allow_messages' => 'boolean',
            'show_activity' => 'boolean',
            // Appearance
            'theme' => 'in:dark,light,system',
            'accent_color' => 'in:amber,blue,emerald,rose,purple,orange',
            'reduce_motion' => 'boolean',
            // Player
            'autoplay' => 'boolean',
            'default_quality' => 'in:auto,1080p,720p,480p,360p',
            'theater_mode' => 'boolean',
        ]);

        $settings = $request->user()->getOrCreateSettings();
        $settings->update($validated);

        return back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Delete account.
     */
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Delete user's files from storage
        foreach ($user->files as $file) {
            Storage::disk('digitalocean')->delete($file->path);
        }

        // Log deletion
        activity()
            ->causedBy($user)
            ->withProperties(['email' => $user->email, 'name' => $user->name])
            ->log('Account deleted');

        // Delete user
        $user->delete();

        return redirect('/')->with('success', 'Your account has been deleted.');
    }

    /**
     * Export user data.
     */
    public function exportData(Request $request)
    {
        $user = $request->user();
        
        $data = [
            'profile' => $user->only(['name', 'email', 'username', 'bio', 'headline', 'location', 'website', 'created_at']),
            'projects' => $user->projects()->select(['title', 'description', 'visibility', 'views_count', 'created_at'])->get(),
            'scripts' => $user->scripts()->select(['title', 'genre', 'format', 'created_at'])->get(),
            'settings' => $user->settings,
        ];

        return response()->json($data)
            ->header('Content-Disposition', 'attachment; filename="sineai-data-export.json"');
    }
}
