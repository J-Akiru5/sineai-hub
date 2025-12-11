<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    /**
     * Update the conversation title.
     */
    public function update(Request $request, Conversation $conversation)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        if (!$user || $conversation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $conversation->title = $request->input('title');
        $conversation->save();

        return response()->json(['conversation' => $conversation]);
    }

    /**
     * Destroy the conversation and its messages.
     */
    public function destroy(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        if (!$user || $conversation->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // delete related messages first (if not cascade)
        try {
            $conversation->messages()->delete();
        } catch (\Exception $e) {
            // continue even if messages deletion fails
        }

        $conversation->delete();

        return response()->json(['success' => true]);
    }
}
