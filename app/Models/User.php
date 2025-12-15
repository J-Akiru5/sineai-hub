<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
        'banner_url',
        'pen_name',
        'studio_name',
        'location',
        'contact_number',
        'is_approved',
        'position',
        'tags',
        // Creator profile fields
        'username',
        'bio',
        'headline',
        'website',
        'social_links',
        'is_verified_creator',
        'creator_verified_at',
        'followers_count',
        'following_count',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'tags' => 'array',
        'social_links' => 'array',
        'is_verified_creator' => 'boolean',
        'creator_verified_at' => 'datetime',
    ];

    /**
     * Get the projects for the user.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get comments made by the user.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get search histories for the user.
     */
    public function searchHistories(): HasMany
    {
        return $this->hasMany(SearchHistory::class);
    }

    /**
     * Get the conversations for the user.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * The roles that belong to the user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_has_roles');
    }

    /**
     * Check if user has a role by slug or name.
     */
    public function hasRole($slug)
    {
        if (!$this->relationLoaded('roles')) {
            $this->load('roles');
        }

        return $this->roles->contains(function ($role) use ($slug) {
            return isset($role->slug) ? $role->slug === $slug : ($role->name === $slug || $role->name === ($slug));
        });
    }

    /**
     * Convenience helper to check for admin role.
     */
    public function isAdmin()
    {
        return $this->hasRole('admin') || $this->hasRole('super-admin');
    }

    /**
     * Get the user's storage quota.
     */
    public function storageQuota()
    {
        return $this->hasOne(UserStorageQuota::class);
    }

    /**
     * Get or create storage quota for user.
     */
    public function getOrCreateStorageQuota(): UserStorageQuota
    {
        return $this->storageQuota ?? $this->storageQuota()->create([
            'quota_bytes' => UserStorageQuota::DEFAULT_QUOTA,
            'used_bytes' => 0,
        ]);
    }

    /**
     * Get the user's files.
     */
    public function files(): HasMany
    {
        return $this->hasMany(UserFile::class);
    }

    /**
     * Get the user's editor projects.
     */
    public function editorProjects(): HasMany
    {
        return $this->hasMany(EditorProject::class);
    }

    /**
     * Get the user's playlists.
     */
    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class);
    }

    /**
     * Get the user's notifications.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->unread()->count();
    }

    /**
     * Get the user's settings.
     */
    public function settings()
    {
        return $this->hasOne(UserSetting::class);
    }

    /**
     * Get or create user settings.
     */
    public function getOrCreateSettings(): UserSetting
    {
        return $this->settings ?? $this->settings()->create(UserSetting::defaults());
    }

    /**
     * Users this user follows.
     */
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    /**
     * Users who follow this user.
     */
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * Check if user is following another user.
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    /**
     * Follow a user.
     */
    public function follow(User $user): void
    {
        if ($this->id === $user->id) return; // Can't follow yourself
        
        if (!$this->isFollowing($user)) {
            $this->following()->attach($user->id);
            $this->increment('following_count');
            $user->increment('followers_count');
            
            // Create notification
            Notification::notify(
                $user->id,
                Notification::TYPE_FOLLOW,
                "{$this->name} started following you",
                null,
                route('creator.show', $this->username ?? $this->id),
                $this,
                $this->id
            );
        }
    }

    /**
     * Unfollow a user.
     */
    public function unfollow(User $user): void
    {
        if ($this->isFollowing($user)) {
            $this->following()->detach($user->id);
            $this->decrement('following_count');
            $user->decrement('followers_count');
        }
    }

    /**
     * Get scripts for this user.
     */
    public function scripts(): HasMany
    {
        return $this->hasMany(Script::class);
    }

    /**
     * Accessor for display name (username or name).
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->username ?? $this->name;
    }

    /**
     * Get the profile URL.
     */
    public function getProfileUrlAttribute(): string
    {
        return route('creator.show', $this->username ?? $this->id);
    }
}
