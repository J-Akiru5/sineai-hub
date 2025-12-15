<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        // Notifications
        'notify_likes',
        'notify_comments',
        'notify_follows',
        'notify_mentions',
        'notify_messages',
        'notify_system',
        'notify_project_updates',
        'email_notifications',
        'push_notifications',
        'digest_frequency',
        // Privacy
        'profile_visibility',
        'show_email',
        'show_social_links',
        'allow_messages',
        'show_activity',
        'show_online_status',
        // Appearance
        'theme',
        'accent_color',
        'language',
        'reduce_motion',
        'reduced_motion',
        // Player
        'autoplay',
        'default_quality',
        'theater_mode',
        'playback_speed',
    ];

    protected $casts = [
        'notify_likes' => 'boolean',
        'notify_comments' => 'boolean',
        'notify_follows' => 'boolean',
        'notify_mentions' => 'boolean',
        'notify_messages' => 'boolean',
        'notify_system' => 'boolean',
        'notify_project_updates' => 'boolean',
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'show_email' => 'boolean',
        'show_social_links' => 'boolean',
        'allow_messages' => 'boolean',
        'show_activity' => 'boolean',
        'show_online_status' => 'boolean',
        'reduce_motion' => 'boolean',
        'reduced_motion' => 'boolean',
        'autoplay' => 'boolean',
        'theater_mode' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get default settings array
     */
    public static function defaults(): array
    {
        return [
            'notify_likes' => true,
            'notify_comments' => true,
            'notify_follows' => true,
            'notify_mentions' => true,
            'notify_messages' => true,
            'notify_system' => true,
            'notify_project_updates' => true,
            'email_notifications' => false,
            'push_notifications' => true,
            'digest_frequency' => 'daily',
            'profile_visibility' => 'public',
            'show_email' => false,
            'show_social_links' => true,
            'allow_messages' => true,
            'show_activity' => true,
            'show_online_status' => true,
            'theme' => 'dark',
            'accent_color' => 'amber',
            'language' => 'en',
            'reduce_motion' => false,
            'reduced_motion' => false,
            'autoplay' => true,
            'default_quality' => 'auto',
            'theater_mode' => false,
            'playback_speed' => '1',
        ];
    }
}
