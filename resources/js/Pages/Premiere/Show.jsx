import React, { useState, useRef, useEffect } from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import PremiereSidebar from '@/Components/Premiere/PremiereSidebar';
import supabase from '@/supabase';

const THEATER_MAX_WIDTH = '98vw';
const GLOW_SCALE_WIDTH = '115%';
const GLOW_MAX_WIDTH = '1800px';
const GLOW_RADIUS = '32px';

const sanitizeMediaUrl = (url) => {
    if (!url) return null;
    if (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'))) return null;
    try {
        const base = (typeof window !== 'undefined' && window.location?.origin) || 'http://localhost';
        const parsed = new URL(url, base);
        const protocol = parsed.protocol.toLowerCase();
        const allowedExt = /\.(png|jpe?g|webp|gif|mp4|webm|ogg)(\?.*)?$/i;
        if ((protocol === 'http:' || protocol === 'https:') && allowedExt.test(parsed.pathname)) {
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [watchingCount, setWatchingCount] = useState(1);
    const glowMedia = sanitizeMediaUrl(project?.thumbnail_url || project?.video_url || null);
    const escapedGlowMedia = escapeForCssUrl(glowMedia);
    const glowBackgroundStyle = escapedGlowMedia ? { '--glow-image': `url(${escapedGlowMedia})`, backgroundImage: 'var(--glow-image)' } : {};

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

    useEffect(() => {
        if (!project?.id) return;
        const channel = supabase.channel(`premiere-presence-${project.id}`, {
            config: { presence: { key: `viewer-${Math.random().toString(36).slice(2)}` } },
        });

        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const total = Object.values(state || {}).reduce((sum, viewers) => sum + (viewers?.length || 0), 0);
            setWatchingCount(Math.max(total, 1));
        });

        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                channel.track({ online_at: new Date().toISOString() });
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [project?.id]);

    return (
        <CinemaLayout>
            <Head title={project.title} />

            <div className="w-full bg-black text-white">
                <div className="mx-auto" style={{ maxWidth: THEATER_MAX_WIDTH }}>
                    <div className="px-4 sm:px-6 lg:px-10 py-8 flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-sm font-semibold shadow-lg">
                                    🔴 {watchingCount} Watching Now
                                </span>
                                <button
                                    onClick={() => setSidebarOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
                                    aria-label="Toggle sidebar"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M4 6h16M4 12h16M4 18h10" />
                                    </svg>
                                    <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Show'} Sidebar</span>
                                </button>
                            </div>

                            <div className="relative overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-white/10 bg-black">
                                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.6)_45%,rgba(0,0,0,0.95)_90%)]" />
                                <div className="absolute inset-0 -z-10 flex items-center justify-center">
                                    <div
                                        className="relative aspect-video overflow-hidden blur-3xl saturate-150 opacity-60 scale-110 bg-center bg-cover"
                                        style={{
                                            width: GLOW_SCALE_WIDTH,
                                            maxWidth: GLOW_MAX_WIDTH,
                                            borderRadius: GLOW_RADIUS,
                                            ...glowBackgroundStyle,
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

                        <div className={`${sidebarOpen ? 'w-full lg:w-80 xl:w-96' : 'hidden lg:block lg:w-0'} transition-all duration-200`}>
                            {sidebarOpen && <PremiereSidebar comments={comments} projectId={project.id} />}
                        </div>
                    </div>

                    <div className="px-4 sm:px-6 lg:px-10 pb-12 flex flex-col gap-4">
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

                        <div className="text-amber-200 leading-relaxed">
                            {project.description}
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-3 py-2 bg-amber-500 text-black rounded">Add to Playlist</button>
                            <button className="px-3 py-2 bg-slate-800 text-amber-200 rounded">Report</button>
                        </div>

                        <div className="pt-4">
                            <h2 className="text-lg font-semibold mb-2 text-white">More Like This</h2>
                            <SuggestedVideos videos={suggestedVideos} />
                        </div>
                    </div>
                </div>
            </div>
        </CinemaLayout>
    );
}
