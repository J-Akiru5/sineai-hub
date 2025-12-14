import React, { useState, useRef, useEffect, useCallback } from 'react';
import CinemaLayout from '@/Layouts/CinemaLayout';
import { Head, router, usePage } from '@inertiajs/react';
import SuggestedVideos from '@/Components/Premiere/SuggestedVideos';
import PremiereSidebar from '@/Components/Premiere/PremiereSidebar';
import supabase from '@/supabase';
import Swal from 'sweetalert2';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    ListVideo,
    Heart,
    Share2,
    Flag,
    MessageSquare,
    Eye,
    Calendar,
    User,
    Film,
    Star,
    ChevronDown,
    ChevronUp,
    Edit3,
    X,
    Plus,
    Trash2,
    BookOpen
} from 'lucide-react';

const THEATER_MAX_WIDTH = '98vw';

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

export default function Show({ project, suggestedVideos, comments, isOwner, hasLiked: initialHasLiked }) {
    const { auth } = usePage().props;
    const isAuthenticated = !!auth?.user;

    // Video player state
    const [isPaused, setIsPaused] = useState(true);
    const [isEnded, setIsEnded] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [watchingCount, setWatchingCount] = useState(1);
    const [resumePrompt, setResumePrompt] = useState(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [showChapters, setShowChapters] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null);
    const [showDetailsExpanded, setShowDetailsExpanded] = useState(false);

    // Director's note editing
    const [editingNote, setEditingNote] = useState(false);
    const [directorsNote, setDirectorsNote] = useState(project.directors_note || '');
    const [savingNote, setSavingNote] = useState(false);

    // Chapters editing
    const [editingChapters, setEditingChapters] = useState(false);
    const [chapters, setChapters] = useState(project.chapters || []);

    // Like state
    const [hasLiked, setHasLiked] = useState(initialHasLiked);
    const [likesCount, setLikesCount] = useState(project.likes_count || 0);

    const videoRef = useRef(null);
    const playerContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const glowMedia = sanitizeMediaUrl(project?.thumbnail_url || project?.video_url || null);

    // Keyboard shortcuts
    useEffect(() => {
        function onKey(e) {
            const active = document.activeElement;
            const typingTags = ['INPUT', 'TEXTAREA'];
            if (active && (typingTags.includes(active.tagName) || active.isContentEditable)) return;
            if (!videoRef.current) return;

            switch (e.code) {
                case 'Space':
                case 'KeyK':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    adjustVolume(-0.1);
                    break;
            }
        }

        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Persist currentTime every 5 seconds
    useEffect(() => {
        if (!project?.id) return;
        let interval = null;

        const startInterval = () => {
            if (interval) return;
            interval = setInterval(() => {
                if (videoRef.current && !isEnded) {
                    localStorage.setItem(`resume_project_${project.id}`, String(videoRef.current.currentTime));
                }
            }, 5000);
        };

        const stopInterval = () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };

        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.addEventListener('play', startInterval);
            videoEl.addEventListener('pause', stopInterval);
            videoEl.addEventListener('ended', stopInterval);
        }

        return () => {
            stopInterval();
            if (videoEl) {
                videoEl.removeEventListener('play', startInterval);
                videoEl.removeEventListener('pause', stopInterval);
                videoEl.removeEventListener('ended', stopInterval);
            }
        };
    }, [project?.id, isEnded]);

    // Supabase presence for live viewer count
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

        return () => channel.unsubscribe();
    }, [project?.id]);

    // Resume playback check
    useEffect(() => {
        if (!project?.id || typeof window === 'undefined') return;
        const stored = localStorage.getItem(`resume_project_${project.id}`);
        if (stored) {
            const time = parseFloat(stored);
            if (!Number.isNaN(time) && time > 30) {
                setResumePrompt(time);
            }
        }
    }, [project?.id]);

    // Update active chapter
    useEffect(() => {
        if (!chapters || chapters.length === 0) return;

        const sorted = [...chapters].sort((a, b) => a.time - b.time);
        let current = null;
        for (const ch of sorted) {
            if (currentTime >= ch.time) current = ch;
            else break;
        }
        setActiveChapter(current);
    }, [currentTime, chapters]);

    // Video event handlers
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);

        if (videoRef.current.buffered.length > 0) {
            setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
        }
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    // Controls
    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    const toggleFullscreen = useCallback(() => {
        if (!playerContainerRef.current) return;

        if (!document.fullscreenElement) {
            playerContainerRef.current.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    }, []);

    const skip = useCallback((seconds) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }, [duration]);

    const adjustVolume = useCallback((delta) => {
        if (!videoRef.current) return;
        const newVol = Math.max(0, Math.min(1, volume + delta));
        videoRef.current.volume = newVol;
        setVolume(newVol);
        setIsMuted(newVol === 0);
    }, [volume]);

    const seekTo = useCallback((time) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = time;
    }, []);

    const handleProgressClick = (e) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = percent * duration;
    };

    // Format time
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Mouse movement for controls visibility
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (!isPaused) setShowControls(false);
        }, 3000);
    };

    // Resume
    const handleResume = () => {
        if (!videoRef.current || resumePrompt == null) return;
        videoRef.current.currentTime = resumePrompt;
        videoRef.current.play();
        setResumePrompt(null);
    };

    // Replay
    const handleReplay = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsEnded(false);
    };

    // Like toggle
    const handleLike = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Please log in to like videos.',
                background: '#1e293b',
                color: '#fef3c7',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        try {
            const response = await fetch(route('premiere.toggleLike', project.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });
            const data = await response.json();
            setHasLiked(data.hasLiked);
            setLikesCount(data.likesCount);
        } catch (e) {
            console.error('Failed to toggle like', e);
        }
    };

    // Share
    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: project.title, url });
        } else {
            navigator.clipboard.writeText(url);
            Swal.fire({
                icon: 'success',
                title: 'Link Copied!',
                text: 'Video URL copied to clipboard.',
                background: '#1e293b',
                color: '#fef3c7',
                confirmButtonColor: '#f59e0b',
                timer: 2000,
                timerProgressBar: true,
            });
        }
    };

    // Director's Note Save
    const saveDirectorsNote = async () => {
        setSavingNote(true);
        router.patch(route('premiere.update', project.id), {
            directors_note: directorsNote,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingNote(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: "Director's note has been updated.",
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                    timer: 2000,
                });
            },
            onFinish: () => setSavingNote(false),
        });
    };

    // Chapters Save
    const saveChapters = async () => {
        router.patch(route('premiere.update', project.id), {
            chapters: chapters,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingChapters(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Chapters have been updated.',
                    background: '#1e293b',
                    color: '#fef3c7',
                    confirmButtonColor: '#f59e0b',
                    timer: 2000,
                });
            },
        });
    };

    const addChapter = () => {
        setChapters([...chapters, { time: Math.floor(currentTime), title: '' }]);
    };

    const removeChapter = (index) => {
        setChapters(chapters.filter((_, i) => i !== index));
    };

    const updateChapter = (index, field, value) => {
        const updated = [...chapters];
        updated[index] = { ...updated[index], [field]: field === 'time' ? parseInt(value) || 0 : value };
        setChapters(updated);
    };

    // Playlist Modal
    const openPlaylistModal = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'info',
                title: 'Login Required',
                text: 'Please log in to add videos to playlists.',
                background: '#1e293b',
                color: '#fef3c7',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        setShowPlaylistModal(true);
        setLoadingPlaylists(true);
        try {
            const res = await fetch(route('playlists.index'), { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            setUserPlaylists(data.data || []);
        } catch (e) {
            console.error('Failed to load playlists', e);
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const addToPlaylist = (playlistId) => {
        router.post(route('playlists.addProject', playlistId), { project_id: project.id }, {
            onSuccess: () => {
                setShowPlaylistModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Added to Playlist',
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonColor: '#f59e0b',
                    timer: 2000,
                });
            },
            preserveScroll: true,
        });
    };

    // Report
    const submitReport = (e) => {
        e.preventDefault();
        if (!reportReason.trim()) return;

        setSubmittingReport(true);
        router.post(route('flags.store'), {
            project_id: project.id,
            reason: reportReason,
            details: reportDetails
        }, {
            onSuccess: () => {
                setShowReportModal(false);
                setReportReason('');
                setReportDetails('');
                Swal.fire({
                    icon: 'success',
                    title: 'Report Submitted',
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonColor: '#f59e0b',
                    timer: 3000,
                });
            },
            onFinish: () => setSubmittingReport(false),
            preserveScroll: true,
        });
    };

    const upNextItems = suggestedVideos?.slice?.(0, 3) || [];
    const castCrew = project.cast_crew || [];
    const tags = project.tags || [];

    return (
        <CinemaLayout>
            <Head title={project.title} />

            <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white min-h-screen">
                <div className="mx-auto" style={{ maxWidth: THEATER_MAX_WIDTH }}>
                    <div className="px-4 sm:px-6 lg:px-10 py-6 flex flex-col lg:flex-row gap-6">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                            {/* Live Viewers Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-red-500/25">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        {watchingCount} Watching
                                    </span>
                                    {activeChapter && (
                                        <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/30">
                                            📍 {activeChapter.title}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSidebarOpen((v) => !v)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Show'} Chat</span>
                                </button>
                            </div>

                            {/* Video Player Container */}
                            <div
                                ref={playerContainerRef}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => !isPaused && setShowControls(false)}
                                className={`relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 bg-black transition-all duration-500 ${isEnded ? 'scale-95 opacity-60' : ''}`}
                            >
                                {/* Cinematic Glow Background */}
                                {glowMedia && (
                                    <div
                                        className="absolute -inset-10 -z-10 blur-3xl opacity-40 saturate-150"
                                        style={{
                                            backgroundImage: `url(${glowMedia})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                )}

                                {/* Video Element */}
                                <video
                                    ref={videoRef}
                                    src={project.video_url}
                                    autoPlay
                                    onClick={togglePlay}
                                    onPlay={() => setIsPaused(false)}
                                    onPause={() => {
                                        setIsPaused(true);
                                        if (videoRef.current && project?.id) {
                                            localStorage.setItem(`resume_project_${project.id}`, String(videoRef.current.currentTime));
                                        }
                                    }}
                                    onEnded={() => setIsEnded(true)}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    className="w-full aspect-video bg-black cursor-pointer"
                                />

                                {/* Netflix-Style Pause Overlay */}
                                <div
                                    className={`absolute inset-0 transition-all duration-500 pointer-events-none ${isPaused && !isEnded ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

                                    {/* Title & Info */}
                                    <div className="absolute bottom-24 left-8 right-8 max-w-2xl">
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-2xl">
                                            {project.title}
                                        </h1>

                                        {/* Metadata Row */}
                                        <div className="flex items-center gap-3 mb-4 text-sm text-white/80">
                                            {project.release_year && (
                                                <span className="px-2 py-1 bg-white/10 rounded">{project.release_year}</span>
                                            )}
                                            {project.content_rating && (
                                                <span className="px-2 py-1 bg-white/10 rounded border border-white/30">{project.content_rating}</span>
                                            )}
                                            {project.duration && (
                                                <span>{formatTime(project.duration)}</span>
                                            )}
                                            {project.category && (
                                                <span className="text-amber-400">{project.category}</span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-lg text-white/90 line-clamp-3 drop-shadow-lg">
                                            {project.description}
                                        </p>

                                        {/* Director */}
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                                {project.user?.avatar_url ? (
                                                    <img src={project.user.avatar_url} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-slate-900 font-bold">{project.user?.name?.[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{project.user?.name}</div>
                                                <div className="text-white/60 text-sm">Director</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Controls */}
                                <div
                                    className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls || isPaused ? 'opacity-100' : 'opacity-0'}`}
                                >
                                    <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-4 px-4">
                                        {/* Progress Bar */}
                                        <div
                                            onClick={handleProgressClick}
                                            className="relative h-1 bg-white/20 rounded-full cursor-pointer group mb-4 hover:h-2 transition-all"
                                        >
                                            {/* Buffered */}
                                            <div
                                                className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                                                style={{ width: `${(buffered / duration) * 100}%` }}
                                            />
                                            {/* Progress */}
                                            <div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                                style={{ width: `${(currentTime / duration) * 100}%` }}
                                            />
                                            {/* Chapter Markers */}
                                            {chapters.map((ch, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-amber-300 rounded-full cursor-pointer hover:scale-150 transition"
                                                    style={{ left: `${(ch.time / duration) * 100}%` }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        seekTo(ch.time);
                                                    }}
                                                    title={ch.title}
                                                />
                                            ))}
                                            {/* Scrubber */}
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                                                style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                                            />
                                        </div>

                                        {/* Controls Row */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {/* Play/Pause */}
                                                <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg transition">
                                                    {isPaused ? <Play className="w-6 h-6" fill="white" /> : <Pause className="w-6 h-6" fill="white" />}
                                                </button>

                                                {/* Skip */}
                                                <button onClick={() => skip(-10)} className="p-2 hover:bg-white/10 rounded-lg transition">
                                                    <SkipBack className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => skip(10)} className="p-2 hover:bg-white/10 rounded-lg transition">
                                                    <SkipForward className="w-5 h-5" />
                                                </button>

                                                {/* Volume */}
                                                <div className="flex items-center gap-2 group">
                                                    <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition">
                                                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                                    </button>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="1"
                                                        step="0.05"
                                                        value={isMuted ? 0 : volume}
                                                        onChange={(e) => {
                                                            const v = parseFloat(e.target.value);
                                                            videoRef.current.volume = v;
                                                            setVolume(v);
                                                            setIsMuted(v === 0);
                                                        }}
                                                        className="w-0 group-hover:w-20 transition-all duration-300 accent-amber-400"
                                                    />
                                                </div>

                                                {/* Time */}
                                                <span className="text-sm text-white/80 tabular-nums">
                                                    {formatTime(currentTime)} / {formatTime(duration)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Chapters */}
                                                {chapters.length > 0 && (
                                                    <button
                                                        onClick={() => setShowChapters(!showChapters)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition"
                                                        title="Chapters"
                                                    >
                                                        <ListVideo className="w-5 h-5" />
                                                    </button>
                                                )}

                                                {/* Fullscreen */}
                                                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-lg transition">
                                                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chapters Panel */}
                                {showChapters && chapters.length > 0 && (
                                    <div className="absolute bottom-24 right-4 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                                        <div className="p-3 border-b border-white/10 flex items-center justify-between">
                                            <span className="font-semibold text-amber-300">Chapters</span>
                                            <button onClick={() => setShowChapters(false)} className="p-1 hover:bg-white/10 rounded">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {[...chapters].sort((a, b) => a.time - b.time).map((ch, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        seekTo(ch.time);
                                                        setShowChapters(false);
                                                    }}
                                                    className={`w-full p-3 text-left hover:bg-white/5 transition flex items-center gap-3 ${activeChapter?.time === ch.time ? 'bg-amber-500/10' : ''}`}
                                                >
                                                    <span className="text-amber-400 text-sm font-mono w-12">{formatTime(ch.time)}</span>
                                                    <span className="text-white/90 text-sm flex-1 line-clamp-1">{ch.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resume Prompt */}
                                {resumePrompt != null && !isEnded && (
                                    <div className="absolute top-4 left-4 z-20">
                                        <button
                                            onClick={handleResume}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold shadow-lg hover:from-amber-400 hover:to-amber-500 transition flex items-center gap-2"
                                        >
                                            <Play className="w-4 h-4" />
                                            Resume from {formatTime(resumePrompt)}
                                        </button>
                                    </div>
                                )}

                                {/* End Screen - Up Next */}
                                {isEnded && upNextItems.length > 0 && (
                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md">
                                        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 max-w-3xl w-full shadow-2xl mx-4">
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="text-xl font-bold text-white">Up Next</h3>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={handleReplay}
                                                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500 transition"
                                                    >
                                                        Replay
                                                    </button>
                                                    <button
                                                        onClick={() => setIsEnded(false)}
                                                        className="text-amber-300 hover:text-amber-200"
                                                    >
                                                        <X className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {upNextItems.map((item) => (
                                                    <a
                                                        key={item.id}
                                                        href={route('premiere.show', item.id)}
                                                        className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-amber-400/50 transition shadow"
                                                    >
                                                        <div className="aspect-video overflow-hidden relative">
                                                            <img src={item.thumbnail_url || item.video_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                                                                <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition" fill="white" />
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="text-white font-semibold line-clamp-2">{item.title}</div>
                                                            <div className="text-xs text-amber-300 mt-1">{item.user?.name}</div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className={`${sidebarOpen ? 'w-full lg:w-80 xl:w-96' : 'hidden'} transition-all`}>
                            {sidebarOpen && <PremiereSidebar comments={comments} projectId={project.id} />}
                        </div>
                    </div>

                    {/* Below Player Info */}
                    <div className="px-4 sm:px-6 lg:px-10 pb-12">
                        {/* Title & Actions Bar */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                {/* Left: Creator Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 overflow-hidden flex items-center justify-center">
                                        {project.user?.avatar_url ? (
                                            <img src={project.user.avatar_url} alt={project.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-900 font-bold text-xl">{project.user?.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{project.title}</h2>
                                        <div className="flex items-center gap-4 text-sm text-amber-300/80">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {project.user?.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                {(project.views_count || 0).toLocaleString()} views
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Action Buttons */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition ${hasLiked
                                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                                        {likesCount.toLocaleString()}
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        Share
                                    </button>

                                    <button
                                        onClick={openPlaylistModal}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500 transition"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Save
                                    </button>

                                    <button
                                        onClick={() => setShowReportModal(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 rounded-xl border border-white/10 transition"
                                    >
                                        <Flag className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Expandable Details */}
                            <div className="mt-6">
                                <div className={`text-amber-100/80 ${showDetailsExpanded ? '' : 'line-clamp-2'}`}>
                                    {project.description}
                                </div>
                                {project.description?.length > 200 && (
                                    <button
                                        onClick={() => setShowDetailsExpanded(!showDetailsExpanded)}
                                        className="mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1"
                                    >
                                        {showDetailsExpanded ? (
                                            <>Show less <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Show more <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}

                                {/* Tags */}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {tags.map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-amber-300/80">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Director's Note Section */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Director's Note
                                </h3>
                                {isOwner && (
                                    editingNote ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingNote(false)}
                                                className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveDirectorsNote}
                                                disabled={savingNote}
                                                className="px-3 py-1.5 text-sm bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition disabled:opacity-50"
                                            >
                                                {savingNote ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingNote(true)}
                                            className="px-3 py-1.5 text-sm bg-white/10 text-amber-300 rounded-lg hover:bg-white/20 transition flex items-center gap-1"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )
                                )}
                            </div>

                            {editingNote ? (
                                <textarea
                                    value={directorsNote}
                                    onChange={(e) => setDirectorsNote(e.target.value)}
                                    placeholder="Share your thoughts about this project, the creative process, challenges you faced, or anything you want viewers to know..."
                                    rows={6}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-4 text-amber-100 placeholder-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                                />
                            ) : directorsNote ? (
                                <p className="text-amber-100/80 whitespace-pre-wrap">{directorsNote}</p>
                            ) : (
                                <p className="text-amber-300/40 italic">
                                    {isOwner ? 'Add a director\'s note to share your vision...' : 'No director\'s note available.'}
                                </p>
                            )}
                        </div>

                        {/* Chapters Section (Owner Editable) */}
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-amber-300 flex items-center gap-2">
                                    <ListVideo className="w-5 h-5" />
                                    Chapters
                                </h3>
                                {isOwner && (
                                    editingChapters ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setChapters(project.chapters || []);
                                                    setEditingChapters(false);
                                                }}
                                                className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={saveChapters}
                                                className="px-3 py-1.5 text-sm bg-amber-500 text-slate-900 rounded-lg font-medium hover:bg-amber-400 transition"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingChapters(true)}
                                            className="px-3 py-1.5 text-sm bg-white/10 text-amber-300 rounded-lg hover:bg-white/20 transition flex items-center gap-1"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                    )
                                )}
                            </div>

                            {editingChapters ? (
                                <div className="space-y-3">
                                    {chapters.map((ch, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={ch.time}
                                                onChange={(e) => updateChapter(i, 'time', e.target.value)}
                                                placeholder="Seconds"
                                                className="w-24 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                            <input
                                                type="text"
                                                value={ch.title}
                                                onChange={(e) => updateChapter(i, 'title', e.target.value)}
                                                placeholder="Chapter title..."
                                                className="flex-1 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                            <button
                                                onClick={() => removeChapter(i)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addChapter}
                                        className="w-full py-2 border border-dashed border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/10 transition flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Chapter at Current Time ({formatTime(currentTime)})
                                    </button>
                                </div>
                            ) : chapters.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[...chapters].sort((a, b) => a.time - b.time).map((ch, i) => (
                                        <button
                                            key={i}
                                            onClick={() => seekTo(ch.time)}
                                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-xl transition text-left group"
                                        >
                                            <span className="text-amber-400 font-mono text-sm">{formatTime(ch.time)}</span>
                                            <span className="text-white/90 group-hover:text-amber-300 transition">{ch.title}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-amber-300/40 italic">
                                    {isOwner ? 'Add chapters to help viewers navigate your video.' : 'No chapters available.'}
                                </p>
                            )}
                        </div>

                        {/* Cast & Crew */}
                        {castCrew.length > 0 && (
                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
                                    <Star className="w-5 h-5" />
                                    Cast & Crew
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {castCrew.map((person, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-medium">
                                                {person.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium text-sm">{person.name}</div>
                                                <div className="text-amber-300/60 text-xs">{person.role}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* More Like This */}
                        <div className="pt-4">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Film className="w-5 h-5 text-amber-400" />
                                More Like This
                            </h2>
                            <SuggestedVideos videos={suggestedVideos} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Playlist Modal */}
            {showPlaylistModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPlaylistModal(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">Save to Playlist</h3>
                            <button onClick={() => setShowPlaylistModal(false)} className="p-1 text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {loadingPlaylists ? (
                            <div className="py-8 text-center text-amber-200">Loading playlists...</div>
                        ) : userPlaylists.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-slate-400 mb-4">You don't have any playlists yet.</p>
                                    <a href={route('playlists.index')} className="inline-block px-4 py-2 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-400">
                                        Create Playlist
                                    </a>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {userPlaylists.map((pl) => (
                                        <button
                                            key={pl.id}
                                            onClick={() => addToPlaylist(pl.id)}
                                        className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition"
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
                            <button onClick={() => setShowReportModal(false)} className="p-1 text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={submitReport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-amber-100 mb-2">Reason</label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full rounded-xl bg-slate-800/50 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400 p-3"
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
                                <label className="block text-sm font-medium text-amber-100 mb-2">Additional Details</label>
                                <textarea
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-xl bg-slate-800/50 border border-white/10 text-white focus:border-amber-400 focus:ring-amber-400 p-3"
                                    placeholder="Provide more details..."
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReport || !reportReason}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition disabled:opacity-50"
                                >
                                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CinemaLayout>
    );
}
