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
            'thumbnail' => 'nullable|file|image|mimes:jpg,jpeg,png,webp|max:10240', // optional thumbnail, max 10MB
        ]);

        // Get the authenticated user
        $user = Auth::user();

        // handle file upload to Supabase
        // We will store the files in a directory named after the user's ID
        $videoPath = $request->file('video')->store('user-' . $user->id, 'supabase');

        // Manually construct the public URL using Supabase v1 storage path
        $supabaseUrl = rtrim(env('SUPABASE_URL', ''), '/');
        $supabaseBucket = env('SUPABASE_BUCKET', '');
        $videoUrl = $supabaseUrl . '/storage/v1/object/public/' . $supabaseBucket . '/' . ltrim($videoPath, '/');

        $thumbnailUrl = null;
        if ($request->hasFile('thumbnail')) {
            $thumbPath = $request->file('thumbnail')->store('user-' . $user->id, 'supabase');
            $thumbnailUrl = $supabaseUrl . '/storage/v1/object/public/' . $supabaseBucket . '/' . ltrim($thumbPath, '/');
        }

        // Create a new project record in the database
        $user->projects()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'video_url' => $videoUrl,
            'thumbnail_url' => $thumbnailUrl,
            // 'status' defaults to 'published' as per our schema
        ]);

        // Redirect the user back to the projects page with a success message
        try {
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
                if (isset($videoPath) && Storage::disk('supabase')->exists($videoPath)) {
                    Storage::disk('supabase')->delete($videoPath);
                }
                if (isset($thumbPath) && Storage::disk('supabase')->exists($thumbPath)) {
                    Storage::disk('supabase')->delete($thumbPath);
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
}
