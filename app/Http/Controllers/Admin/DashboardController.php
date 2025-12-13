<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ActivityLog;
use App\Models\User;
use App\Models\Project;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $recentLogs = ActivityLog::with('user')->latest()->take(10)->get();

        $totalUsers = User::count();
        $totalProjects = Project::count();

        $now = Carbon::now();
        $start = $now->copy()->subMonths(5)->startOfMonth(); // 6 months including current

        // Users over the last 6 months grouped by month
        $usersQuery = User::select(DB::raw("DATE_TRUNC('month', created_at) AS month"), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $start)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('count', 'month');

        $months = [];
        $userCounts = [];
        for ($i = 0; $i < 6; $i++) {
            $m = $start->copy()->addMonths($i);
            $label = $m->format('M Y');
            $months[] = $label;
            $key = $m->format('Y-m-01 00:00:00');
            $count = 0;
            foreach ($usersQuery as $k => $v) {
                // $k is Carbon timestamp string from DB, normalize
                $kLabel = Carbon::parse($k)->format('M Y');
                if ($kLabel === $label) {
                    $count = $v;
                    break;
                }
            }
            $userCounts[] = $count;
        }

        // Projects distribution by status
        $projectStatus = Project::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $projectStatusDistribution = $projectStatus->toArray();

        $newUsersThisMonth = User::whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->count();

        return Inertia::render('Admin/Dashboard', [
            'recentLogs' => $recentLogs,
            'totalUsers' => $totalUsers,
            'totalProjects' => $totalProjects,
            'newUsersThisMonth' => $newUsersThisMonth,
            'usersOverTime' => [
                'labels' => $months,
                'data' => $userCounts,
            ],
            'projectStatusDistribution' => $projectStatusDistribution,
        ]);
    }
}
