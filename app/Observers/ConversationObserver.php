<?php

namespace App\Observers;

use App\Models\Conversation;
use Illuminate\Support\Facades\Http;

class ConversationObserver
{
    /**
     * Handle the Conversation "created" event.
     */
    public function created(Conversation $conversation): void
    {
        // Title generation moved to the chat controller to avoid duplicate calls.
        // Keep the observer a no-op to prevent double-generation.
        return;
    }
}
