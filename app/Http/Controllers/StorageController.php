<?php

namespace App\Http\Controllers;

use App\Models\UserFile;
use App\Models\UserStorageQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StorageController extends Controller
{
    /**
     * Display storage dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $quota = $user->getOrCreateStorageQuota();
        
        $files = $user->files()
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('type');
        
        $stats = [
            'total_files' => $user->files()->count(),
            'videos' => $user->files()->ofType('video')->count(),
            'images' => $user->files()->ofType('image')->count(),
            'documents' => $user->files()->ofType('document')->count(),
            'other' => $user->files()->ofType('other')->count(),
        ];
        
        return Inertia::render('Storage/Index', [
            'quota' => [
                'total' => $quota->quota_bytes,
                'used' => $quota->used_bytes,
                'remaining' => $quota->remaining_bytes,
                'percentage' => $quota->usage_percent,
                'formatted_total' => $quota->formatted_quota,
                'formatted_used' => $quota->formatted_used,
                'formatted_remaining' => $quota->formatted_remaining,
            ],
            'files' => $files,
            'stats' => $stats,
        ]);
    }

    /**
     * Upload a file.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:524288', // 512MB max
            'folder' => 'nullable|string|max:255',
        ]);
        
        $user = $request->user();
        $quota = $user->getOrCreateStorageQuota();
        $file = $request->file('file');
        $fileSize = $file->getSize();
        
        // Check quota
        if (!$quota->canStore($fileSize)) {
            return back()->withErrors([
                'file' => 'Insufficient storage space. You have ' . $quota->formatted_remaining . ' remaining.',
            ]);
        }
        
        // Generate unique path
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;
        $path = "users/{$user->id}/files/{$filename}";
        
        // Upload to DO Spaces
        Storage::disk('digitalocean')->put($path, file_get_contents($file), 'public');
        
        // Determine file type
        $mimeType = $file->getMimeType();
        $type = UserFile::determineType($mimeType);
        
        // Create database record
        $userFile = UserFile::create([
            'user_id' => $user->id,
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'disk' => 'digitalocean',
            'mime_type' => $mimeType,
            'size_bytes' => $fileSize,
            'type' => $type,
            'folder' => $request->folder,
        ]);
        
        // Update quota
        $quota->addUsage($fileSize);
        
        return back()->with('success', 'File uploaded successfully');
    }

    /**
     * Delete a file.
     */
    public function destroy(Request $request, UserFile $file)
    {
        // Ensure user owns this file
        if ($file->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $file->delete(); // Model's deleting event handles storage + quota
        
        return back()->with('success', 'File deleted successfully');
    }

    /**
     * Rename a file.
     */
    public function rename(Request $request, UserFile $file)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        
        if ($file->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $file->update(['name' => $request->name]);
        
        return back()->with('success', 'File renamed successfully');
    }

    /**
     * Move file to folder.
     */
    public function move(Request $request, UserFile $file)
    {
        $request->validate([
            'folder' => 'nullable|string|max:255',
        ]);
        
        if ($file->user_id !== $request->user()->id) {
            abort(403);
        }
        
        $file->update(['folder' => $request->folder]);
        
        return back()->with('success', 'File moved successfully');
    }

    /**
     * Get files for a specific folder (API).
     */
    public function folder(Request $request, ?string $folder = null)
    {
        $user = $request->user();
        
        $files = $user->files()
            ->inFolder($folder)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['files' => $files]);
    }

    /**
     * Get files by type (API).
     */
    public function byType(Request $request, string $type)
    {
        $user = $request->user();
        
        $files = $user->files()
            ->ofType($type)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['files' => $files]);
    }
}
