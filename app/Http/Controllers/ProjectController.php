<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
            $thumbnailUrl = "{$endpoint}/{$thumbPath}";
        }

        // Determine flags/metadata
        $isPremierePublic = $request->boolean('is_premiere_public', false);
        $category = $validated['category'] ?? null;

        // Create a new project record in the database
        $project = $user->projects()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'video_url' => $videoUrl,
            'thumbnail_url' => $thumbnailUrl,
            'is_premiere_public' => $isPremierePublic,
            'category' => $category,
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

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    public function index()
    {
       
        // Return projects as-is. The `video_url` and `thumbnail_url` stored
        // in the database already contain the absolute Supabase links, so
        // don't attempt to transform or re-generate them here.
        $projects = Project::with('user')->latest()->get();

        return Inertia::render('Projects/Index', [
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
}
