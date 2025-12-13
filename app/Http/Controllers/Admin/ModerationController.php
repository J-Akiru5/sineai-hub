<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ContentFlag;
use App\Services\Logger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class ModerationController extends Controller
{
    public function index()
    {
        $pendingProjects = Project::where('moderation_status', 'pending')->with('user')->get();
        $openFlags = ContentFlag::where('status', 'open')->with(['project', 'user'])->get();

        // Approved / rejected history (paginated)
        $approvedProjects = Project::where('moderation_status', 'approved')
            ->with('user')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $rejectedProjects = Project::where('moderation_status', 'rejected')
            ->with('user')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Moderation/Index', [
            'pendingProjects' => $pendingProjects,
            'openFlags' => $openFlags,
            'approvedProjects' => $approvedProjects,
            'rejectedProjects' => $rejectedProjects,
        ]);
    }

    public function updateProjectStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $project->moderation_status = $validated['status'];
        $project->save();

        // Log moderation actions
        try {
            if ($validated['status'] === 'approved') {
                Logger::log('MODERATION', 'Project Approved', "Admin " . auth()->user()?->name . " approved project: {$project->title}");
            } else {
                Logger::log('MODERATION', 'Project Rejected', "Admin " . auth()->user()?->name . " rejected project: {$project->title}");
            }
        } catch (\Throwable $e) {
            // don't block the flow on logging errors
        }

        return Redirect::back()->with('success', 'Project moderation status updated.');
    }

    public function resolveFlag(Request $request, ContentFlag $flag)
    {
        $flag->status = 'resolved';
        $flag->save();

        // Log flag resolution
        try {
            $reason = $flag->reason ?? $request->input('reason', '');
            $projectTitle = $flag->project?->title ?? 'unknown';
            Logger::log('MODERATION', 'Flag Resolved', "Admin " . auth()->user()?->name . " resolved flag (id: {$flag->id}) on project: {$projectTitle}. Flag reason: {$reason}");
        } catch (\Throwable $e) {
            // ignore logging errors
        }

        return Redirect::back()->with('success', 'Flag marked as resolved.');
    }
}
