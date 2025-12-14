<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class EditorProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'thumbnail_path',
        'timeline_data',
        'settings',
        'status',
        'export_path',
        'duration_seconds',
    ];

    protected $casts = [
        'timeline_data' => 'array',
        'settings' => 'array',
        'duration_seconds' => 'integer',
    ];

    protected $appends = ['thumbnail_url', 'export_url', 'formatted_duration'];

    const STATUS_DRAFT = 'draft';
    const STATUS_RENDERING = 'rendering';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';

    /**
     * Default project settings.
     */
    const DEFAULT_SETTINGS = [
        'resolution' => '1080p',
        'width' => 1920,
        'height' => 1080,
        'framerate' => 30,
        'format' => 'mp4',
    ];

    /**
     * Get the user that owns this project.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the assets for this project.
     */
    public function assets()
    {
        return $this->hasMany(EditorProjectAsset::class);
    }

    /**
     * Get thumbnail URL.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) return null;
        return Storage::disk('digitalocean')->url($this->thumbnail_path);
    }

    /**
     * Get export video URL.
     */
    public function getExportUrlAttribute(): ?string
    {
        if (!$this->export_path) return null;
        return Storage::disk('digitalocean')->url($this->export_path);
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDurationAttribute(): string
    {
        $seconds = $this->duration_seconds;
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        $secs = $seconds % 60;
        
        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $secs);
        }
        return sprintf('%d:%02d', $minutes, $secs);
    }

    /**
     * Calculate total duration from timeline data.
     */
    public function calculateDuration(): int
    {
        if (!$this->timeline_data || empty($this->timeline_data['clips'])) {
            return 0;
        }
        
        $totalMs = 0;
        foreach ($this->timeline_data['clips'] as $clip) {
            $totalMs += $clip['duration'] ?? 0;
        }
        
        return (int) ceil($totalMs / 1000);
    }

    /**
     * Update duration from timeline.
     */
    public function syncDuration(): void
    {
        $this->update(['duration_seconds' => $this->calculateDuration()]);
    }

    /**
     * Scope for user's projects.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for draft projects.
     */
    public function scopeDrafts($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Scope for completed projects.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }
}
