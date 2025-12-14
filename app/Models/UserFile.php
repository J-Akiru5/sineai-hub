<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class UserFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'path',
        'disk',
        'mime_type',
        'size_bytes',
        'type',
        'folder',
        'metadata',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'metadata' => 'array',
    ];

    protected $appends = ['url', 'formatted_size'];

    /**
     * Get the user that owns this file.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the public URL for this file.
     */
    public function getUrlAttribute(): string
    {
        // Use CDN URL for DigitalOcean Spaces
        if ($this->disk === 'digitalocean') {
            $bucket = config('filesystems.disks.digitalocean.bucket');
            $region = config('filesystems.disks.digitalocean.region', 'sgp1');
            return "https://{$bucket}.{$region}.cdn.digitaloceanspaces.com/{$this->path}";
        }
        
        return Storage::disk($this->disk)->url($this->path);
    }

    /**
     * Get formatted file size.
     */
    public function getFormattedSizeAttribute(): string
    {
        return $this->formatBytes($this->size_bytes);
    }

    /**
     * Determine file type from mime type.
     */
    public static function determineType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }
        if (in_array($mimeType, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/rtf',
        ])) {
            return 'document';
        }
        return 'other';
    }

    /**
     * Format bytes to human readable string.
     */
    protected function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Delete the file from storage when model is deleted.
     */
    protected static function booted()
    {
        static::deleting(function (UserFile $file) {
            // Delete from storage
            Storage::disk($file->disk)->delete($file->path);
            
            // Update user quota
            $quota = $file->user->storageQuota;
            if ($quota) {
                $quota->removeUsage($file->size_bytes);
            }
        });
    }

    /**
     * Scope for filtering by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by folder.
     */
    public function scopeInFolder($query, ?string $folder)
    {
        return $query->where('folder', $folder);
    }
}
