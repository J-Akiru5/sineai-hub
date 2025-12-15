<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'user_agent',
        'page',
        'referrer',
        'country',
        'city',
        'user_id',
        'visit_date',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    /**
     * Get the user that made the visit (if authenticated).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get total visits count.
     */
    public static function getTotalVisits(): int
    {
        return static::count();
    }

    /**
     * Get today's visits count.
     */
    public static function getTodayVisits(): int
    {
        return static::whereDate('visit_date', today())->count();
    }

    /**
     * Get unique visitors today (by IP).
     */
    public static function getUniqueVisitorsToday(): int
    {
        return static::whereDate('visit_date', today())
            ->distinct('ip_address')
            ->count('ip_address');
    }

    /**
     * Get visits for the last N days.
     */
    public static function getVisitsLastDays(int $days = 7): array
    {
        $data = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $count = static::whereDate('visit_date', $date)->count();
            $data[] = [
                'date' => $date,
                'label' => now()->subDays($i)->format('M j'),
                'count' => $count,
            ];
        }
        return $data;
    }
}
