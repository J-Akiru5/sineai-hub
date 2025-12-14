<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Redirect;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Script;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $channels = Channel::orderBy('category')
            ->orderBy('name')
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

                      // officers can see officer channels
                      if (method_exists($user, 'hasRole') && $user->hasRole('officer')) {
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

        // Allow the client to request a specific channel via query param (e.g. /chat?channel=2)
        $requestedChannelId = $request->query('channel');

        // prefer the "General" channel as default when available, otherwise fall back to the first
        $defaultChannel = Channel::where('name', 'General')->first() ?? $channels->first();

        // If a channel was requested, and the user has access to it, prefer that as the default
        if ($requestedChannelId) {
            $maybe = $channels->firstWhere('id', $requestedChannelId);
            if ($maybe) {
                $defaultChannel = $maybe;
            }
        }

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

        // Determine if user can post announcements (officers and admins)
        $canAnnounce = false;
        if ($user && method_exists($user, 'hasRole')) {
            $canAnnounce = $user->hasRole('officer') || $user->hasRole('admin') || $user->hasRole('super-admin');
        }

        return Inertia::render('Chat/Index', [
            'channels' => $channels,
            'messages' => $messages,
            'defaultChannelId' => $defaultChannel?->id,
            'users' => $users, // <-- Pass the new 'users' array as a prop
            'canAnnounce' => $canAnnounce,
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
            'body' => 'nullable|string',
            'message_type' => 'nullable|string|in:text,announcement,script,project',
            'attachment_data' => 'nullable|array',
        ]);

        $user = $request->user();
        $messageType = $request->message_type ?? 'text';

        // Only officers and admins can post announcements
        if ($messageType === 'announcement') {
            if (!method_exists($user, 'hasRole') || 
                (!$user->hasRole('officer') && !$user->hasRole('admin') && !$user->hasRole('super-admin'))) {
                return response()->json(['error' => 'Unauthorized to post announcements'], 403);
            }
        }

        // Validate that body is provided for text/announcement messages
        if (in_array($messageType, ['text', 'announcement']) && empty($request->body)) {
            return response()->json(['error' => 'Message body is required'], 422);
        }

        Message::create([
            'user_id' => $user->id,
            'channel_id' => $request->channel_id,
            'body' => $request->body ?? '',
            'message_type' => $messageType,
            'attachment_data' => $request->attachment_data,
        ]);

        return Redirect::back();
    }

    /**
     * Return the current user's scripts for sharing in chat.
     */
    public function userScripts(Request $request)
    {
        $scripts = Script::where('user_id', $request->user()->id)
            ->select('id', 'title', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['scripts' => $scripts]);
    }

    /**
     * Return the current user's projects for sharing in chat.
     */
    public function userProjects(Request $request)
    {
        $projects = Project::where('user_id', $request->user()->id)
            ->select('id', 'title', 'thumbnail_url', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json(['projects' => $projects]);
    }
}