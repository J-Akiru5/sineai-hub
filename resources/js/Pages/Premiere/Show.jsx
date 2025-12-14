import React, { useState, useRef, useEffect } from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head, router } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import PremiereSidebar from '@/Components/Premiere/PremiereSidebar';
import supabase from '@/supabase';
import Swal from 'sweetalert2';

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
    const [isEnded, setIsEnded] = useState(false);
    const [resumePrompt, setResumePrompt] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const glowMedia = sanitizeMediaUrl(project?.thumbnail_url || project?.video_url || null);
    const escapedGlowMedia = escapeForCssUrl(glowMedia);
    const glowBackgroundStyle = escapedGlowMedia ? { '--glow-image': `url(${escapedGlowMedia})`, backgroundImage: 'var(--glow-image)' } : {};
    const playlistId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('playlist_id') : null;
    const playlistMode = !!playlistId;
    const upNextItems = suggestedVideos?.slice?.(0, 3) || [];

    useEffect(() => {
        function onKey(e) {
            const active = document.activeElement;
            const typingTags = ['INPUT', 'TEXTAREA'];
            if (active && (typingTags.includes(active.tagName) || active.isContentEditable)) return;

            if (!videoRef.current) return;

            if (['Space', 'KeyK'].includes(e.code)) {
                e.preventDefault();
                if (videoRef.current.paused) videoRef.current.play(); else videoRef.current.pause();
            }

            if (e.code === 'KeyF') {
                e.preventDefault();
                const player = videoRef.current;
                if (!document.fullscreenElement && player?.requestFullscreen) {
                    player.requestFullscreen();
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }

            if (e.code === 'KeyM') {
                e.preventDefault();
                if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 10);
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
            }
        }

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Persist currentTime every 5 seconds while playing
    useEffect(() => {
        if (!project?.id) return;
        let interval = null;

        function startInterval() {
            if (interval) return;
            interval = setInterval(() => {
                if (videoRef.current && !isEnded) {
                    window.localStorage.setItem(`resume_project_${project.id}`, String(videoRef.current.currentTime));
                }
            }, 5000);
        }

        function stopInterval() {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }

        const onPlay = () => startInterval();
        const onPause = () => stopInterval();
        const onEnded = () => stopInterval();

        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.addEventListener('play', onPlay);
            videoEl.addEventListener('pause', onPause);
            videoEl.addEventListener('ended', onEnded);
        }

        return () => {
            stopInterval();
            if (videoEl) {
                videoEl.removeEventListener('play', onPlay);
                videoEl.removeEventListener('pause', onPause);
                videoEl.removeEventListener('ended', onEnded);
            }
        };
    }, [project?.id, isEnded]);

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

    // Resume playback
    useEffect(() => {
        if (!project?.id || typeof window === 'undefined') return;
        const key = `resume_project_${project.id}`;
        const stored = window.localStorage.getItem(key);
        if (stored) {
            const time = parseFloat(stored);
            if (!Number.isNaN(time) && time > 30) {
                setResumePrompt(time);
            }
        }
        const handleBeforeUnload = () => {
            if (videoRef.current) {
                window.localStorage.setItem(key, String(videoRef.current.currentTime));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [project?.id]);

    const handlePauseStore = () => {
        if (typeof window === 'undefined' || !project?.id || !videoRef.current) return;
        window.localStorage.setItem(`resume_project_${project.id}`, String(videoRef.current.currentTime));
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResume = () => {
        if (!videoRef.current || resumePrompt == null) return;
        videoRef.current.currentTime = resumePrompt;
        videoRef.current.play();
        setResumePrompt(null);
    };

    const handleReplay = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsEnded(false);
    };

    const openPlaylistModal = async () => {
        setShowPlaylistModal(true);
        setLoadingPlaylists(true);
        try {
            const res = await fetch(route('playlists.index'), {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setUserPlaylists(data.data || []);
        } catch (e) {
            console.error('Failed to load playlists', e);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const addToPlaylist = (playlistId) => {
        router.post(route('playlists.addProject', playlistId),
            { project_id: project.id },
            {
                onSuccess: () => {
                    setShowPlaylistModal(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to Playlist',
                        text: 'Video has been added to your playlist successfully!',
                        background: '#1e293b',
                        color: '#fff',
                        confirmButtonColor: '#f59e0b',
                        timer: 3000,
                        timerProgressBar: true
                    });
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed',
                        text: 'Could not add video to playlist. Please try again.',
                        background: '#1e293b',
                        color: '#fff',
                        confirmButtonColor: '#f59e0b'
                    });
                },
                preserveScroll: true
            }
        );
    };

    const submitReport = (e) => {
        e.preventDefault();
        if (!reportReason.trim()) return;

        setSubmittingReport(true);
        router.post(route('flags.store'),
            {
                project_id: project.id,
                reason: reportReason,
                details: reportDetails
            },
            {
                onSuccess: () => {
                    setShowReportModal(false);
                    setReportReason('');
                    setReportDetails('');
                    Swal.fire({
                        icon: 'success',
                        title: 'Report Submitted',
                        text: 'Thank you for your report. Our team will review it shortly.',
                        background: '#1e293b',
                        color: '#fff',
                        confirmButtonColor: '#f59e0b',
                        timer: 4000,
                        timerProgressBar: true
                    });
                },
                onError: () => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Submission Failed',
                        text: 'Could not submit your report. Please try again.',
                        background: '#1e293b',
                        color: '#fff',
                        confirmButtonColor: '#f59e0b'
                    });
                },
                onFinish: () => setSubmittingReport(false),
                preserveScroll: true
            }
        );
    };

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

                            <div className={`relative overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-white/10 bg-black transition duration-500 ${isEnded ? 'scale-80 opacity-40' : 'scale-100 opacity-100'}`}>
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
                                    onPause={() => {
                                        setIsPaused(true);
                                        handlePauseStore();
                                    }}
                                    onEnded={() => setIsEnded(true)}
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

                                {resumePrompt != null && !isEnded && (
                                    <div className="absolute top-4 left-4 z-20">
                                        <button
                                            onClick={handleResume}
                                            className="px-4 py-2 rounded-full bg-amber-500 text-black font-semibold shadow-lg hover:bg-amber-400 transition"
                                        >
                                            Resume from {formatTime(resumePrompt)}?
                                        </button>
                                    </div>
                                )}

                                {isEnded && upNextItems.length > 0 && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md">
                                        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 max-w-3xl w-full shadow-2xl">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-white text-lg font-semibold">Up Next</div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleReplay}
                                                        className="px-3 py-1 bg-amber-500 text-black rounded font-semibold"
                                                    >
                                                        Replay
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEnded(false)}
                                                        className="text-amber-300 hover:text-amber-200 text-sm"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {upNextItems.map((item) => (
                                                    <a
                                                        key={item.id}
                                                        href={route('premiere.show', item.id)}
                                                        className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400 transition shadow"
                                                    >
                                                        <div className="aspect-video overflow-hidden">
                                                            <img src={item.thumbnail_url || item.video_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                        </div>
                                                        <div className="p-3 space-y-1">
                                                            <div className="text-white font-semibold line-clamp-2">{item.title}</div>
                                                            <div className="text-xs text-amber-300">{item.user?.name}</div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`${sidebarOpen ? 'w-full lg:w-80 xl:w-96' : 'hidden lg:block lg:w-0'} transition-all duration-200`}>
                            {sidebarOpen && <PremiereSidebar comments={comments} projectId={project.id} playlistMode={playlistMode} playlistItems={suggestedVideos} />}
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
                            <button
                                onClick={openPlaylistModal}
                                className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400 transition"
                            >
                                Add to Playlist
                            </button>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="px-4 py-2 bg-slate-800 text-amber-200 rounded-lg hover:bg-slate-700 transition"
                            >
                                Report
                            </button>
                        </div>

                        {/* Add to Playlist Modal */}
                        {showPlaylistModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPlaylistModal(false)}>
                                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white">Add to Playlist</h3>
                                        <button onClick={() => setShowPlaylistModal(false)} className="text-slate-400 hover:text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {loadingPlaylists ? (
                                        <div className="py-8 text-center text-amber-200">Loading playlists...</div>
                                    ) : userPlaylists.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-slate-400 mb-4">You don't have any playlists yet.</p>
                                            <a href={route('playlists.index')} className="inline-block px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-400">
                                                Create Playlist
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {userPlaylists.map((pl) => (
                                                <button
                                                    key={pl.id}
                                                    onClick={() => addToPlaylist(pl.id)}
                                                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400 transition"
                                                >
                                                    <div className="font-semibold text-white">{pl.title}</div>
                                                    <div className="text-xs text-slate-400">{pl.projects_count || 0} videos</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Report Modal */}
                        {showReportModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
                                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white">Report Video</h3>
                                        <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={submitReport} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-amber-100 mb-2">Reason</label>
                                            <select
                                                value={reportReason}
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-full rounded-lg bg-slate-800/40 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400 p-2"
                                                required
                                            >
                                                <option value="">Select a reason</option>
                                                <option value="inappropriate">Inappropriate Content</option>
                                                <option value="spam">Spam or Misleading</option>
                                                <option value="copyright">Copyright Violation</option>
                                                <option value="violence">Violence or Harmful Content</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-amber-100 mb-2">Additional Details (Optional)</label>
                                            <textarea
                                                value={reportDetails}
                                                onChange={(e) => setReportDetails(e.target.value)}
                                                rows={3}
                                                className="w-full rounded-lg bg-slate-800/40 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400 p-2"
                                                placeholder="Provide more details about this report..."
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowReportModal(false)}
                                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingReport || !reportReason}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submittingReport ? 'Submitting...' : 'Submit Report'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

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
