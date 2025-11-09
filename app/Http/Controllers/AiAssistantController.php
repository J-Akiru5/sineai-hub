<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AiAssistantController extends Controller
{
    //Handle c chat request to the AI assistant
   public function chat(Request $request)
    {
        // 1. Validation (unchanged)
        $validated = $request->validate([
            'prompt' => 'required|string|max:5000',
        ]);

        // 2. API Key Setup (unchanged)
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'AI API key is not configured.'], 500);
        }

        // 3. Prepare API Request (unchanged)
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        $data = [ 'contents' => [ [ 'parts' => [ ['text' => $validated['prompt']] ] ] ] ];

        // 4. Make the API Call (unchanged)
        $response = Http::withHeaders(['Content-Type' => 'application/json'])->post("{$endpoint}?key={$apiKey}", $data);

        // 5. Handle Failed HTTP Requests (unchanged)
        if ($response->failed()) {
            \Log::error('Gemini API request failed', ['status' => $response->status(), 'response' => $response->body()]);
            return response()->json(['error' => 'The AI assistant is currently unavailable. Please try again later.'], 503);
        }

        // --- NEW, MORE INTELLIGENT ERROR HANDLING ---

        // 6. Try to extract the reply text.
        $reply = $response->json('candidates.0.content.parts.0.text');

        // 7. Check if the reply is null, which indicates a problem like a safety block.
        if (is_null($reply)) {
            // Log the full response for our own debugging.
            \Log::warning('Gemini API returned a null reply.', ['response' => $response->json()]);

            // Check if there's a specific safety block reason.
            $blockReason = $response->json('promptFeedback.blockReason');
            if ($blockReason) {
                // We have a specific reason, let's give the user a helpful message.
                $userMessage = "I'm sorry, I cannot respond to that. My safety filters were triggered due to: " . str_replace('_', ' ', strtolower($blockReason)) . ".";
                return response()->json(['reply' => $userMessage]);
            }

            // If we don't know the reason, return a generic but informative error.
            return response()->json(['reply' => "I'm sorry, I was unable to generate a response. Please try rephrasing your message."]);
        }

        // 8. If we have a valid reply, send it back to the frontend.
        return response()->json(['reply' => $reply]);
    }

    public function index()
    {
        // The frontend file is named `index.jsx` (lowercase) under Pages/Assistant,
        // so render the matching path. Inertia's resolver is case-sensitive.
        return Inertia::render('Assistant/Index');
    }
}
