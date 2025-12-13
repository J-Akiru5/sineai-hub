<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Services\Logger;

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
                    // Use the same model family as the main chat endpoint
                    $titleEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
                    $titlePrompt = "Create a short, strictly 3-5 word title for a conversation starting with: {$validated['prompt']}";

                    $titleResp = Http::withHeaders(['Content-Type' => 'application/json'])->post("{$titleEndpoint}?key={$apiKey}", [
                        'contents' => [[ 'parts' => [[ 'text' => $titlePrompt ]]]]
                    ]);

                    if ($titleResp->successful()) {
                        $rawTitle = $titleResp->json('candidates.0.content.parts.0.text');
                        if ($rawTitle) {
                            // sanitize: remove newlines, backticks, and common markdown characters, collapse spaces
                            $cleanTitle = preg_replace('/[\r\n]+/', ' ', $rawTitle);
                            $cleanTitle = preg_replace('/[`*_>#\[\](){}~-]+/', ' ', $cleanTitle);
                            $cleanTitle = preg_replace('/\s+/', ' ', $cleanTitle);
                            $cleanTitle = trim($cleanTitle);
                            $conversation->title = mb_substr($cleanTitle, 0, 255);
                            $conversation->save();
                        }
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('Title generation failed: ' . $e->getMessage());
                // continue without blocking the main reply
            }
            // Log conversation creation (with title if available)
            try {
                Logger::log('AI_USAGE', 'Started Conversation', "User " . auth()->user()?->name . " started a new chat: {$conversation->title}");
            } catch (\Throwable $e) {
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

    /**
     * Public guest chat endpoint (stateless, does not require auth or save history)
     */
    public function guestChat(Request $request)
    {
        $request->validate(['prompt' => 'required|string']);

        // Master system prompt to define Spark's persona and mission
        $systemPrompt = "You are Spark, the official AI assistant for the SineAI Guild of Western Visayas.\n\nYour Identity:\n\nYou are a friendly, creative, and highly knowledgeable robot assistant.\n\nYour tone is professional yet enthusiastic, like a passionate film producer.\n\nYou love cinema, technology, and the Visayan culture.\n\nYou speak English primarily, but you can understand and reply in Tagalog or Hiligaynon if asked.\n\nYour Mission:\n\nTo help filmmakers in Western Visayas create better stories using AI tools.\nTo guide users through the 'SineAI Hub' platform.\nTo brainstorm creative ideas (scripts, mood boards, shot lists).\n\nAbout the SineAI Guild:\n\nWhat it is: The pioneering community of AI-assisted filmmakers in the region.\nGoal: To create a 'Visayan Wave' of AI filmmaking.\nFeatures: The Hub offers a Creator Portfolio, Real-time Community Chat, and AI Tools like Scriptwriting and Storyboarding.\n\nConstraint:\n\nKeep your answers concise (under 3-4 sentences) unless asked for a long explanation.\nAlways be encouraging to creators.";

        // Combine system prompt and user prompt into the payload
        $fullPrompt = $systemPrompt . "\n\nUser Question: " . $request->input('prompt');

        try {
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                return response()->json(['response' => "AI API key not configured."], 500);
            }

            $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("{$endpoint}?key={$apiKey}", [
                'contents' => [
                    [ 'parts' => [ [ 'text' => $fullPrompt ] ] ]
                ]
            ]);

            $aiText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? "I'm having trouble connecting right now.";

            return response()->json(['response' => $aiText]);
        } catch (\Exception $e) {
            \Log::error('Guest chat error: ' . $e->getMessage());
            return response()->json(['response' => "Sorry, an error occurred."], 500);
        }
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

    /**
     * Update a conversation's metadata (title).
     */
    public function update(Request $request, Conversation $conversation)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        $conversation->title = trim($data['title']);
        $conversation->save();

        return response()->json(['success' => true, 'conversation' => $conversation]);
    }

    /**
     * Destroy a conversation and its messages.
     */
    public function destroy(Conversation $conversation, Request $request)
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized.'], 403);
        }

        // remove messages first to be explicit
        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json(['success' => true]);
    }
}
