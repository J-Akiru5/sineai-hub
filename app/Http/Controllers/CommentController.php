<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'body' => ['required', 'string'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ]);

        $comment = Comment::create([
            'user_id' => auth()->id(),
            'project_id' => $validated['project_id'],
            'parent_id' => $validated['parent_id'] ?? null,
            'body' => $validated['body'],
        ]);

        return Redirect::back();
    }

    public function destroy(Comment $comment)
    {
        $user = auth()->user();
        if (!$user) {
            abort(403);
        }

        // Only author or admin can delete
        if ($user->id !== $comment->user_id && !$user->isAdmin()) {
            abort(403);
        }

        $comment->delete();

        return Redirect::back();
    }
}
