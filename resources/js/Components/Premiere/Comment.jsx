import React from 'react';
import { usePage, router } from '@inertiajs/react';

export default function Comment({ comment }) {
    const { auth } = usePage().props;
    const isOwner = auth?.user?.id === comment.user_id;

    function destroy() {
        if (!confirm('Delete this comment?')) return;
        router.delete(route('comments.destroy', comment.id));
    }

    return (
        <div className="bg-slate-900 p-4 rounded">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-amber-200 font-medium">{comment.user?.name}</div>
                        <div className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-slate-200 whitespace-pre-wrap">{comment.body}</div>
                </div>

                {isOwner && (
                    <div>
                        <button onClick={destroy} className="text-rose-400 text-sm">Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}
