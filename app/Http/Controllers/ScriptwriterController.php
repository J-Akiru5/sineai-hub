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
     * Render the Scriptwriter page (Inertia).
     */
    public function index()
    {
        $scripts = request()->user()
            ? Script::where('user_id', request()->user()->id)->latest()->get()
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

        $script = Script::create([
            'user_id' => $user->id,
            'title' => $request->input('title', 'Untitled Script'),
            'content' => $request->input('content', null),
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
        ]);

        if (array_key_exists('title', $data)) {
            $script->title = $data['title'] ?? $script->title;
        }
        if (array_key_exists('content', $data)) {
            $script->content = $data['content'];
        }

        $script->save();

        return response()->json(['script' => $script]);
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

        return response()->json(['success' => true]);
    }

    /**
     * Return a specific script's data.
     */
    public function show(Script $script, Request $request)
    {
        $user = $request->user();
        if (!$user || $script->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['script' => $script]);
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
}
