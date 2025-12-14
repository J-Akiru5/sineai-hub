<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\SearchHistory;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
        ]);

        $query = trim($request->query('query', ''));
        
        // If no query, show trending/popular results
        if (empty($query)) {
            $paginatedResults = Project::with('user')
                ->where('visibility', 'public')
                ->where('moderation_status', 'approved')
                ->orderByDesc('views_count')
                ->paginate(12)
                ->withQueryString();

            return Inertia::render('Search/Index', [
                'results' => $paginatedResults,
                'query' => '',
                'suggestions' => $this->getTrendingSearches(),
            ]);
        }

        // Persist search for authenticated users
        if (auth()->check()) {
            try {
                SearchHistory::updateOrCreate(
                    ['user_id' => auth()->id(), 'query' => strtolower($query)],
                    ['updated_at' => now()]
                );
            } catch (\Throwable $e) {
                // ignore logging failures
            }
        }

        // Case-insensitive fuzzy search (YouTube-like)
        $searchTerms = preg_split('/\s+/', strtolower($query));
        
        $paginatedResults = Project::with(['user', 'categoryRelation'])
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->where(function ($q) use ($searchTerms, $query) {
                // Full phrase match (highest priority via ordering)
                $q->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($query) . '%'])
                  ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($query) . '%'])
                  ->orWhereRaw('LOWER(category) LIKE ?', ['%' . strtolower($query) . '%']);
                
                // Individual term matches
                foreach ($searchTerms as $term) {
                    if (strlen($term) >= 2) {
                        $q->orWhereRaw('LOWER(title) LIKE ?', ['%' . $term . '%'])
                          ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $term . '%']);
                    }
                }
                
                // Search in JSON tags field
                $q->orWhereRaw("LOWER(COALESCE(tags, '[]')) LIKE ?", ['%' . strtolower($query) . '%']);
            })
            // Order by relevance: exact title match first, then views
            ->orderByRaw("CASE WHEN LOWER(title) = ? THEN 0 WHEN LOWER(title) LIKE ? THEN 1 ELSE 2 END", [
                strtolower($query),
                strtolower($query) . '%'
            ])
            ->orderByDesc('views_count')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Search/Index', [
            'results' => $paginatedResults,
            'query' => $query,
            'suggestions' => $this->getSearchSuggestions($query),
        ]);
    }

    /**
     * Get search suggestions based on partial query
     */
    public function suggestions(Request $request)
    {
        $query = trim($request->query('q', ''));
        
        if (strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = $this->getSearchSuggestions($query);
        
        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Get trending searches
     */
    private function getTrendingSearches(): array
    {
        return SearchHistory::select('query', DB::raw('COUNT(*) as count'))
            ->groupBy('query')
            ->orderByDesc('count')
            ->limit(10)
            ->pluck('query')
            ->toArray();
    }

    /**
     * Get search suggestions from titles and categories
     */
    private function getSearchSuggestions(string $query): array
    {
        $suggestions = [];
        
        // Title suggestions
        $titles = Project::where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($query) . '%'])
            ->limit(5)
            ->pluck('title')
            ->toArray();
        
        $suggestions = array_merge($suggestions, $titles);

        // Category suggestions
        $categories = Project::where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->whereRaw('LOWER(category) LIKE ?', ['%' . strtolower($query) . '%'])
            ->distinct()
            ->limit(3)
            ->pluck('category')
            ->filter()
            ->toArray();
        
        $suggestions = array_merge($suggestions, $categories);

        return array_unique(array_slice($suggestions, 0, 8));
    }
}
