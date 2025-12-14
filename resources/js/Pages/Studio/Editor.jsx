import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Utility to generate unique IDs
let clipIdCounter = Date.now();
const generateClipId = () => `clip-${++clipIdCounter}`;

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
            if (timeDiff > 0.5) {
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
        const newTime = clickX / 20; // Scale: 20px per second
        
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
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Video Editor</h2>}
        >
            <Head title="Video Editor" />
            
            <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-zinc-900">
                
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
                            width: clips.length > 0 ? `${Math.max(totalDuration * 20 + 40, 100)}px` : '100%'
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
                                        // Width = clip.duration * 20px (arbitrary scale)
                                        width: `${clip.duration * 20}px`,
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
                                    // Position: left = globalTime * 20px
                                    left: `${globalTime * 20 + 8}px`,
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
                                    marginLeft: i === 0 ? '8px' : `${5 * 20 - 24}px`,
                                    minWidth: '24px'
                                }}
                            >
                                {formatTime(i * 5)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
