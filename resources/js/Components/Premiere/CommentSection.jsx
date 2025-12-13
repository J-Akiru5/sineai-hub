import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import Comment from './Comment';

export default function CommentSection({ comments, projectId }) {
    const form = useForm({ body: '', project_id: projectId });

    function submit(e) {
        e.preventDefault();
        form.post(route('comments.store'), {
            onSuccess: () => form.reset('body'),
        });
    }

    return (
        <div className="mt-6">
            <div className="bg-slate-800 p-4 rounded">
                <form onSubmit={submit}>
                    <label className="block text-sm font-medium text-amber-200">Add a comment</label>
                    <textarea
                        value={form.data.body}
                        onChange={(e) => form.setData('body', e.target.value)}
                        className="mt-2 w-full rounded bg-slate-900 text-white p-2"
                        rows={4}
                        placeholder="Write your comment..."
                    />
                    {form.errors.body && <p className="text-rose-500 text-sm mt-1">{form.errors.body}</p>}

                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="px-3 py-1 bg-amber-500 text-black rounded"
                        >
                            {form.processing ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 space-y-4">
                {comments?.data?.length > 0 ? (
                    comments.data.map((c) => <Comment key={c.id} comment={c} />)
                ) : (
                    <div className="text-slate-400">No comments yet — be the first to comment.</div>
                )}
            </div>

            {comments?.links && (
                <nav className="mt-4 flex items-center gap-2" aria-label="Comments pagination">
                    {comments.links.map((link, idx) => (
                        <span key={idx}>
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    as="button"
                                    className={`px-2 py-1 rounded ${link.active ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span className="px-2 py-1 rounded bg-slate-700 text-white" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </span>
                    ))}
                </nav>
            )}
        </div>
    );
}
