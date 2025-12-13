<?php

namespace App\Http\Controllers;

use App\Models\ContentFlag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class FlagController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'reason' => ['required', 'string'],
        ]);

        ContentFlag::create([
            'user_id' => Auth::id(),
            'project_id' => $validated['project_id'],
            'reason' => $validated['reason'],
            'status' => 'open',
        ]);

        return Redirect::back()->with('success', 'Content flagged for review.');
    }
}
