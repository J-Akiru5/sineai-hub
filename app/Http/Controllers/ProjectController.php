<?php

namespace App\Http\Controllers;

use App\Models\Project;
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

            return Redirect::route('projects.index')->with('success', 'Project created successfully!');
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
        return Inertia::render('Projects/Create');
    }

    /**
     * Display a single project.
     */
    public function show(Project $project)
    {
        // eager load user relation for the frontend
        $project->load('user');

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

    public function index()
    {
        // Only return projects that are public and approved for the public gallery
        $projects = Project::with('user')
            ->where('visibility', 'public')
            ->where('moderation_status', 'approved')
            ->latest()
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
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
        // Only owner can delete
        if (Auth::id() !== $project->user_id) {
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

        return Redirect::route('projects.index')->with('success', 'Project deleted.');
    }

    /**
     * Show edit form for a project.
     */
    public function edit(Project $project)
    {
        // Only owner can edit
        if (Auth::id() !== $project->user_id) {
            abort(403);
        }

        $project->load('user');

        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    /**
     * Update project details.
     */
    public function update(Request $request, Project $project)
    {
        // Ensure only owner can update
        if (Auth::id() !== $project->user_id) {
            abort(403);
        }

        // Validate basic fields; files are optional
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_premiere_public' => 'boolean',
            'category' => 'nullable|string',
            'visibility' => ['nullable', 'in:private,unlisted,public'],
        ]);

        @set_time_limit(300);

        // Handle video upload explicitly if provided
        if ($request->hasFile('video')) {
            $user = Auth::user();
            $videoPath = $request->file('video')->store('user-' . $user->id, 'digitalocean');
            $endpoint = rtrim(env('DO_SPACES_ENDPOINT', ''), '/');
            $project->video_url = $endpoint ? "{$endpoint}/{$videoPath}" : $videoPath;

            // attempt to delete previous video file
            try {
                if (!empty($project->getOriginal('video_url'))) {
                    $oldPath = str_replace($endpoint . '/', '', $project->getOriginal('video_url'));
                    if ($oldPath && Storage::disk('digitalocean')->exists($oldPath)) {
                        Storage::disk('digitalocean')->delete($oldPath);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to delete previous video: ' . $e->getMessage());
            }
        }

        // Handle thumbnail upload explicitly if provided
        if ($request->hasFile('thumbnail')) {
            $user = isset($user) ? $user : Auth::user();
            $thumbPath = $request->file('thumbnail')->store('user-' . $user->id, 'digitalocean');
            $endpoint = rtrim(env('DO_SPACES_ENDPOINT', ''), '/');
            $project->thumbnail_url = $endpoint ? "{$endpoint}/{$thumbPath}" : $thumbPath;

            // attempt to delete previous thumbnail
            try {
                if (!empty($project->getOriginal('thumbnail_url'))) {
                    $oldThumb = str_replace($endpoint . '/', '', $project->getOriginal('thumbnail_url'));
                    if ($oldThumb && Storage::disk('digitalocean')->exists($oldThumb)) {
                        Storage::disk('digitalocean')->delete($oldThumb);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to delete previous thumbnail: ' . $e->getMessage());
            }
        }

        // Persist validated and other scalar fields
        $project->title = $validated['title'];
        $project->description = $validated['description'] ?? null;
        $project->category = $validated['category'] ?? null;
        $project->visibility = $validated['visibility'] ?? 'private';
        $project->is_premiere_public = $request->boolean('is_premiere_public', false);

        $project->save();

        try {
            \App\Services\Logger::log('CONTENT', 'Project Updated', "User " . auth()->user()?->name . " updated project: {$project->title}");
        } catch (\Throwable $ex) {
        }

        return Redirect::route('projects.my')->with('success', 'Project updated successfully.');
    }
}
