<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'directors_note',
        'video_path',
        'video_url',
        'thumbnail_path',
        'thumbnail_url',
        'status',
        'visibility',
        'moderation_status',
        'views_count',
        'likes_count',
        'category',
        'category_id',
        'duration',
        'release_year',
        'content_rating',
        'language',
        'chapters',
        'cast_crew',
        'tags',
        'is_featured',
    ];

    protected $casts = [
        'chapters' => 'array',
        'cast_crew' => 'array',
        'tags' => 'array',
        'is_featured' => 'boolean',
        'duration' => 'integer',
        'release_year' => 'integer',
        'views_count' => 'integer',
        'likes_count' => 'integer',
    ];

    // Note: do not append computed URL attributes. Use the raw `video_url` and
    // `thumbnail_url` database columns directly. Older implementations attempted
    // to generate Storage URLs via Storage::disk('supabase')->url(...), which
    // produced incorrect or duplicated URLs when the DB already stored the
    // absolute Supabase URL. Keep the model simple and return attributes as-is.

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function playlists()
    {
        return $this->belongsToMany(Playlist::class, 'playlist_project')->withPivot('sort_order');
    }

    public function flags()
    {
        return $this->hasMany(ContentFlag::class);
    }

    /**
     * Comments on the project.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Category relationship
     */
    public function categoryRelation(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Users who liked this project
     */
    public function likes()
    {
        return $this->belongsToMany(User::class, 'project_likes')->withTimestamps();
    }

    /**
     * Check if a user has liked this project
     */
    public function isLikedBy(?User $user): bool
    {
        if (!$user) return false;
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    /**
     * Format duration as HH:MM:SS
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration) return '00:00';
        
        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }
        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
