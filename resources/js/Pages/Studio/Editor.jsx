import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';

// Utility to generate unique IDs
let clipIdCounter = Date.now();
const generateClipId = () => `clip-${++clipIdCounter}`;

// Constants
const PIXELS_PER_SECOND = 20; // Scale: 20px per second of video
const SEEK_THRESHOLD = 0.5; // Threshold in seconds to avoid constant seeking

// Export status messages for the "technical" animation
const EXPORT_MESSAGES = [
    'Analyzing timeline...',
    'Encoding Audio...',
    'Stitching Tracks...',
    'Rendering Frames...',
    'Applying Effects...',
    'Finalizing Container...',
    'Uploading to Cloud...',
    'Upload Complete'
];

export default function Editor({ auth }) {
    // =====================
    // TASK 1: State Structure
    // =====================
    
    // clips: Array of { id, url, duration, startTime }
    const [clips, setClips] = useState([]);
    
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [globalTime, setGlobalTime] = useState(0);
    
    // Track the currently active clip
    const [activeClipId, setActiveClipId] = useState(null);
    
    // Video player ref
    const videoRef = useRef(null);
    
    // Animation frame ref for playback loop
    const playbackIntervalRef = useRef(null);
    
    // =====================
    // Export Modal State
    // =====================
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportResolution, setExportResolution] = useState('1080p');
    const [exportFormat, setExportFormat] = useState('MP4');
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportMessage, setExportMessage] = useState('');
    const [exportComplete, setExportComplete] = useState(false);
    
    // Calculate total timeline duration
    const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
    
    /**
     * addClip: Appends a video to the end of the timeline
     * Calculates startTime based on the previous clip's end
     */
    const addClip = useCallback((asset) => {
        setClips((prevClips) => {
            // Calculate startTime: sum of all previous clip durations
            const startTime = prevClips.reduce((sum, clip) => sum + clip.duration, 0);
            
            const newClip = {
                id: generateClipId(),
                url: asset.url,
                duration: asset.duration,
                startTime: startTime,
            };
            
            return [...prevClips, newClip];
        });
    }, []);
    
    // =====================
    // TASK 2: The "Smart Player"
    // =====================
    
    /**
     * Find the active clip for the current globalTime
     */
    const findActiveClip = useCallback((time) => {
        for (const clip of clips) {
            const clipEnd = clip.startTime + clip.duration;
            if (time >= clip.startTime && time < clipEnd) {
                return clip;
            }
        }
        // If we're past all clips, return null (playback should stop)
        return null;
    }, [clips]);
    
    /**
     * useEffect: Listen to isPlaying and globalTime
     * - Find the active clip for the current globalTime
     * - If the active clip changes (we crossed a cut point), update <video src> and play()
     * - Seek video to (globalTime - clip.startTime)
     */
    useEffect(() => {
        if (!videoRef.current || clips.length === 0) return;
        
        const activeClip = findActiveClip(globalTime);
        
        if (!activeClip) {
            // Playback reached the end
            if (isPlaying) {
                setIsPlaying(false);
                setGlobalTime(0);
            }
            return;
        }
        
        // Check if we need to switch clips (crossed a cut point)
        if (activeClip.id !== activeClipId) {
            // Update active clip
            setActiveClipId(activeClip.id);
            
            // Update video source
            videoRef.current.src = activeClip.url;
            
            // Calculate local time within this clip
            const localTime = globalTime - activeClip.startTime;
            
            // Seek to the correct position
            videoRef.current.currentTime = localTime;
            
            // If playing, start playback
            if (isPlaying) {
                videoRef.current.play().catch(console.error);
            }
        } else {
            // Same clip, just ensure correct position if needed
            const localTime = globalTime - activeClip.startTime;
            const timeDiff = Math.abs(videoRef.current.currentTime - localTime);
            
            // Only seek if there's a significant difference (avoid constant seeking)
            if (timeDiff > SEEK_THRESHOLD) {
                videoRef.current.currentTime = localTime;
            }
        }
    }, [isPlaying, globalTime, clips, activeClipId, findActiveClip]);
    
    /**
     * Playback loop: Update globalTime while playing
     */
    useEffect(() => {
        if (isPlaying && clips.length > 0) {
            const activeClip = findActiveClip(globalTime);
            
            if (activeClip && videoRef.current) {
                // Start the video
                videoRef.current.play().catch(console.error);
                
                // Use video timeupdate to drive globalTime
                const handleTimeUpdate = () => {
                    if (videoRef.current && activeClipId) {
                        const currentClip = clips.find(c => c.id === activeClipId);
                        if (currentClip) {
                            const newGlobalTime = currentClip.startTime + videoRef.current.currentTime;
                            setGlobalTime(newGlobalTime);
                        }
                    }
                };
                
                videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
                
                return () => {
                    if (videoRef.current) {
                        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                    }
                };
            }
        } else if (!isPlaying && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isPlaying, clips, activeClipId, findActiveClip]);
    
    /**
     * Handle video ended event
     */
    useEffect(() => {
        if (!videoRef.current) return;
        
        const handleEnded = () => {
            // Move to next clip
            const activeClip = findActiveClip(globalTime);
            if (activeClip) {
                const nextTime = activeClip.startTime + activeClip.duration;
                const nextClip = findActiveClip(nextTime);
                
                if (nextClip) {
                    setGlobalTime(nextTime);
                } else {
                    // No more clips, stop playback
                    setIsPlaying(false);
                    setGlobalTime(0);
                }
            }
        };
        
        videoRef.current.addEventListener('ended', handleEnded);
        
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('ended', handleEnded);
            }
        };
    }, [globalTime, findActiveClip]);
    
    /**
     * Play/Pause toggle
     */
    const togglePlayPause = () => {
        if (clips.length === 0) return;
        setIsPlaying(!isPlaying);
    };
    
    /**
     * Handle timeline click to seek
     */
    const handleTimelineClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = clickX / PIXELS_PER_SECOND;
        
        if (newTime >= 0 && newTime <= totalDuration) {
            setGlobalTime(newTime);
        }
    };
    
    /**
     * Format time as MM:SS
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // =====================
    // Demo: Add sample clips
    // =====================
    const addSampleClip = () => {
        // For demo purposes - in production, this would come from an asset picker
        const sampleAssets = [
            { url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 10 },
            { url: 'https://www.w3schools.com/html/movie.mp4', duration: 12 },
            { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', duration: 6 },
        ];
        
        const randomAsset = sampleAssets[Math.floor(Math.random() * sampleAssets.length)];
        addClip(randomAsset);
    };
    
    // =====================
    // Export Workflow
    // =====================
    const openExportModal = () => {
        setShowExportModal(true);
        setExportProgress(0);
        setExportMessage('');
        setExportComplete(false);
        setIsExporting(false);
    };
    
    const closeExportModal = () => {
        if (!isExporting) {
            setShowExportModal(false);
            // Reset export state when closing
            setExportProgress(0);
            setExportMessage('');
            setExportComplete(false);
        }
    };
    
    const startExport = () => {
        setIsExporting(true);
        setExportProgress(0);
        setExportComplete(false);
        
        // Simulate export with progress bar and messages
        const totalDuration = 4000; // 4 seconds
        const messageInterval = totalDuration / EXPORT_MESSAGES.length;
        let messageIndex = 0;
        
        // Update messages rapidly
        const messageTimer = setInterval(() => {
            if (messageIndex < EXPORT_MESSAGES.length) {
                setExportMessage(EXPORT_MESSAGES[messageIndex]);
                messageIndex++;
            } else {
                clearInterval(messageTimer);
            }
        }, messageInterval);
        
        // Update progress bar smoothly
        const startTime = Date.now();
        const progressTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / totalDuration) * 100, 100);
            setExportProgress(progress);
            
            if (progress >= 100) {
                clearInterval(progressTimer);
                clearInterval(messageTimer);
                setExportComplete(true);
                setIsExporting(false);
            }
        }, 50);
    };
    
    // Get the first clip URL for the download button (facade)
    const getDownloadUrl = () => {
        return clips.length > 0 ? clips[0].url : '#';
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Video Editor</h2>}
        >
            <Head title="Video Editor" />
            
            <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-zinc-900 relative">
                
                {/* Top Bar - Controls */}
                <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={addSampleClip}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md"
                        >
                            + Add Clip
                        </button>
                        <span className="text-zinc-400 text-sm">
                            {clips.length} clip{clips.length !== 1 ? 's' : ''} • {formatTime(totalDuration)} total
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-amber-300 font-mono text-lg">
                            {formatTime(globalTime)} / {formatTime(totalDuration)}
                        </span>
                        <button
                            onClick={openExportModal}
                            disabled={clips.length === 0}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🎬 Export Video
                        </button>
                    </div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 flex">
                    
                    {/* Left Panel - Asset Library (placeholder) */}
                    <div className="w-64 bg-zinc-800 border-r border-zinc-700 p-4">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            Assets
                        </h3>
                        <p className="text-zinc-500 text-xs">
                            Click "Add Clip" to add sample videos to the timeline.
                        </p>
                    </div>
                    
                    {/* Center - Video Preview */}
                    <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-8">
                        <div className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-contain"
                                playsInline
                            />
                            
                            {clips.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🎬</div>
                                        <p>Add clips to start editing</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Playback Controls */}
                        <div className="mt-6 flex items-center gap-4">
                            <button
                                onClick={() => setGlobalTime(0)}
                                className="px-3 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                                disabled={clips.length === 0}
                            >
                                ⏮️
                            </button>
                            <button
                                onClick={togglePlayPause}
                                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md disabled:opacity-50"
                                disabled={clips.length === 0}
                            >
                                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                            </button>
                            <button
                                onClick={() => setGlobalTime(totalDuration)}
                                className="px-3 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                                disabled={clips.length === 0}
                            >
                                ⏭️
                            </button>
                        </div>
                    </div>
                    
                    {/* Right Panel - Properties (placeholder) */}
                    <div className="w-64 bg-zinc-800 border-l border-zinc-700 p-4">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                            Properties
                        </h3>
                        {activeClipId ? (
                            <div className="text-zinc-300 text-sm space-y-2">
                                <p><span className="text-zinc-500">Active Clip:</span> {activeClipId}</p>
                                <p><span className="text-zinc-500">Global Time:</span> {globalTime.toFixed(2)}s</p>
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-xs">Select a clip to see properties.</p>
                        )}
                    </div>
                </div>
                
                {/* ===================== */}
                {/* TASK 3: Visual Feedback - Timeline */}
                {/* ===================== */}
                <div className="bg-zinc-800 border-t border-zinc-700 p-4">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        Timeline
                    </h3>
                    
                    {/* Timeline Container */}
                    <div 
                        className="relative bg-zinc-900 rounded-lg min-h-[80px] overflow-x-auto cursor-pointer"
                        onClick={handleTimelineClick}
                        style={{ 
                            width: clips.length > 0 ? `${Math.max(totalDuration * PIXELS_PER_SECOND + 40, 100)}px` : '100%'
                        }}
                    >
                        {/* Clips Track */}
                        <div className="relative h-16 flex items-center px-2">
                            {clips.map((clip, index) => (
                                <div
                                    key={clip.id}
                                    className={`
                                        h-12 rounded-md flex items-center justify-center text-xs font-medium
                                        transition-all cursor-pointer
                                        ${clip.id === activeClipId 
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white ring-2 ring-amber-400' 
                                            : 'bg-gradient-to-r from-zinc-600 to-zinc-700 text-zinc-300 hover:from-zinc-500 hover:to-zinc-600'
                                        }
                                    `}
                                    style={{
                                        // Width = clip.duration * PIXELS_PER_SECOND
                                        width: `${clip.duration * PIXELS_PER_SECOND}px`,
                                        marginLeft: index === 0 ? '0' : '2px',
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGlobalTime(clip.startTime);
                                    }}
                                >
                                    <span className="truncate px-2">
                                        Clip {index + 1} ({formatTime(clip.duration)})
                                    </span>
                                </div>
                            ))}
                            
                            {clips.length === 0 && (
                                <div className="flex items-center justify-center w-full h-full text-zinc-500 text-sm">
                                    Add clips to build your timeline
                                </div>
                            )}
                        </div>
                        
                        {/* Red Playhead Line */}
                        {clips.length > 0 && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
                                style={{
                                    // Position: left = globalTime * PIXELS_PER_SECOND
                                    left: `${globalTime * PIXELS_PER_SECOND + 8}px`,
                                    transition: isPlaying ? 'none' : 'left 0.1s ease-out',
                                }}
                            >
                                {/* Playhead Handle */}
                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
                            </div>
                        )}
                    </div>
                    
                    {/* Time Ruler */}
                    <div className="mt-2 flex items-center text-xs text-zinc-500 font-mono">
                        {clips.length > 0 && Array.from({ length: Math.ceil(totalDuration / 5) + 1 }, (_, i) => (
                            <span
                                key={i}
                                className="inline-block"
                                style={{ 
                                    marginLeft: i === 0 ? '8px' : `${5 * PIXELS_PER_SECOND - 24}px`,
                                    minWidth: '24px'
                                }}
                            >
                                {formatTime(i * 5)}
                            </span>
                        ))}
                    </div>
                </div>
                
                {/* Glass Overlay - Blocks timeline interaction during export */}
                {isExporting && (
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-amber-300 text-lg font-semibold">Exporting...</p>
                            <p className="text-zinc-400 text-sm mt-1">{exportMessage}</p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* ===================== */}
            {/* Export Modal */}
            {/* ===================== */}
            <Modal show={showExportModal} onClose={closeExportModal} maxWidth="md">
                <div className="bg-zinc-900 p-6">
                    {!exportComplete ? (
                        <>
                            <h2 className="text-xl font-bold text-amber-100 mb-4">
                                🎬 Render Settings
                            </h2>
                            
                            {!isExporting ? (
                                <>
                                    {/* Resolution Option */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                                            Resolution
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setExportResolution('1080p')}
                                                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                                                    exportResolution === '1080p'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                <div className="font-semibold">1080p</div>
                                                <div className="text-xs opacity-70">Full HD</div>
                                            </button>
                                            <button
                                                onClick={() => setExportResolution('4k')}
                                                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                                                    exportResolution === '4k'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                <div className="font-semibold">4K</div>
                                                <div className="text-xs opacity-70">Ultra HD</div>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Format Option */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                                            Format
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setExportFormat('MP4')}
                                                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                                                    exportFormat === 'MP4'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                <div className="font-semibold">MP4</div>
                                                <div className="text-xs opacity-70">H.264 Codec</div>
                                            </button>
                                            <button
                                                onClick={() => setExportFormat('MOV')}
                                                className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                                                    exportFormat === 'MOV'
                                                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                <div className="font-semibold">MOV</div>
                                                <div className="text-xs opacity-70">ProRes Codec</div>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Summary */}
                                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
                                        <div className="text-sm text-zinc-400">Export Summary</div>
                                        <div className="mt-2 text-amber-100">
                                            <span className="font-semibold">{clips.length}</span> clip{clips.length !== 1 ? 's' : ''} • 
                                            <span className="font-semibold ml-1">{formatTime(totalDuration)}</span> duration • 
                                            <span className="font-semibold ml-1">{exportResolution}</span> • 
                                            <span className="font-semibold ml-1">{exportFormat}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={closeExportModal}
                                            className="flex-1 px-4 py-3 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={startExport}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-md"
                                        >
                                            🚀 Start Render
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* Exporting State - Progress Bar */
                                <div className="py-8">
                                    <div className="mb-4">
                                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-100 ease-linear"
                                                style={{ width: `${exportProgress}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-between text-sm">
                                            <span className="text-zinc-400">{Math.round(exportProgress)}%</span>
                                            <span className="text-amber-300 font-mono">{exportMessage}</span>
                                        </div>
                                    </div>
                                    <p className="text-center text-zinc-500 text-sm">
                                        Please wait while we render your video...
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Export Complete State */
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h2 className="text-xl font-bold text-emerald-400 mb-2">
                                Export Complete!
                            </h2>
                            <p className="text-zinc-400 mb-6">
                                Your video has been rendered successfully.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <a
                                    href={getDownloadUrl()}
                                    download
                                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md text-center"
                                >
                                    ⬇️ Download Video
                                </a>
                                <Link
                                    href={route('dashboard')}
                                    className="w-full px-4 py-3 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors text-center"
                                >
                                    🏠 Return to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
