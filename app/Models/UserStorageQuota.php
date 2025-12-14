<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserStorageQuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quota_bytes',
        'used_bytes',
    ];

    protected $casts = [
        'quota_bytes' => 'integer',
        'used_bytes' => 'integer',
    ];

    /**
     * Default quota: 1GB in bytes
     */
    const DEFAULT_QUOTA = 1073741824;

    /**
     * Get the user that owns this quota.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get remaining storage in bytes.
     */
    public function getRemainingBytesAttribute(): int
    {
        return max(0, $this->quota_bytes - $this->used_bytes);
    }

    /**
     * Get usage percentage.
     */
    public function getUsagePercentAttribute(): float
    {
        if ($this->quota_bytes === 0) return 100;
        return round(($this->used_bytes / $this->quota_bytes) * 100, 2);
    }

    /**
     * Check if user can store file of given size.
     */
    public function canStore(int $bytes): bool
    {
        return $this->remaining_bytes >= $bytes;
    }

    /**
     * Add bytes to used storage.
     */
    public function addUsage(int $bytes): void
    {
        $this->increment('used_bytes', $bytes);
    }

    /**
     * Remove bytes from used storage.
     */
    public function removeUsage(int $bytes): void
    {
        $newUsed = max(0, $this->used_bytes - $bytes);
        $this->update(['used_bytes' => $newUsed]);
    }

    /**
     * Get formatted quota string.
     */
    public function getFormattedQuotaAttribute(): string
    {
        return $this->formatBytes($this->quota_bytes);
    }

    /**
     * Get formatted used string.
     */
    public function getFormattedUsedAttribute(): string
    {
        return $this->formatBytes($this->used_bytes);
    }

    /**
     * Get formatted remaining string.
     */
    public function getFormattedRemainingAttribute(): string
    {
        return $this->formatBytes($this->remaining_bytes);
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
}
