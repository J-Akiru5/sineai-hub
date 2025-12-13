import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Index({ auth, playlists }) {
    const [showCreate, setShowCreate] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        visibility: 'public',
    });

    function openCreate() { setShowCreate(true); }
    function closeCreate() { setShowCreate(false); }

    function submit(e) {
        e.preventDefault();
        post(route('playlists.store'), {
            onSuccess: () => {
                closeCreate();
                router.reload();
            }
        });
    }

    const items = playlists?.data || [];

    return (
        <AuthenticatedLayout auth={auth} header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">My Playlists</h2>}>
            <Head title="My Playlists" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <div />
                        <div>
                            <button onClick={openCreate} className="inline-block px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 rounded-lg font-semibold shadow-md">+ Create New Playlist</button>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {items.length === 0 ? (
                            <div className="text-amber-200/80">You have not created any playlists yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((pl) => (
                                    <div key={pl.id} className="p-4 bg-slate-800/40 rounded border border-white/6 flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-amber-100">{pl.title}</div>
                                            <div className="text-sm text-amber-300">{pl.projects_count ?? 0} videos</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-1 text-sm rounded ${pl.visibility === 'public' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{pl.visibility}</div>
                                            <Link href={route('playlists.show', pl.id)} className="px-3 py-1 bg-slate-700 text-amber-200 rounded">View</Link>
                                            <button onClick={() => { if (!confirm('Delete this playlist?')) return; router.delete(route('playlists.destroy', pl.id)); }} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {playlists && playlists.links && (
                            <div className="mt-6 flex items-center justify-center">
                                <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                                    {playlists.links.map((link, idx) => (
                                        <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white/5 text-amber-200'}`} />
                                    ))}
                                </nav>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-slate-900 rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-amber-100 font-semibold mb-4">Create Playlist</h3>
                        <form onSubmit={submit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-amber-100">Title</label>
                                <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1 block w-full rounded bg-slate-800/20 px-3 py-2 text-amber-100" />
                                {errors.title && <div className="mt-2 text-amber-200">{errors.title}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-amber-100">Description</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full mt-1 p-3 bg-slate-800/20 text-amber-100 rounded" rows={3} />
                                {errors.description && <div className="mt-2 text-amber-200">{errors.description}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-amber-100">Visibility</label>
                                <select value={data.visibility} onChange={(e) => setData('visibility', e.target.value)} className="w-full mt-1 border rounded px-2 py-1 bg-slate-800/20 text-amber-100">
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="unlisted">Unlisted</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={closeCreate} className="px-4 py-2 rounded bg-slate-700 text-amber-200">Cancel</button>
                                <button type="submit" disabled={processing} className="px-4 py-2 rounded bg-amber-500 text-slate-900">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
