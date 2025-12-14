<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SparkScriptController extends Controller
{
    /**
     * Rewrite a specific block's content based on the tone.
     * POST /spark/rewrite
     * Expects: { content: string, type: string, tone: string }
     */
    public function rewrite(Request $request)
    {
        $data = $request->validate([
            'content' => 'required|string|max:5000',
            'type' => 'required|string|in:scene-heading,action,character,dialogue,parenthetical,transition',
            'tone' => 'required|string|in:witty,dramatic,concise,aggressive',
        ]);

        $content = trim($data['content']);
        $type = $data['type'];
        $tone = $data['tone'];

        // Build tone-specific prompts
        $toneInstructions = [
            'witty' => 'Rewrite this to be wittier, adding clever wordplay or subtle humor while maintaining the screenplay format.',
            'dramatic' => 'Rewrite this to be more dramatic and emotionally intense, heightening the stakes and tension.',
            'concise' => 'Rewrite this to be more concise and punchy, removing unnecessary words while keeping the core meaning.',
            'aggressive' => 'Rewrite this to be more aggressive and forceful, with stronger, more assertive language.',
        ];

        $instruction = $toneInstructions[$tone] ?? 'Improve this text.';

        $systemPrompt = "You are Spark, an expert screenplay assistant. Your task is to rewrite screenplay content while maintaining proper screenplay formatting. Return ONLY the rewritten text, without any explanations, quotation marks, or additional commentary.";

        $userPrompt = "{$instruction}\n\nBlock Type: {$type}\nOriginal Content: {$content}\n\nReturn only the rewritten content:";

        try {
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                return response()->json(['error' => 'AI API key not configured.'], 500);
            }

            $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post("{$endpoint}?key={$apiKey}", [
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => 'Please introduce yourself briefly.']]],
                        ['role' => 'model', 'parts' => [['text' => $systemPrompt]]],
                        ['role' => 'user', 'parts' => [['text' => $userPrompt]]],
                    ]
                ]);

            if ($response->failed()) {
                Log::error('Spark rewrite failed', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['error' => 'AI request failed. Please try again.'], 500);
            }

            $rewrittenText = $response->json('candidates.0.content.parts.0.text') ?? null;

            if (is_null($rewrittenText)) {
                Log::warning('Spark rewrite returned null', ['response' => $response->json()]);
                return response()->json(['error' => 'AI did not return a rewrite.'], 500);
            }

            // Clean up the response - remove quotes and trim
            $rewrittenText = trim($rewrittenText, " \n\r\t\"'`");

            return response()->json(['rewrittenContent' => $rewrittenText]);
        } catch (\Exception $e) {
            Log::error('Spark rewrite exception: ' . $e->getMessage());
            return response()->json(['error' => 'An internal error occurred. Please try again.'], 500);
        }
    }

    /**
     * Generate a new screenplay scene from a prompt.
     * POST /spark/generate
     * Expects: { prompt: string, context: string|null }
     */
    public function generate(Request $request)
    {
        $data = $request->validate([
            'prompt' => 'required|string|max:2000',
            'context' => 'nullable|string|max:3000',
        ]);

        $prompt = trim($data['prompt']);
        $context = isset($data['context']) ? trim($data['context']) : '';

        $systemPrompt = "You are Spark, an expert screenplay writing assistant. You generate screenplay scenes in a structured block format. You MUST return a valid JSON array where each element is an object with 'type' and 'content' fields. The 'type' must be one of: 'scene-heading', 'action', 'character', 'dialogue', 'parenthetical', 'transition'. The 'content' should be the actual screenplay text. Do NOT include any explanatory text, markdown formatting, or code blocks - ONLY return the raw JSON array.";

        $userPrompt = "Generate a screenplay scene based on this description: {$prompt}";
        if (!empty($context)) {
            $userPrompt .= "\n\nContext from the existing script:\n{$context}";
        }
        $userPrompt .= "\n\nReturn your response as a JSON array of blocks. Example format:\n[{\"type\":\"scene-heading\",\"content\":\"INT. COFFEE SHOP - DAY\"},{\"type\":\"action\",\"content\":\"The room buzzes with activity.\"}]";

        try {
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                return response()->json(['error' => 'AI API key not configured.'], 500);
            }

            $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post("{$endpoint}?key={$apiKey}", [
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => 'Please introduce yourself briefly.']]],
                        ['role' => 'model', 'parts' => [['text' => $systemPrompt]]],
                        ['role' => 'user', 'parts' => [['text' => $userPrompt]]],
                    ]
                ]);

            if ($response->failed()) {
                Log::error('Spark generate failed', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json(['error' => 'AI request failed. Please try again.'], 500);
            }

            $generatedText = $response->json('candidates.0.content.parts.0.text') ?? null;

            if (is_null($generatedText)) {
                Log::warning('Spark generate returned null', ['response' => $response->json()]);
                return response()->json(['error' => 'AI did not return a scene.'], 500);
            }

            // Clean up the response - remove markdown code blocks if present
            $generatedText = preg_replace('/```json\s*|\s*```/', '', $generatedText);
            $generatedText = trim($generatedText);

            // Parse the JSON array
            $blocks = json_decode($generatedText, true);

            if (!is_array($blocks) || empty($blocks)) {
                Log::warning('Spark generate returned invalid JSON', ['text' => $generatedText]);
                return response()->json(['error' => 'AI returned an invalid scene format. Please try again.'], 500);
            }

            // Validate each block has the required structure
            foreach ($blocks as $block) {
                if (!isset($block['type']) || !isset($block['content'])) {
                    Log::warning('Spark generate block missing required fields', ['block' => $block]);
                    return response()->json(['error' => 'AI returned an invalid block format. Please try again.'], 500);
                }
            }

            return response()->json(['blocks' => $blocks]);
        } catch (\Exception $e) {
            Log::error('Spark generate exception: ' . $e->getMessage());
            return response()->json(['error' => 'An internal error occurred. Please try again.'], 500);
        }
    }
}
