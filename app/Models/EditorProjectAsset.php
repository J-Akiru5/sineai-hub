<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class EditorProjectAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'editor_project_id',
        'user_file_id',
        'name',
        'path',
        'type',
        'size_bytes',
        'duration_ms',
        'width',
        'height',
        'metadata',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'duration_ms' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'metadata' => 'array',
    ];

    protected $appends = ['url', 'duration_seconds'];

    /**
     * Get the project this asset belongs to.
     */
    public function project()
    {
        return $this->belongsTo(EditorProject::class, 'editor_project_id');
    }

    /**
     * Get the user file this asset is linked to (if any).
     */
    public function userFile()
    {
        return $this->belongsTo(UserFile::class);
    }

    /**
     * Get the asset URL.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('digitalocean')->url($this->path);
    }

    /**
     * Get duration in seconds.
     */
    public function getDurationSecondsAttribute(): float
    {
        return $this->duration_ms ? $this->duration_ms / 1000 : 0;
    }
}
