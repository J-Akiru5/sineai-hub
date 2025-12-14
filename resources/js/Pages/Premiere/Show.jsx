import React, { useState, useRef, useEffect } from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import CommentSection from '@/Components/Premiere/CommentSection';

const THEATER_MAX_WIDTH = '98vw';
const GLOW_SCALE_WIDTH = '115%';
const GLOW_MAX_WIDTH = '1800px';
const GLOW_RADIUS = '32px';

const sanitizeMediaUrl = (url) => {
    if (!url) return null;
    if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))) return null;
    try {
        const base = (typeof window !== 'undefined' && window.location?.origin) || 'https://sineai.local';
        const parsed = new URL(url, base);
        const protocol = parsed.protocol.toLowerCase();
        if (protocol === 'http:' || protocol === 'https:') {
            return url;
        }
    } catch (e) {
        return null;
    }
    return null;
};

const escapeForCssUrl = (value) => {
    if (!value) return null;
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(value);
    }
    return value.replace(/([\\'"()\s])/g, '\\$1');
};

export default function Show({ project, suggestedVideos, comments }) {
    const [isPaused, setIsPaused] = useState(true);
    const videoRef = useRef(null);
    const glowMedia = sanitizeMediaUrl(project?.thumbnail_url || project?.video_url || null);
    const escapedGlowMedia = escapeForCssUrl(glowMedia);
    const glowBackgroundStyle = escapedGlowMedia ? { '--glow-image': `url(${escapedGlowMedia})` } : {};

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

            <div className="w-full bg-black text-white">
                <div
                    className="mx-auto min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-10 py-10 relative overflow-hidden w-full"
                    style={{ maxWidth: THEATER_MAX_WIDTH }}
                >
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.6)_45%,rgba(0,0,0,0.95)_90%)]" />

                    <div className="relative w-full max-w-6xl aspect-video rounded-[28px] overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                        <div className="absolute inset-0 -z-10 flex items-center justify-center">
                            <div
                                className="relative aspect-video overflow-hidden blur-3xl saturate-150 opacity-60 scale-110 bg-center bg-cover"
                                style={{
                                    width: GLOW_SCALE_WIDTH,
                                    maxWidth: GLOW_MAX_WIDTH,
                                    borderRadius: GLOW_RADIUS,
                                    ...glowBackgroundStyle,
                                    backgroundImage: glowBackgroundStyle['--glow-image'] ? 'var(--glow-image)' : undefined,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
                            </div>
                        </div>

                        <video
                            ref={videoRef}
                            src={project.video_url}
                            controls
                            autoPlay
                            onPlay={() => setIsPaused(false)}
                            onPause={() => setIsPaused(true)}
                            className="relative z-10 w-full h-full bg-black object-cover"
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 pb-16 text-white max-w-[60%] pointer-events-none">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 [text-shadow:0_4px_16px_rgba(0,0,0,0.9)]">{project.title}</h1>
                                <p className="text-amber-200 line-clamp-3 [text-shadow:0_3px_12px_rgba(0,0,0,0.8)]">{project.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pb-12 grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-9">
                        <div className="flex items-center gap-4">
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

                        <div className="mt-4 text-amber-200 leading-relaxed">
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
