import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FolderOpen, Plus, Video, Clock, Edit3, Trash2, Copy,
    MoreVertical, Film, Settings, Play
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Projects({ auth, projects, quota }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        router.post(route('studio.projects.store'), {
            name: newProjectName,
            description: newProjectDesc,
        }, {
            onSuccess: () => {
                setShowCreateModal(false);
                setNewProjectName('');
                setNewProjectDesc('');
            },
        });
    };

    const handleDelete = (project) => {
        Swal.fire({
            title: 'Delete Project?',
            text: `"${project.name}" will be permanently deleted.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Delete',
            background: '#1e293b',
            color: '#fef3c7',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('studio.projects.destroy', project.id));
            }
        });
    };

    const handleDuplicate = (project) => {
        router.post(route('studio.projects.duplicate', project.id));
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
            rendering: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            failed: 'bg-red-500/20 text-red-300 border-red-500/30',
        };
        return styles[status] || styles.draft;
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-amber-100 leading-tight flex items-center gap-2">
                        <Film className="w-6 h-6 text-amber-400" />
                        Video Projects
                    </h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>
            }
        >
            <Head title="Video Projects" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Storage Quota Banner */}
                    <div className="mb-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-amber-200">Storage Used</span>
                            <span className="text-sm text-amber-300 font-medium">
                                {quota.formatted_used} / {quota.formatted_total}
                            </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    quota.percentage > 90 ? 'bg-red-500' :
                                    quota.percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${quota.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {projects.length === 0 ? (
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                            <Film className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-amber-100 mb-2">No Projects Yet</h3>
                            <p className="text-amber-300/60 mb-6">Create your first video project to get started.</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-emerald-500 transition"
                            >
                                Create Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
                                >
                                    {/* Thumbnail */}
                                    <Link href={route('studio.editor.edit', project.id)}>
                                        <div className="aspect-video bg-slate-800 relative">
                                            {project.thumbnail_url ? (
                                                <img
                                                    src={project.thumbnail_url}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Video className="w-12 h-12 text-slate-600" />
                                                </div>
                                            )}
                                            
                                            {/* Play overlay */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white ml-1" />
                                                </div>
                                            </div>

                                            {/* Duration */}
                                            {project.duration_seconds > 0 && (
                                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-mono">
                                                    {project.formatted_duration}
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <Link
                                                href={route('studio.editor.edit', project.id)}
                                                className="font-semibold text-white hover:text-emerald-400 transition truncate flex-1"
                                            >
                                                {project.name}
                                            </Link>
                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusBadge(project.status)}`}>
                                                {project.status}
                                            </span>
                                        </div>

                                        {project.description && (
                                            <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                                {project.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(project.updated_at).toLocaleDateString()}
                                            </span>
                                            <span>
                                                {project.assets?.length || 0} assets
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                            <Link
                                                href={route('studio.editor.edit', project.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition text-sm font-medium"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDuplicate(project)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                                                title="Duplicate"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold text-amber-100 mb-4">Create New Project</h3>
                        
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-amber-200 mb-1">Project Name *</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-emerald-500"
                                    placeholder="My Awesome Video"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-200 mb-1">Description</label>
                                <textarea
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                                    rows={3}
                                    placeholder="What's this project about?"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newProjectName.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-emerald-500 transition disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
