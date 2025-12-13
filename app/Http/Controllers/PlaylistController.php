<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class PlaylistController extends Controller
{
    public function index(Request $request)
    {
        $playlists = Playlist::withCount('projects')
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Return JSON for AJAX requests (used by "Add to Playlist" modal)
        if ($request->wantsJson() || $request->acceptsJson()) {
            return response()->json($playlists);
        }

        return Inertia::render('Playlists/Index', [
            'playlists' => $playlists,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => ['nullable', 'in:public,private,unlisted'],
        ]);

        $playlist = Playlist::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'] ?? 'public',
        ]);

        return Redirect::back()->with('success', 'Playlist created.');
    }

    public function update(Request $request, Playlist $playlist)
    {
        if ($playlist->user_id !== Auth::id()) abort(403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'visibility' => ['nullable', 'in:public,private,unlisted'],
        ]);

        $playlist->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'] ?? $playlist->visibility,
        ]);

        return Redirect::back()->with('success', 'Playlist updated.');
    }

    public function destroy(Playlist $playlist)
    {
        if ($playlist->user_id !== Auth::id()) abort(403);
        $playlist->delete();
        return Redirect::back()->with('success', 'Playlist deleted.');
    }

    public function addProject(Request $request, Playlist $playlist)
    {
        if ($playlist->user_id !== Auth::id()) abort(403);

        $validated = $request->validate([
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'sort_order' => ['nullable', 'integer'],
        ]);

        $projectId = $validated['project_id'];
        $sortOrder = $validated['sort_order'] ?? 0;

        // Prevent duplicate
        if ($playlist->projects()->where('project_id', $projectId)->exists()) {
            return Redirect::back()->with('info', 'Project is already in playlist.');
        }

        $playlist->projects()->attach($projectId, ['sort_order' => $sortOrder]);

        return Redirect::back()->with('success', 'Project added to playlist.');
    }
}
