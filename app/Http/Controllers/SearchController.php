<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\SearchHistory;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'query' => ['required', 'string'],
        ]);

        $query = $request->query('query');

        // Persist search for authenticated users
        if (auth()->check()) {
            try {
                SearchHistory::create([
                    'user_id' => auth()->id(),
                    'query' => $query,
                ]);
            } catch (\Throwable $e) {
                // ignore logging failures
            }
        }

        $paginatedResults = Project::with('user')
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Search/Index', [
            'results' => $paginatedResults,
            'query' => $query,
        ]);
    }
}
