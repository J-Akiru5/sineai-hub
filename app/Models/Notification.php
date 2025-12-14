<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'icon',
        'link',
        'notifiable_type',
        'notifiable_id',
        'actor_id',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    // Notification types
    const TYPE_LIKE = 'like';
    const TYPE_COMMENT = 'comment';
    const TYPE_FOLLOW = 'follow';
    const TYPE_MENTION = 'mention';
    const TYPE_MESSAGE = 'message';
    const TYPE_SYSTEM = 'system';
    const TYPE_PROJECT_APPROVED = 'project_approved';
    const TYPE_PROJECT_REJECTED = 'project_rejected';
    const TYPE_CREATOR_VERIFIED = 'creator_verified';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function notifiable()
    {
        return $this->morphTo();
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Create a notification for a user
     */
    public static function notify(
        int $userId,
        string $type,
        string $title,
        ?string $message = null,
        ?string $link = null,
        ?Model $notifiable = null,
        ?int $actorId = null,
        ?array $data = null
    ): self {
        $icons = [
            self::TYPE_LIKE => 'heart',
            self::TYPE_COMMENT => 'message-circle',
            self::TYPE_FOLLOW => 'user-plus',
            self::TYPE_MENTION => 'at-sign',
            self::TYPE_MESSAGE => 'mail',
            self::TYPE_SYSTEM => 'bell',
            self::TYPE_PROJECT_APPROVED => 'check-circle',
            self::TYPE_PROJECT_REJECTED => 'x-circle',
            self::TYPE_CREATOR_VERIFIED => 'badge-check',
        ];

        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'icon' => $icons[$type] ?? 'bell',
            'link' => $link,
            'notifiable_type' => $notifiable ? get_class($notifiable) : null,
            'notifiable_id' => $notifiable?->id,
            'actor_id' => $actorId,
            'data' => $data,
        ]);
    }
}
