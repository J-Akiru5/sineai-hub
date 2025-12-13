import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import ProjectCard from '@/Components/ProjectCard';

export default function MyProjects({ auth, projects }) {
    const [view, setView] = useState('list'); // 'list' or 'grid'
    const items = projects?.data || [];

    function handleDelete(projectId) {
        if (!confirm('Delete this project? This cannot be undone.')) return;
        router.delete(route('projects.destroy', projectId));
    }

    return (
        <AuthenticatedLayout auth={auth} header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">My Studio</h2>}>
            <Head title="My Studio" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('list')} className={`px-3 py-1 rounded ${view === 'list' ? 'bg-amber-600 text-slate-900 font-semibold' : 'bg-slate-800 text-amber-200'}`}>List View</button>
                            <button onClick={() => setView('grid')} className={`px-3 py-1 rounded ${view === 'grid' ? 'bg-amber-600 text-slate-900 font-semibold' : 'bg-slate-800 text-amber-200'}`}>Grid View</button>
                        </div>
                        <div>
                            <Link href={route('projects.create')} className="inline-block px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 rounded-lg font-semibold shadow-md">+ Upload New Project</Link>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {items.length === 0 ? (
                            <div className="text-amber-200/80">You have not uploaded any projects yet.</div>
                        ) : (
                            view === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {items.map((project) => (
                                        <ProjectCard key={project.id} project={project} auth_user_id={auth?.user?.id} />
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-slate-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Thumbnail</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Title / Description</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Visibility</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Moderation</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">Uploaded</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-300">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-slate-900 divide-y divide-slate-700">
                                            {items.map((project) => (
                                                <tr key={project.id}>
                                                    <td className="px-4 py-3">
                                                        {project.thumbnail_url ? (
                                                            <img src={project.thumbnail_url} alt={project.title} className="h-16 w-28 object-cover rounded" />
                                                        ) : (
                                                            <div className="h-16 w-28 bg-gray-800 rounded flex items-center justify-center text-gray-400">No Thumb</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-amber-100">{project.title}</div>
                                                        <div className="text-sm text-amber-300 truncate max-w-xl">{project.description || '—'}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${project.visibility === 'public' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>{project.visibility}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {project.moderation_status === 'pending' ? (
                                                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-400 text-slate-900">Pending Review</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded text-xs bg-blue-600 text-white">{project.moderation_status}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-amber-300">{new Date(project.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={route('projects.show', project.id)} className="px-3 py-1 bg-slate-700 text-amber-200 rounded">View</Link>
                                                            <Link href={route('projects.edit', project.id)} className="px-3 py-1 bg-slate-700 text-amber-200 rounded">Edit</Link>
                                                            <button onClick={() => handleDelete(project.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}

                        {/* Pagination controls */}
                        {projects && projects.links && (
                            <div className="mt-6 flex items-center justify-center">
                                <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                                    {projects.links.map((link, idx) => (
                                        <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white/5 text-amber-200'}`} />
                                    ))}
                                </nav>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
