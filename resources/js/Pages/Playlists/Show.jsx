import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Play, 
    Shuffle, 
    ListOrdered, 
    Trash2, 
    GripVertical, 
    Eye, 
    Clock, 
    User,
    Globe,
    Lock,
    EyeOff,
    ChevronLeft,
    MoreVertical
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Show({ auth, playlist, isOwner }) {
    const [draggedItem, setDraggedItem] = useState(null);
    const projects = playlist.projects || [];
    
    const totalDuration = projects.reduce((acc, p) => acc + (p.duration || 0), 0);
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const playAll = () => {
        if (projects.length > 0) {
            router.visit(route('premiere.show', projects[0].id) + `?playlist=${playlist.id}`);
        }
    };

    const shufflePlay = () => {
        if (projects.length > 0) {
            const randomIndex = Math.floor(Math.random() * projects.length);
            router.visit(route('premiere.show', projects[randomIndex].id) + `?playlist=${playlist.id}&shuffle=1`);
        }
    };

    const removeFromPlaylist = (projectId) => {
        Swal.fire({
            title: 'Remove from playlist?',
            text: 'This video will be removed from this playlist.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Remove',
            background: '#1e293b',
            color: '#fef3c7',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('playlists.removeProject', playlist.id), {
                    project_id: projectId,
                }, {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === dropIndex) return;

        const newOrder = [...projects];
        const [dragged] = newOrder.splice(draggedItem, 1);
        newOrder.splice(dropIndex, 0, dragged);
        
        // Send new order to server
        router.post(route('playlists.reorder', playlist.id), {
            order: newOrder.map(p => p.id),
        }, {
            preserveScroll: true,
        });
        
        setDraggedItem(null);
    };

    const visibilityIcon = {
        public: <Globe className="w-4 h-4" />,
        private: <Lock className="w-4 h-4" />,
        unlisted: <EyeOff className="w-4 h-4" />,
    };

    const visibilityLabel = {
        public: 'Public',
        private: 'Private',
        unlisted: 'Unlisted',
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex items-center gap-3">
                    <Link href={route('playlists.index')} className="p-2 hover:bg-white/10 rounded-lg transition">
                        <ChevronLeft className="w-5 h-5 text-amber-300" />
                    </Link>
                    <h2 className="font-semibold text-xl text-amber-100 leading-tight truncate">{playlist.title}</h2>
                </div>
            }
        >
            <Head title={playlist.title} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Playlist Info Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-amber-900/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden sticky top-6">
                                {/* Hero Thumbnail */}
                                <div className="relative aspect-video bg-gradient-to-br from-amber-500/20 to-purple-500/20">
                                    {projects[0]?.thumbnail_url ? (
                                        <img 
                                            src={projects[0].thumbnail_url} 
                                            alt={playlist.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ListOrdered className="w-16 h-16 text-amber-500/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    
                                    {/* Play All Button Overlay */}
                                    <button 
                                        onClick={playAll}
                                        disabled={projects.length === 0}
                                        className="absolute inset-0 flex items-center justify-center group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-amber-500/90 backdrop-blur flex items-center justify-center transform group-hover:scale-110 transition-all shadow-lg shadow-amber-500/30">
                                            <Play className="w-8 h-8 text-slate-900 ml-1" fill="currentColor" />
                                        </div>
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-5">
                                    <h1 className="text-2xl font-bold text-amber-100 mb-2">{playlist.title}</h1>
                                    
                                    {/* Creator */}
                                    <div className="flex items-center gap-2 text-amber-300/80 mb-4">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm">{playlist.user?.name || 'Unknown'}</span>
                                    </div>

                                    {/* Description */}
                                    {playlist.description && (
                                        <p className="text-amber-100/70 text-sm mb-4 line-clamp-3">{playlist.description}</p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-amber-300/70 mb-5">
                                        <div className="flex items-center gap-1.5">
                                            {visibilityIcon[playlist.visibility]}
                                            <span>{visibilityLabel[playlist.visibility]}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ListOrdered className="w-4 h-4" />
                                            <span>{projects.length} videos</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatDuration(totalDuration)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={playAll}
                                            disabled={projects.length === 0}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Play className="w-5 h-5" fill="currentColor" />
                                            Play All
                                        </button>
                                        <button
                                            onClick={shufflePlay}
                                            disabled={projects.length === 0}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-amber-100 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Shuffle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Videos List */}
                        <div className="lg:col-span-2">
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                                {projects.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <ListOrdered className="w-16 h-16 text-amber-500/30 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-amber-100 mb-2">This playlist is empty</h3>
                                        <p className="text-amber-300/60">Add videos from the Premiere page to get started.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {projects.map((project, index) => (
                                            <div
                                                key={project.id}
                                                draggable={isOwner}
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDrop={(e) => handleDrop(e, index)}
                                                className={`group flex items-center gap-4 p-4 hover:bg-white/5 transition ${
                                                    draggedItem === index ? 'opacity-50' : ''
                                                }`}
                                            >
                                                {/* Drag Handle / Index */}
                                                {isOwner ? (
                                                    <div className="w-8 flex justify-center cursor-grab active:cursor-grabbing">
                                                        <GripVertical className="w-5 h-5 text-amber-500/50 group-hover:text-amber-500" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 flex justify-center">
                                                        <span className="text-amber-500/70 text-sm font-medium">{index + 1}</span>
                                                    </div>
                                                )}

                                                {/* Thumbnail */}
                                                <Link 
                                                    href={route('premiere.show', project.id) + `?playlist=${playlist.id}`}
                                                    className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-slate-800"
                                                >
                                                    {project.thumbnail_url ? (
                                                        <img 
                                                            src={project.thumbnail_url} 
                                                            alt={project.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Play className="w-8 h-8 text-amber-500/30" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                                                        <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition" fill="currentColor" />
                                                    </div>
                                                    {/* Duration Badge */}
                                                    {project.duration && (
                                                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                                                            {formatDuration(project.duration)}
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <Link 
                                                        href={route('premiere.show', project.id) + `?playlist=${playlist.id}`}
                                                        className="block"
                                                    >
                                                        <h3 className="font-semibold text-amber-100 group-hover:text-amber-300 transition line-clamp-2 mb-1">
                                                            {project.title}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex items-center gap-3 text-sm text-amber-300/60">
                                                        <span>{project.user?.name}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            {project.views_count?.toLocaleString() || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {isOwner && (
                                                    <button
                                                        onClick={() => removeFromPlaylist(project.id)}
                                                        className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                                                        title="Remove from playlist"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
