import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Heart, Calendar, Clock, FileText, Film, ExternalLink } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function Show({ auth, project }) {
    const { isDark } = useTheme();
    const title = project?.title ?? 'Untitled Project';
    const creator = project?.user?.name ?? 'Unknown Creator';
    const description = project?.description ?? '';
    const videoUrl = project?.video_url ?? project?.thumbnail_url ?? null;
    const scripts = project?.scripts || [];
    const isOwner = auth?.user?.id === project?.user_id;

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">{title}</h2>}
        >
            <Head title={title} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Video Player */}
                        <div className="lg:col-span-8">
                            <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/60 border-slate-200'
                                }`}>
                                {videoUrl ? (
                                    <video
                                        controls
                                        preload="none"
                                        playsInline
                                        disableRemotePlayback
                                        poster={project.thumbnail_url || '/images/video-placeholder.jpg'}
                                        className="w-full h-[480px] md:h-[560px] object-cover bg-black"
                                    >
                                        <source src={videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <div className={`w-full h-[480px] md:h-[560px] flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        <div className="text-center">
                                            <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p>No media available</p>
                                            </div>
                                    </div>
                                )}
                            </div>

                            {/* Project Details */}
                            <div className={`mt-6 backdrop-blur-xl border rounded-2xl p-6 ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/60 border-slate-200'
                                }`}>
                                <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'
                                    }`}>About This Project</h2>

                                <div className={`whitespace-pre-line ${isDark ? 'text-slate-300' : 'text-slate-700'
                                    }`}>
                                    {description || 'No description provided.'}
                                </div>

                                {/* Additional Info */}
                                {(project.category || project.release_year || project.language) && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {project.category && (
                                                <div>
                                                    <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'
                                                        }`}>Category</p>
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'
                                                        }`}>{project.category}</p>
                                                </div>
                                            )}
                                            {project.release_year && (
                                                <div>
                                                    <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'
                                                        }`}>Year</p>
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'
                                                        }`}>{project.release_year}</p>
                                                </div>
                                            )}
                                            {project.language && (
                                                <div>
                                                    <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'
                                                        }`}>Language</p>
                                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'
                                                        }`}>{project.language}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Project Info Card */}
                            <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-lg ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/60 border-slate-200'
                                }`}>
                                <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-amber-200' : 'text-amber-600'
                                    }`}>{title}</h1>
                                <div className={`text-sm mb-4 ${isDark ? 'text-amber-300' : 'text-amber-500'
                                    }`}>By {creator}</div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'
                                        }`}>
                                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                                            <Eye className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-wider">Views</span>
                                        </div>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'
                                            }`}>{project.views_count?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'
                                        }`}>
                                        <div className="flex items-center gap-2 text-red-400 mb-1">
                                            <Heart className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-wider">Likes</span>
                                        </div>
                                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'
                                            }`}>{project.likes_count?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl col-span-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'
                                        }`}>
                                        <div className="flex items-center gap-2 text-amber-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-wider">Published</span>
                                        </div>
                                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'
                                            }`}>{formatDate(project.created_at)}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        href={route('premiere.index')}
                                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                                    >
                                        Back to Premiere
                                    </Link>

                                    {isOwner && (
                                        <button
                                            onClick={() => {
                                                if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
                                                router.delete(route('projects.destroy', project.id));
                                            }}
                                            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl border border-red-500/30 transition-all"
                                        >
                                            Delete Project
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Synced Scripts */}
                            {isOwner && (
                                <div className={`backdrop-blur-xl border rounded-2xl p-6 shadow-lg ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/60 border-slate-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'
                                            }`}>
                                            <FileText className="w-5 h-5 text-purple-400" />
                                            Linked Scripts
                                        </h3>
                                        {scripts.length > 0 && (
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                                                }`}>
                                                {scripts.length}
                                            </span>
                                        )}
                                    </div>

                                    {scripts.length === 0 ? (
                                        <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'
                                            }`}>
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm mb-3">No scripts linked yet</p>
                                            <Link
                                                href={route('scriptwriter.index')}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-colors border border-purple-500/30"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Create New Script
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {scripts.map((script) => (
                                                <Link
                                                    key={script.id}
                                                    href={route('scriptwriter.show', script.id)}
                                                    className={`block p-4 rounded-xl border transition-all group ${isDark
                                                            ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-500/30'
                                                            : 'bg-slate-100/50 hover:bg-slate-100 border-slate-200 hover:border-purple-500/30'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                                                <p className={`font-medium truncate group-hover:text-purple-400 transition-colors ${isDark ? 'text-white' : 'text-slate-900'
                                                                    }`}>
                                                                    {script.title || 'Untitled Script'}
                                                                </p>
                                                            </div>
                                                            <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'
                                                                }`}>
                                                                <Clock className="w-3 h-3" />
                                                                {formatDate(script.updated_at)}
                                                            </p>
                                                        </div>
                                                        <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-500'
                                                            }`} />
                                                    </div>
                                                </Link>
                                            ))}
                                            </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
