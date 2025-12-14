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
        'video_path',
        'video_url',
        'thumbnail_path',
        'thumbnail_url',
        'status',
        'visibility',
        'moderation_status',
        'views_count',
        'category',
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
}
