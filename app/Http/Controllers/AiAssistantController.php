<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\ConversationMessage;

class AiAssistantController extends Controller
{
    //Handle c chat request to the AI assistant
    public function chat(Request $request)
    {
        // 1. Validation
        $validated = $request->validate([
            'prompt' => 'required|string|max:5000',
            // accept an optional integer conversation id; we'll verify ownership below
            'conversation_id' => 'nullable|integer',
        ]);

        // find or create the conversation. If a conversation_id was provided, ensure it exists and belongs to the user.
        $isNewConversation = empty($validated['conversation_id']);
        if (!$isNewConversation) {
            $conversation = Conversation::where('id', $validated['conversation_id'])
                ->where('user_id', $request->user()->id)
                ->first();

            if (!$conversation) {
                return response()->json(['error' => 'Conversation not found or access denied.'], 404);
            }
        } else {
            // create an empty conversation for this user
            $conversation = $request->user()->conversations()->create([]);
        }

        // save user msg to db
        $conversation->messages()->create(['sender' => 'user', 'body' => $validated['prompt']]);

        // If this is a brand new conversation, synchronously generate a short title now
        if ($isNewConversation) {
            try {
                $apiKey = env('GEMINI_API_KEY');
                if ($apiKey) {
                    $titleEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
                    $titlePrompt = "Create a short, 3-5 word title for a conversation starting with: {$validated['prompt']}";

                    $titleResp = Http::withHeaders(['Content-Type' => 'application/json'])->post("{$titleEndpoint}?key={$apiKey}", [
                        'contents' => [[ 'parts' => [[ 'text' => $titlePrompt ]]]]
                    ]);

                    if ($titleResp->successful()) {
                        $rawTitle = $titleResp->json('candidates.0.content.parts.0.text');
                        if ($rawTitle) {
                            $cleanTitle = trim(str_replace(["\n", '"', "'"], ' ', $rawTitle));
                            $conversation->title = mb_substr($cleanTitle, 0, 80);
                            $conversation->save();
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('Title generation failed: ' . $e->getMessage());
                // continue without blocking the main reply
            }
        }

        // 2. API Key Setup (unchanged)
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'AI API key is not configured.'], 500);
        }

        // --- NEW: PROMPT ENGINEERING ---
        $systemPrompt = "You are Spark, the official AI creative assistant for the SineAI Hub, a community for AI-assisted filmmakers in the Visayan region of the Philippines. Your personality is encouraging, knowledgeable, and creative. Your primary goal is to help filmmakers brainstorm and overcome creative blocks. Always be supportive. Do not mention that you are a language model unless asked directly. Keep your answers concise and focused on filmmaking.";
        
         // 4. Build the conversation history for the API
    $apiHistory = $conversation->messages()->orderBy('created_at', 'asc')->get()->map(function ($message) {
        return [
            'role' => $message->sender === 'user' ? 'user' : 'model',
            'parts' => [['text' => $message->body]]
        ];
    })->all();
    
    // Add the system prompt at the beginning of the history
    array_unshift($apiHistory, 
        ['role' => 'user', 'parts' => [['text' => 'Hello, please introduce yourself and your purpose.']]],
        ['role' => 'model', 'parts' => [['text' => $systemPrompt]]]
    );

        // 3. Prepare the API request with a conversation history
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
         $data = ['contents' => $apiHistory];

        // --- THE REST OF THE METHOD IS UNCHANGED ---

        // 4. Make the API Call
        $response = Http::withHeaders(['Content-Type' => 'application/json'])->post("{$endpoint}?key={$apiKey}", $data);

        // ... (The rest of the error handling and response parsing logic remains the same) ...

        if ($response->failed() || is_null($reply = $response->json('candidates.0.content.parts.0.text'))) {
            \Log::error('Gemini API request failed', ['status' => $response->status(), 'response' => $response->body()]);
             $errorMessage = "Sorry, an error occurred."; // Simplified for brevity
        $conversation->messages()->create(['sender' => 'ai', 'body' => $errorMessage]);
        return response()->json(['reply' => $errorMessage, 'conversation_id' => $conversation->id]);
        }

        $reply = $response->json('candidates.0.content.parts.0.text');

        if (is_null($reply)) {
            \Log::warning('Gemini API returned a null reply.', ['response' => $response->json()]);
            $blockReason = $response->json('promptFeedback.blockReason');
            if ($blockReason) {
                $userMessage = "I'm sorry, I cannot respond to that. My safety filters were triggered due to: " . str_replace('_', ' ', strtolower($blockReason)) . ".";
                return response()->json(['reply' => $userMessage]);
            }
            return response()->json(['reply' => "I'm sorry, I was unable to generate a response. Please try rephrasing your message."]);
        }

        // save AI reply to db
        $conversation->messages()->create(['sender' => 'ai', 'body' => $reply]);

        // Return the AI reply and conversation metadata (id and title) so the frontend can hydrate the sidebar immediately
        $conversation->refresh();
        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get(['id', 'conversation_id', 'sender', 'body', 'created_at']);

        return response()->json([
            'reply' => $reply,
            'conversation_id' => $conversation->id,
            'title' => $conversation->title,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'messages' => $messages,
            ],
        ]);
    }

    public function index()
    {
        // The frontend file is named `index.jsx` (lowercase) under Pages/Assistant,
        // so render the matching path. Inertia's resolver is case-sensitive.
        return \Inertia\Inertia::render('Assistant/Index', [
            'conversations' => request()->user()
                ->conversations()
                ->with('messages:id,conversation_id,body')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Return the full message history for a conversation.
     */
    public function show(Conversation $conversation, Request $request)
    {
        // Ensure the authenticated user owns this conversation
        if ($conversation->user_id !== $request->user()->id) {
            abort(403);
        }

        // Load all messages (full history) ordered oldest-first
        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get(['id', 'conversation_id', 'sender', 'body', 'created_at']);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
            ],
            'messages' => $messages,
        ]);
    }
}
