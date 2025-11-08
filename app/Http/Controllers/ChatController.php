<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $channels = Channel::orderBy('name')->get();

        // pick the first channel as default (if any)
        $defaultChannel = $channels->first();

        $messages = [];
        $users = []; // <-- Initialize an empty array for users

        if ($defaultChannel) {
            $messages = Message::where('channel_id', $defaultChannel->id)
                ->with('user')
                ->latest()
                ->take(100)
                ->get()
                ->reverse()
                ->values();
                
            // THE FIX: Get a unique list of all users from the loaded messages.
            // We use the user's ID as the key for fast lookups on the frontend.
            $users = $messages->map(fn($message) => $message->user)
                              ->unique('id')
                              ->keyBy('id');
        }

        return Inertia::render('Chat/Index', [
            'channels' => $channels,
            'messages' => $messages,
            'defaultChannelId' => $defaultChannel?->id,
            'users' => $users, // <-- Pass the new 'users' array as a prop
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'channel_id' => 'required|exists:channels,id',
            'body' => 'required|string',
        ]);

        Message::create([
            'user_id' => $request->user()->id,
            'channel_id' => $request->channel_id,
            'body' => $request->body,
        ]);

        return Redirect::back();
    }
}