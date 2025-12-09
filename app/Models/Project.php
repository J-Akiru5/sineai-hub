<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'status',
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
}
