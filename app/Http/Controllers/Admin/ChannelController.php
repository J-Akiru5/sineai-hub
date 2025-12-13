<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Channel;
use App\Models\Role;
use Inertia\Inertia;

class ChannelController extends Controller
{
    public function index()
    {
        $channels = Channel::with('allowedRole')->orderBy('name')->paginate(20);
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Admin/Channels/Index', [
            'channels' => $channels,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'allowed_role_id' => ['nullable', 'integer', 'exists:roles,id'],
        ]);

        $channel = Channel::create($data);

        try {
            \App\Services\Logger::log('SYSTEM', 'CHANNEL_CREATED', sprintf('%s created channel %s', auth()->user()?->name ?? 'System', $channel->name));
        } catch (\Throwable $e) {
        }

        return redirect()->back()->with('success', 'Channel created.');
    }

    public function update(Request $request, Channel $channel)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'description' => ['nullable', 'string'],
            'allowed_role_id' => ['nullable', 'integer', 'exists:roles,id'],
        ]);

        $channel->update($data);

        try {
            \App\Services\Logger::log('SYSTEM', 'CHANNEL_UPDATED', sprintf('%s updated channel %s', auth()->user()?->name ?? 'System', $channel->name));
        } catch (\Throwable $e) {
        }

        return redirect()->back()->with('success', 'Channel updated.');
    }

    public function destroy(Channel $channel)
    {
        try {
            \App\Services\Logger::log('SYSTEM', 'CHANNEL_DELETED', sprintf('%s deleted channel %s', auth()->user()?->name ?? 'System', $channel->name));
        } catch (\Throwable $e) {
        }

        $channel->delete();
        return redirect()->back()->with('success', 'Channel deleted.');
    }
}
