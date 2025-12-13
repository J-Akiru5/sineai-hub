<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class Logger
{
    public static function log(string $action, string $description = null)
    {
        $user = Auth::user();

        ActivityLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'description' => $description,
            'ip_address' => Request::ip(),
        ]);
    }
}
