<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $channels = Channel::orderBy('name')
            ->where(function ($q) use ($user) {
                $q->whereNull('allowed_role_id')
                  ->orWhere(function ($q2) use ($user) {
                      if (! $user) {
                          return; // guest cannot match any roles
                      }
                      // users with admin privileges see all channels
                      if (method_exists($user, 'hasRole') && ($user->hasRole('admin') || $user->hasRole('super-admin'))) {
                          $q2->orWhereRaw('TRUE');
                          return;
                      }

                      // user must have role matching allowed_role_id
                      $roleIds = $user->roles->pluck('id')->toArray();
                      if (! empty($roleIds)) {
                          $q2->whereIn('allowed_role_id', $roleIds);
                      }
                  });
            })->get();

        // prefer the "General" channel as default when available, otherwise fall back to the first
        $defaultChannel = Channel::where('name', 'General')->first() ?? $channels->first();

        $messages = [];
        $users = []; // <-- Initialize an empty array for users

        if ($defaultChannel) {
            // load the most recent 100 messages but return them in ascending order (oldest -> newest)
            $messages = Message::where('channel_id', $defaultChannel->id)
                ->with('user:id,name,avatar_url')
                ->orderBy('created_at', 'desc')
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

    /**
     * Return messages for a specific channel (JSON).
     */
    public function show(Channel $channel)
    {
        $messages = Message::where('channel_id', $channel->id)
            ->with('user:id,name,avatar_url')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['messages' => $messages]);
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