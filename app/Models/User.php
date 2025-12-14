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
        'pen_name',
        'studio_name',
        'location',
        'contact_number',
        'is_approved',
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
}
