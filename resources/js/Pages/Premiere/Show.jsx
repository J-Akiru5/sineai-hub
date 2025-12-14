import React, { useState, useRef, useEffect } from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import CommentSection from '@/Components/Premiere/CommentSection';

export default function Show({ project, suggestedVideos, comments }) {
    const [isPaused, setIsPaused] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        function onKey(e) {
            const active = document.activeElement;
            const typingTags = ['INPUT', 'TEXTAREA'];
            if (active && (typingTags.includes(active.tagName) || active.isContentEditable)) return;

            if (!videoRef.current) return;

            // Space or 'k' toggles play
            if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
                e.preventDefault();
                if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause();
            }

            // Arrow keys seek
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 5);
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
            }
        }

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <CinemaLayout>
            <Head title={project.title} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Main column: 75% width (9/12) */}
                    <div className="col-span-12 lg:col-span-9">
                        <div className="bg-black relative">
                            <video
                                ref={videoRef}
                                src={project.video_url}
                                controls
                                autoPlay
                                onPlay={() => setIsPaused(false)}
                                onPause={() => setIsPaused(true)}
                                className="w-full h-[60vh] lg:h-[70vh] bg-black"
                                style={{ objectFit: 'cover' }}
                            />

                            {/* Overlay */}
                            <div
                                onClick={() => {
                                    // toggle play when overlay clicked
                                    if (videoRef?.current) {
                                        if (videoRef.current.paused) {
                                            videoRef.current.play();
                                        } else {
                                            videoRef.current.pause();
                                        }
                                    }
                                }}
                                className={`absolute inset-0 transition-opacity ${isPaused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 pb-24 text-white max-w-[60%] pointer-events-none">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">{project.title}</h1>
                                    <p className="text-amber-200 line-clamp-3 [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">{project.description}</p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-6 text-white">
                            <div className="flex items-center gap-4 mt-3">
                                <div className="h-12 w-12 rounded-full bg-slate-700 overflow-hidden">
                                    {project.user?.avatar_url ? (
                                        <img src={project.user.avatar_url} alt={project.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-amber-300">{project.user?.name?.[0] ?? 'U'}</div>
                                    )}
                                </div>

                                <div>
                                    <div className="text-sm text-amber-300">by {project.user?.name}</div>
                                    <div className="text-xs text-slate-400">{project.views_count ?? 0} views • {new Date(project.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="mt-4 text-amber-200">
                                {project.description}
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <button className="px-3 py-2 bg-amber-500 text-black rounded">Add to Playlist</button>
                                <button className="px-3 py-2 bg-slate-800 text-amber-200 rounded">Report</button>
                            </div>

                            <div className="mt-6">
                                <CommentSection comments={comments} projectId={project.id} />
                            </div>
                        </div>
                    </div>

                    {/* Suggestions column: 25% width (3/12) */}
                    <aside className="col-span-12 lg:col-span-3">
                        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
                            <SuggestedVideos videos={suggestedVideos} />
                        </div>
                    </aside>
                </div>
            </div>
        </CinemaLayout>
    );
}
