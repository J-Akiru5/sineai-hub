<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ThumbnailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ProjectController extends Controller
{
    public function store(Request $request)
    {
        // Allow longer-running uploads (5 minutes) to prevent cURL timeout for large files
        @set_time_limit(300);

        // Validate the incoming request data
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video' => 'required|file|mimetypes:video/mp4,video/quicktime|max:512000', // max 500MB
            'thumbnail' => 'nullable|image|max:2048', // optional thumbnail, max 2MB
            'is_premiere_public' => 'boolean',
            'category' => 'nullable|string',
            'visibility' => ['nullable', 'in:private,unlisted,public'],
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // handle file upload to DigitalOcean Spaces
        // We will store the files in a directory named after the user's ID
        $videoPath = $request->file('video')->store('user-' . $user->id, 'digitalocean');

        // Get the CDN endpoint from the .env file and append the file path.
        $bucket = env('DO_SPACES_BUCKET');
        $videoUrl = "https://{$bucket}.sgp1.cdn.digitaloceanspaces.com/{$videoPath}";

        $thumbnailUrl = null;
        if ($request->hasFile('thumbnail')) {
            $thumbPath = $request->file('thumbnail')->store('user-' . $user->id, 'digitalocean');
            $endpoint = env('DO_SPACES_ENDPOINT');
            $thumbnailUrl = "https://{$bucket}.sgp1.cdn.digitaloceanspaces.com/{$thumbPath}";
        } else {
            // Auto-generate thumbnail from video using FFmpeg
            try {
                $thumbnailUrl = ThumbnailService::generateFromVideo($videoUrl, $user->id);
            } catch (\Exception $e) {
                Log::warning('Auto-thumbnail generation failed: ' . $e->getMessage());
            }
        }

        // Determine flags/metadata
        $isPremierePublic = $request->boolean('is_premiere_public', false);
        $category = $validated['category'] ?? null;
        $visibility = $validated['visibility'] ?? 'private';

        // Create a new project record in the database
        $project = $user->projects()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'video_url' => $videoUrl,
            'thumbnail_url' => $thumbnailUrl,
            'is_premiere_public' => $isPremierePublic,
            'category' => $category,
            'visibility' => $visibility,
            // 'status' defaults to 'published' as per our schema
        ]);

        // Redirect the user back to the projects page with a success message
        try {
            // Log project creation
            try {
                \App\Services\Logger::log('CONTENT', 'Project Uploaded', "User " . auth()->user()?->name . " uploaded a new project: {$project->title}");
            } catch (\Throwable $logEx) {
            }

            return Redirect::route('premiere.index')->with('success', 'Project created successfully!');
        } catch (\Exception $e) {
            // Log the error
            \Illuminate\Support\Facades\Log::error('Project store error: ' . $e->getMessage(), [
            'exception' => $e,
            'user_id' => isset($user) ? $user->id : null,
            'video_path' => isset($videoPath) ? $videoPath : null,
            'thumb_path' => isset($thumbPath) ? $thumbPath : null,
            ]);

            // Attempt to remove the uploaded file if it exists to avoid orphaned uploads
            try {
                if (isset($videoPath) && Storage::disk('digitalocean')->exists($videoPath)) {
                    Storage::disk('digitalocean')->delete($videoPath);
                }
                if (isset($thumbPath) && Storage::disk('digitalocean')->exists($thumbPath)) {
                    Storage::disk('digitalocean')->delete($thumbPath);
                }
            } catch (\Exception $deleteEx) {
                \Illuminate\Support\Facades\Log::error('Failed to delete uploaded file after project store error: ' . $deleteEx->getMessage());
            }

            // Redirect back with input and an error message
            return Redirect::back()->withInput()->with('error', 'An unexpected error occurred while creating the project. Please try again.');
        }
    }

    public function create()
    {
        // Load categories for dropdown
        $categories = \App\Models\Category::active()->ordered()->get(['id', 'name', 'slug', 'icon']);

        return Inertia::render('Projects/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Display a single project.
     */
    public function show(Project $project)
    {
        // eager load user relation and scripts for the frontend
        $project->load(['user', 'scripts' => function ($query) {
            $query->latest()->select('id', 'title', 'project_id', 'created_at', 'updated_at');
        }]);

        // Access control: if not owner, ensure public & approved
        $userId = Auth::id();
        if ($userId !== $project->user_id) {
            if ($project->visibility !== 'public' || $project->moderation_status !== 'approved') {
                abort(403);
            }
        }

        // Increment view count
        try {
            $project->increment('views_count');
        } catch (\Exception $e) {
            Log::warning('Failed to increment project views: ' . $e->getMessage());
        }

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * @deprecated Projects index is now handled by PremiereController
     * This method redirects to Premiere for backwards compatibility
     */
    public function index()
    {
        return Redirect::route('premiere.index');
    }

    /**
     * Return all projects for the authenticated user (dashboard).
     */
    public function myProjects()
    {
        $projects = Project::with('user')->where('user_id', Auth::id())->latest()->paginate(10)->withQueryString();

        return Inertia::render('Projects/MyProjects', [
            'projects' => $projects,
        ]);
    }

    /**
     * Delete a project and its associated files.
     */
    public function destroy(Project $project)
    {
        $user = Auth::user();
        $isAdmin = $user && method_exists($user, 'hasRole') && 
                   ($user->hasRole('admin') || $user->hasRole('super-admin'));
        
        // Only owner or admin can delete
        if (Auth::id() !== $project->user_id && !$isAdmin) {
            abort(403);
        }

        // Attempt to remove stored files from DigitalOcean
        try {
            $endpoint = rtrim(env('DO_SPACES_ENDPOINT', ''), '/');

            if (!empty($project->video_url)) {
                $videoPath = str_replace($endpoint . '/', '', $project->video_url);
                if ($videoPath && Storage::disk('digitalocean')->exists($videoPath)) {
                    Storage::disk('digitalocean')->delete($videoPath);
                }
            }

            if (!empty($project->thumbnail_url)) {
                $thumbPath = str_replace($endpoint . '/', '', $project->thumbnail_url);
                if ($thumbPath && Storage::disk('digitalocean')->exists($thumbPath)) {
                    Storage::disk('digitalocean')->delete($thumbPath);
                }
            }
        } catch (\Exception $e) {
            // Log but continue with DB deletion
            \Illuminate\Support\Facades\Log::warning('Failed to delete project files: ' . $e->getMessage());
        }

        $project->delete();

        return Redirect::route('premiere.index')->with('success', 'Project deleted.');
    }

    /**
     * Show edit form for a project.
     */
    public function edit(Project $project)
    {
        $user = Auth::user();
        $isAdmin = $user && method_exists($user, 'hasRole') && 
                   ($user->hasRole('admin') || $user->hasRole('super-admin'));
        
        // Only owner or admin can edit
        if (Auth::id() !== $project->user_id && !$isAdmin) {
            abort(403);
        }

        $project->load('user');
        
        // Load categories for dropdown
        $categories = \App\Models\Category::active()->ordered()->get(['id', 'name', 'slug', 'icon']);

        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'categories' => $categories,
        ]);
    }

    /**
     * Update project details.
     */
    public function update(Request $request, Project $project)
    {
        $user = Auth::user();
        $isAdmin = $user && method_exists($user, 'hasRole') && 
                   ($user->hasRole('admin') || $user->hasRole('super-admin'));
        
        if (Auth::id() !== $project->user_id && !$isAdmin) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'directors_note' => 'nullable|string',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime|max:512000',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'category' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'visibility' => ['nullable', 'in:private,unlisted,public'],
            'release_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 5),
            'content_rating' => 'nullable|string|max:10',
            'language' => 'nullable|string|max:50',
            'cast_crew' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        // Update text fields
        $project->title = $validated['title'];
        $project->description = $validated['description'] ?? null;
        $project->directors_note = $validated['directors_note'] ?? null;
        $project->category = $validated['category'] ?? null;
        $project->category_id = $validated['category_id'] ?? null;
        $project->visibility = $validated['visibility'] ?? 'private';
        $project->release_year = $validated['release_year'] ?? null;
        $project->content_rating = $validated['content_rating'] ?? null;
        $project->language = $validated['language'] ?? null;
        $project->cast_crew = $validated['cast_crew'] ?? null;
        $project->tags = $validated['tags'] ?? null;

        $bucket = env('DO_SPACES_BUCKET');

        // Optional video upload
        if ($request->hasFile('video')) {
            // Delete old video if present
            $oldVideoPath = $this->extractPathFromUrl($project->video_url);
            if ($oldVideoPath && Storage::disk('digitalocean')->exists($oldVideoPath)) {
                Storage::disk('digitalocean')->delete($oldVideoPath);
            }

            $videoPath = $request->file('video')->store('user-' . Auth::id(), 'digitalocean');
            $project->video_url = "https://{$bucket}.sgp1.cdn.digitaloceanspaces.com/{$videoPath}";
            
            // Auto-generate thumbnail if none uploaded
            if (!$request->hasFile('thumbnail') && !$project->thumbnail_url) {
                // We'll let the frontend handle this or generate a placeholder
            }
        }

        // Optional thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $oldThumbPath = $this->extractPathFromUrl($project->thumbnail_url);
            if ($oldThumbPath && Storage::disk('digitalocean')->exists($oldThumbPath)) {
                Storage::disk('digitalocean')->delete($oldThumbPath);
            }

            $thumbPath = $request->file('thumbnail')->store('user-' . Auth::id() . '/thumbnails', 'digitalocean');
            $project->thumbnail_url = "https://{$bucket}.sgp1.cdn.digitaloceanspaces.com/{$thumbPath}";
        }

        $project->save();

        return to_route('projects.my')->with('success', 'Project updated successfully!');
    }

    /**
     * Extract path from DO Spaces URL.
     */
    private function extractPathFromUrl(?string $url): ?string
    {
        if (!$url) return null;
        
        $bucket = env('DO_SPACES_BUCKET');
        $pattern = "https://{$bucket}.sgp1.cdn.digitaloceanspaces.com/";
        
        if (str_starts_with($url, $pattern)) {
            return substr($url, strlen($pattern));
        }
        
        // Try alternative endpoint format
        $endpoint = env('DO_SPACES_ENDPOINT');
        if ($endpoint && str_starts_with($url, $endpoint)) {
            return substr($url, strlen($endpoint) + 1);
        }
        
        return null;
    }
}
