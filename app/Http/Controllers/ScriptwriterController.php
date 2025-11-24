<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ScriptwriterController extends Controller
{
    /**
     * Display the scriptwriter page.
     */
    public function index()
    {
        return Inertia::render('Scriptwriter/Index');
    }

    /**
     * Handle an AI assistance request.
     */
    public function assist(Request $request)
    {
        // 1. Validate the incoming request
        $validated = $request->validate([
            'text' => 'required|string',
            'action' => 'required|string|in:rewrite,describe,continue',
        ]);

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'AI API key is not configured.'], 500);
        }

        // 2. Prompt Engineering: Create a specific prompt based on the action
        $prompt = $this->createPromptForAction($validated['action'], $validated['text']);

        // 3. Prepare and make the API call to Gemini
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        $data = ['contents' => [['parts' => [['text' => $prompt]]]]];
        $response = Http::post("{$endpoint}?key={$apiKey}", $data);

        // 4. Handle errors and return the response (similar to AiAssistantController)
        if ($response->failed() || is_null($reply = $response->json('candidates.0.content.parts.0.text'))) {
            \Log::warning('Scriptwriter assist API returned a null reply.', ['response' => $response->json()]);
            return response()->json(['error' => 'Could not generate a suggestion.'], 503);
        }

        return response()->json(['suggestion' => $reply]);
    }

    /**
     * Helper function to create a specific prompt for the AI.
     */
    private function createPromptForAction(string $action, string $text): string
    {
        $basePrompt = "You are an expert screenwriter and script doctor. Your task is to help a user improve their script.";

        switch ($action) {
            case 'rewrite':
                return "{$basePrompt} Rewrite the following text to be more impactful, clear, and engaging, while keeping the core meaning. Text: '{$text}'";
            case 'describe':
                return "{$basePrompt} Take the following dialogue or action line and expand upon it, adding vivid sensory details and descriptions to make the scene more immersive. Text: '{$text}'";
            case 'continue':
                return "{$basePrompt} Continue writing the script from this point, adding the next logical line of dialogue or action. Here is the last line: '{$text}'";
            default:
                return $text;
        }
    }
}