<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Models\Script;
use Illuminate\Support\Facades\Auth;

class ScriptwriterController extends Controller
{
    /**
     * Display a listing of user's scripts.
     */
    public function list()
    {
        $scripts = request()->user()
            ? Script::where('user_id', request()->user()->id)
                ->latest()
                ->paginate(12)
            : collect();

        return Inertia::render('Scripts/Index', [
            'scripts' => $scripts,
        ]);
    }

    /**
     * Render the Scriptwriter page (Inertia).
     */
    public function index()
    {
        $scripts = request()->user()
            ? Script::where('user_id', request()->user()->id)
                ->with('project:id,title,thumbnail_url')
                ->latest()
                ->get()
            : collect();

        return Inertia::render('Scriptwriter/Index', [
            'scripts' => $scripts,
        ]);
    }

    /**
     * Create a new blank script for the current user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Create default content for new scripts
        $defaultContent = [
            ['type' => 'scene-heading', 'content' => 'INT. UNTITLED - DAY'],
            ['type' => 'action', 'content' => '']
        ];

        $script = Script::create([
            'user_id' => $user->id,
            'title' => $request->input('title', 'Untitled Script'),
            'content' => $request->input('content', $defaultContent),
        ]);

        return response()->json(['script' => $script]);
    }

    /**
     * Update a script's title or content.
     */
    public function update(Request $request, Script $script)
    {
        $user = $request->user();
        if (!$user || $script->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable',
            'project_id' => 'nullable|exists:projects,id',
        ]);

        if (array_key_exists('title', $data)) {
            $script->title = $data['title'] ?? $script->title;
        }
        if (array_key_exists('content', $data)) {
            $script->content = $data['content'];
        }
        if (array_key_exists('project_id', $data)) {
            // Verify user owns the project if provided
            if ($data['project_id']) {
                $project = \App\Models\Project::find($data['project_id']);
                if (!$project || $project->user_id !== $user->id) {
                    return response()->json(['error' => 'You do not own this project'], 403);
                }
            }
            $script->project_id = $data['project_id'];
        }

        $script->save();

        return response()->json(['script' => $script->load('project')]);
    }

    /**
     * Delete a script.
     */
    public function destroy(Request $request, Script $script)
    {
        $user = $request->user();
        if (!$user || $script->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $script->delete();

        // Return appropriate response based on request type
        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('scripts.index');
    }

    /**
     * Return a specific script's data and render the Scriptwriter with it as active.
     */
    public function show(Script $script, Request $request)
    {
        $user = $request->user();
        if (!$user || $script->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        // Get all user's scripts with the requested one first
        $scripts = Script::where('user_id', $user->id)
            ->with('project:id,title,thumbnail_url')
            ->latest()
            ->get();
        
        // Reorder so the active script is first
        $reordered = $scripts->sortByDesc(function ($s) use ($script) {
            return $s->id === $script->id ? 1 : 0;
        })->values();

        return Inertia::render('Scriptwriter/Index', [
            'scripts' => $reordered,
        ]);
    }

    /**
     * Assist endpoint: perform an action on selected text using the Gemini API.
     * Expects: selected_text (string), action (string)
     */
    public function assist(Request $request)
    {
        $data = $request->validate([
            'selected_text' => 'required|string',
            'action' => 'required|string',
        ]);

        $selected = trim($data['selected_text']);
        $action = strtolower(trim($data['action']));

        // Build action-specific prompt
        switch ($action) {
            case 'rewrite':
            case 'rewrite_dialogue':
                $userPrompt = "You are an award-winning screenwriter. Rewrite the following dialogue to be more subtext-heavy and impactful: '{$selected}'";
                break;
            case 'describe':
            case 'describe_scene':
                $userPrompt = "Write a vivid, cinematic scene description for: '{$selected}'";
                break;
            case 'suggest_next':
                $userPrompt = "Suggest the next lines or actions that follow this text in a screenplay-friendly manner: '{$selected}'";
                break;
            default:
                $userPrompt = "Provide a helpful {$action} for the following text: '{$selected}'";
                break;
        }

        $systemPrompt = "You are Spark, the AI creative assistant for the SineAI Hub. Be cinematic, concise, and helpful to filmmakers.";

        $fullContents = [
            ['role' => 'user', 'parts' => [['text' => 'Please introduce yourself briefly.']]],
            ['role' => 'model', 'parts' => [['text' => $systemPrompt]]],
            ['role' => 'user', 'parts' => [['text' => $userPrompt]]],
        ];

        try {
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                return response()->json(['error' => 'AI API key not configured.'], 500);
            }

            $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post("{$endpoint}?key={$apiKey}", ['contents' => $fullContents]);

            if ($response->failed()) {
                \Log::error('Scriptwriter assist failed', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['error' => 'AI request failed.'], 500);
            }

            $suggestion = $response->json('candidates.0.content.parts.0.text') ?? null;

            if (is_null($suggestion)) {
                \Log::warning('Scriptwriter assist returned null', ['response' => $response->json()]);
                return response()->json(['error' => 'AI did not return a suggestion.'], 500);
            }

            return response()->json(['suggestion' => trim($suggestion)]);
        } catch (\Exception $e) {
            \Log::error('Scriptwriter assist exception: ' . $e->getMessage());
            return response()->json(['error' => 'Internal error.'], 500);
        }
    }

    /**
     * Attach a script to a project.
     */
    public function attachProject(Request $request, Script $script)
    {
        $user = $request->user();
        if (!$user || $script->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
        ]);

        $projectId = $data['project_id'];

        // If project_id is provided, verify user owns it
        if ($projectId) {
            $project = \App\Models\Project::find($projectId);
            if (!$project || $project->user_id !== $user->id) {
                return response()->json(['error' => 'You do not own this project'], 403);
            }
        }

        $script->project_id = $projectId;
        $script->save();

        return response()->json([
            'success' => true,
            'script' => $script->load('project'),
            'message' => $projectId ? 'Script synced to project successfully' : 'Script unlinked from project'
        ]);
    }

    /**
     * Get user's projects for selection.
     */
    public function getUserProjects(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $projects = \App\Models\Project::where('user_id', $user->id)
            ->select('id', 'title', 'thumbnail_url', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['projects' => $projects]);
    }
}
