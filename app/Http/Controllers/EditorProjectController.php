<?php

namespace App\Http\Controllers;

use App\Models\EditorProject;
use App\Models\EditorProjectAsset;
use App\Models\UserFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EditorProjectController extends Controller
{
    /**
     * Display listing of editor projects.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $projects = $user->editorProjects()
            ->with('assets')
            ->orderBy('updated_at', 'desc')
            ->get();
        
        $quota = $user->getOrCreateStorageQuota();
        
        return Inertia::render('Studio/Projects', [
            'projects' => $projects,
            'quota' => [
                'total' => $quota->quota_bytes,
                'used' => $quota->used_bytes,
                'remaining' => $quota->remaining_bytes,
                'percentage' => $quota->usage_percent,
                'formatted_total' => $quota->formatted_quota,
                'formatted_used' => $quota->formatted_used,
            ],
        ]);
    }

    /**
     * Show the editor for a specific project.
     */
    public function edit(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $project->load('assets');
        $quota = $request->user()->getOrCreateStorageQuota();
        
        // Get user's video files for asset library
        $userVideos = $request->user()->files()
            ->ofType('video')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('Studio/Editor', [
            'project' => $project,
            'userVideos' => $userVideos,
            'quota' => [
                'remaining' => $quota->remaining_bytes,
                'formatted_remaining' => $quota->formatted_remaining,
            ],
        ]);
    }

    /**
     * Create a new editor project.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);
        
        $project = EditorProject::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'settings' => EditorProject::DEFAULT_SETTINGS,
            'timeline_data' => ['clips' => [], 'tracks' => []],
            'status' => EditorProject::STATUS_DRAFT,
        ]);
        
        return redirect()->route('studio.editor.edit', $project)
            ->with('success', 'Project created successfully');
    }

    /**
     * Update project metadata.
     */
    public function update(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'settings' => 'sometimes|array',
        ]);
        
        $project->update($request->only(['name', 'description', 'settings']));
        
        return back()->with('success', 'Project updated');
    }

    /**
     * Save timeline data.
     */
    public function saveTimeline(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $request->validate([
            'timeline_data' => 'required|array',
        ]);
        
        $project->update([
            'timeline_data' => $request->timeline_data,
        ]);
        
        // Recalculate duration
        $project->syncDuration();
        
        return response()->json([
            'success' => true,
            'duration' => $project->formatted_duration,
        ]);
    }

    /**
     * Upload an asset to the project.
     */
    public function uploadAsset(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $request->validate([
            'file' => 'required|file|mimes:mp4,mov,avi,webm,mp3,wav,ogg,jpg,jpeg,png,gif,webp|max:524288',
        ]);
        
        $user = $request->user();
        $quota = $user->getOrCreateStorageQuota();
        $file = $request->file('file');
        $fileSize = $file->getSize();
        
        // Check quota
        if (!$quota->canStore($fileSize)) {
            return response()->json([
                'error' => 'Insufficient storage space. You have ' . $quota->formatted_remaining . ' remaining.',
            ], 422);
        }
        
        // Upload to DO Spaces
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $path = "users/{$user->id}/editor/{$project->id}/{$filename}";
        
        Storage::disk('digitalocean')->put($path, file_get_contents($file), 'public');
        
        // Determine asset type
        $mimeType = $file->getMimeType();
        $type = 'other';
        if (str_starts_with($mimeType, 'video/')) $type = 'video';
        elseif (str_starts_with($mimeType, 'audio/')) $type = 'audio';
        elseif (str_starts_with($mimeType, 'image/')) $type = 'image';
        
        // Also create a UserFile record
        $userFile = UserFile::create([
            'user_id' => $user->id,
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'digitalocean',
            'mime_type' => $mimeType,
            'size_bytes' => $fileSize,
            'type' => $type,
            'folder' => 'editor',
        ]);
        
        // Create project asset
        $asset = EditorProjectAsset::create([
            'editor_project_id' => $project->id,
            'user_file_id' => $userFile->id,
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'type' => $type,
            'size_bytes' => $fileSize,
            'duration_ms' => $request->duration_ms,
            'width' => $request->width,
            'height' => $request->height,
        ]);
        
        // Update quota
        $quota->addUsage($fileSize);
        
        return response()->json([
            'asset' => $asset,
            'quota' => [
                'remaining' => $quota->remaining_bytes,
                'formatted_remaining' => $quota->formatted_remaining,
            ],
        ]);
    }

    /**
     * Add existing user file as project asset.
     */
    public function addAssetFromLibrary(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $request->validate([
            'user_file_id' => 'required|exists:user_files,id',
        ]);
        
        $userFile = UserFile::findOrFail($request->user_file_id);
        
        if ($userFile->user_id !== $request->user()->id) {
            abort(403);
        }
        
        // Check if already added
        $existing = $project->assets()->where('user_file_id', $userFile->id)->first();
        if ($existing) {
            return response()->json(['asset' => $existing]);
        }
        
        $asset = EditorProjectAsset::create([
            'editor_project_id' => $project->id,
            'user_file_id' => $userFile->id,
            'name' => $userFile->name,
            'path' => $userFile->path,
            'type' => $userFile->type,
            'size_bytes' => $userFile->size_bytes,
            'metadata' => $userFile->metadata,
        ]);
        
        return response()->json(['asset' => $asset]);
    }

    /**
     * Remove an asset from project.
     */
    public function removeAsset(Request $request, EditorProject $project, EditorProjectAsset $asset)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        if ($asset->editor_project_id !== $project->id) {
            abort(404);
        }
        
        $asset->delete();
        
        return response()->json(['success' => true]);
    }

    /**
     * Delete a project.
     */
    public function destroy(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        // Delete all assets first
        foreach ($project->assets as $asset) {
            // If asset has its own file (not from library), delete it
            if ($asset->userFile && $asset->userFile->folder === 'editor') {
                $asset->userFile->delete();
            }
        }
        
        // Delete thumbnail and export if they exist
        if ($project->thumbnail_path) {
            Storage::disk('digitalocean')->delete($project->thumbnail_path);
        }
        if ($project->export_path) {
            Storage::disk('digitalocean')->delete($project->export_path);
        }
        
        $project->delete();
        
        return redirect()->route('studio.projects')
            ->with('success', 'Project deleted');
    }

    /**
     * Duplicate a project.
     */
    public function duplicate(Request $request, EditorProject $project)
    {
        if ($project->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $newProject = $project->replicate();
        $newProject->name = $project->name . ' (Copy)';
        $newProject->status = EditorProject::STATUS_DRAFT;
        $newProject->export_path = null;
        $newProject->save();
        
        // Copy assets (reference only, not actual files)
        foreach ($project->assets as $asset) {
            $newAsset = $asset->replicate();
            $newAsset->editor_project_id = $newProject->id;
            $newAsset->save();
        }
        
        return redirect()->route('studio.editor.edit', $newProject)
            ->with('success', 'Project duplicated');
    }
}
