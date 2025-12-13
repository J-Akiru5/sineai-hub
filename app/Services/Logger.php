<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class Logger
{
    /**
     * Log an activity.
     * Supports two signatures:
     *  - log($action, $description) => category defaults to 'SYSTEM'
     *  - log($category, $action, $description)
     */
    public static function log($a, $b = null, $c = null)
    {
        if ($c === null) {
            // two-arg form: action, description
            $category = 'SYSTEM';
            $action = $a;
            $description = $b;
        } else {
            $category = $a;
            $action = $b;
            $description = $c;
        }

        try {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'description' => $description,
                'category' => $category,
                'ip_address' => request()->ip(),
            ]);
        } catch (\Throwable $e) {
            // fail silently
        }
    }
}

