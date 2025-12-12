<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Script;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with recent projects and scripts.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();

        $recentProjects = Project::where('user_id', $userId)
            ->latest()
            ->take(3)
            ->get();

        $recentScripts = Script::where('user_id', $userId)
            ->latest()
            ->take(3)
            ->get();

        return Inertia::render('Dashboard', [
            'recentProjects' => $recentProjects,
            'recentScripts' => $recentScripts,
        ]);
    }
}

