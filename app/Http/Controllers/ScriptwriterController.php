<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ScriptwriterController extends Controller
{
    /**
     * Render the Scriptwriter page (Inertia).
     */
    public function index()
    {
        return Inertia::render('Scriptwriter/Index');
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
                $userPrompt = "You are an award-winning screenwriter. Rewrite the following dialogue to be more subtext-heavy and impactful: '{$selected}'";
                break;
            case 'describe':
                $userPrompt = "Write a vivid, cinematic scene description for: '{$selected}'";
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
