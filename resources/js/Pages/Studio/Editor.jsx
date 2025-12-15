import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import {
  Play, Pause, SkipBack, SkipForward, Save, Upload, Film,
  FolderOpen, Trash2, Plus, Settings, Download, ChevronLeft,
  Video, Image, Music, Clock, HardDrive, X, Check, Loader2
} from 'lucide-react';

// Utility to generate unique IDs
let clipIdCounter = Date.now();
const generateClipId = () => `clip-${++clipIdCounter}`;

// Constants
const PIXELS_PER_SECOND = 20;
const SEEK_THRESHOLD = 0.5;

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

export default function Editor({ auth, project, userVideos = [], quota }) {
  // Project state
  const [projectName, setProjectName] = useState(project?.name || 'Untitled Project');
  const [projectDesc, setProjectDesc] = useState(project?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // clips: Array of { id, assetId, url, duration, startTime, name, startOffset, endOffset }
  // startOffset: seconds from the beginning of the source asset to trim
  // endOffset: seconds from the end of the source asset to trim
  const [clips, setClips] = useState(() => {
    if (project?.timeline_data?.clips) {
      return project.timeline_data.clips.map(clip => ({
        ...clip,
        startOffset: clip.startOffset ?? 0,
        endOffset: clip.endOffset ?? 0,
      }));
    }
    return [];
  });

  // Assets from project
  const [assets, setAssets] = useState(project?.assets || []);
  
  // Audio tracks: Array of { id, url, duration, startTime, volume, name }
  // Separate from video clips for independent audio control
  const [audioTracks, setAudioTracks] = useState(() => {
    if (project?.timeline_data?.audioTracks) {
      return project.timeline_data.audioTracks;
    }
    return [];
  });
    
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
  const [globalTime, setGlobalTime] = useState(0);
    const [activeClipId, setActiveClipId] = useState(null);
    
  // UI state
  const [showAssetLibrary, setShowAssetLibrary] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Tool state for NLE operations
  const [activeTool, setActiveTool] = useState('select'); // 'select', 'blade', 'trim'

  // Export Modal State
    const [showExportModal, setShowExportModal] = useState(false);
  const [exportResolution, setExportResolution] = useState(project?.settings?.resolution || '1080p');
  const [exportFormat, setExportFormat] = useState(project?.settings?.format || 'mp4');
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportMessage, setExportMessage] = useState('');
    const [exportComplete, setExportComplete] = useState(false);
    
  // Refs
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

    const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  // Auto-save when clips change
  useEffect(() => {
    if (!project?.id || clips.length === 0) return;

    setHasUnsavedChanges(true);

    // Debounce auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveTimeline();
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [clips]);

  // Keyboard shortcuts for NLE tools
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'b':
          // Blade/Split tool
          setActiveTool('blade');
          e.preventDefault();
          break;
        case 'a':
          // Arrow/Selection tool
          setActiveTool('select');
          e.preventDefault();
          break;
        case 'v':
          // Alternative selection tool (common in NLE apps)
          setActiveTool('select');
          e.preventDefault();
          break;
        case ' ':
          // Spacebar: Play/Pause
          if (clips.length > 0) {
            togglePlayPause();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clips.length]); // Re-create handler when clips change

  // Save timeline to backend
  const saveTimeline = async () => {
    if (!project?.id) {
      // Create new project first
      Swal.fire({
        title: 'Save Project',
        html: `
                    <input id="swal-name" class="swal2-input" placeholder="Project name" value="${projectName}">
                    <textarea id="swal-desc" class="swal2-textarea" placeholder="Description (optional)">${projectDesc}</textarea>
                `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        background: '#1e293b',
        color: '#fef3c7',
        confirmButtonColor: '#10b981',
        preConfirm: () => {
          const name = document.getElementById('swal-name').value;
          if (!name) {
            Swal.showValidationMessage('Please enter a project name');
            return false;
          }
          return { name, description: document.getElementById('swal-desc').value };
        },
      }).then((result) => {
        if (result.isConfirmed) {
          router.post(route('studio.projects.store'), {
            name: result.value.name,
            description: result.value.description,
          });
        }
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(route('studio.editor.timeline', project.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({
          timeline_data: { clips, audioTracks, tracks: [] },
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to save timeline:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload asset
  const handleAssetUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !project?.id) return;

    // Check for incompatible video formats
    const incompatibleFormats = ['.mkv', '.avi', '.flv', '.wmv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (incompatibleFormats.includes(fileExtension)) {
      Swal.fire({
        icon: 'error',
        title: 'Incompatible Format',
        text: `${fileExtension} files are not supported in web browsers. Please use MP4, WebM, or MOV formats.`,
        background: '#1e293b',
        color: '#fef3c7',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check quota
    if (file.size > quota?.remaining) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Storage',
        text: `This file is too large. You have ${quota?.formatted_remaining} remaining.`,
        background: '#1e293b',
        color: '#fef3c7',
      });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(route('studio.editor.upload', project.id), {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(prev => [...prev, data.asset]);
        Swal.fire({
          icon: 'success',
          title: 'Asset Uploaded',
          timer: 1500,
          background: '#1e293b',
          color: '#fef3c7',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        background: '#1e293b',
        color: '#fef3c7',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add asset from library to timeline
  const addAssetToTimeline = (asset) => {
    const startTime = clips.reduce((sum, clip) => sum + clip.duration, 0);

    const newClip = {
      id: generateClipId(),
          assetId: asset.id,
          url: asset.url,
        duration: asset.duration_seconds || 10,
        startTime,
        name: asset.name,
        startOffset: 0,  // No trimming by default
        endOffset: 0,    // No trimming by default
      };

    setClips(prev => [...prev, newClip]);
  };

  // Add from user's video library
  const addFromUserLibrary = async (userFile) => {
    if (!project?.id) {
      Swal.fire({
        icon: 'info',
        title: 'Save Project First',
        text: 'Please save your project before adding assets from your library.',
        background: '#1e293b',
        color: '#fef3c7',
      });
        return;
      }

      try {
        const response = await fetch(route('studio.editor.addFromLibrary', project.id), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
          },
          body: JSON.stringify({ user_file_id: userFile.id }),
        });

      if (response.ok) {
        const data = await response.json();
        setAssets(prev => [...prev, data.asset]);
        addAssetToTimeline(data.asset);
      }
    } catch (error) {
      console.error('Failed to add from library:', error);
    }
  };

  // Remove clip from timeline
  const removeClip = (clipId) => {
    setClips(prev => {
      const filtered = prev.filter(c => c.id !== clipId);
      // Recalculate startTimes
      let currentStart = 0;
      return filtered.map(clip => {
        const updated = { ...clip, startTime: currentStart };
        currentStart += clip.duration;
        return updated;
      });
    });
  };

  // Split/Blade clip at current time
  const splitClipAtTime = (clipId, splitTime) => {
    setClips(prev => {
      const clipIndex = prev.findIndex(c => c.id === clipId);
      if (clipIndex === -1) return prev;
      
      const clip = prev[clipIndex];
      const localSplitTime = splitTime - clip.startTime;
      
      // Validate split time is within clip bounds
      if (localSplitTime <= 0 || localSplitTime >= clip.duration) return prev;
      
      // Create two new clips from the split
      const firstClip = {
        ...clip,
        id: generateClipId(),
        duration: localSplitTime,
        // First clip keeps startOffset, adds endOffset
        endOffset: (clip.endOffset || 0) + (clip.duration - localSplitTime),
      };
      
      const secondClip = {
        ...clip,
        id: generateClipId(),
        duration: clip.duration - localSplitTime,
        startTime: clip.startTime + localSplitTime,
        // Second clip adds startOffset, keeps endOffset
        startOffset: (clip.startOffset || 0) + localSplitTime,
      };
      
      // Replace original clip with two new clips
      const newClips = [...prev];
      newClips.splice(clipIndex, 1, firstClip, secondClip);
      
      // Recalculate startTimes
      let currentStart = 0;
      return newClips.map(c => {
        const updated = { ...c, startTime: currentStart };
        currentStart += c.duration;
        return updated;
      });
    });
  };

  // Playback logic
    const findActiveClip = useCallback((time) => {
        for (const clip of clips) {
            const clipEnd = clip.startTime + clip.duration;
            if (time >= clip.startTime && time < clipEnd) {
                return clip;
            }
        }
        return null;
    }, [clips]);

    useEffect(() => {
        if (!videoRef.current || clips.length === 0) return;
        
        const activeClip = findActiveClip(globalTime);
        
      if (!activeClip) {
            if (isPlaying) {
                setIsPlaying(false);
                setGlobalTime(0);
            }
            return;
        }

      if (activeClip.id !== activeClipId) {
          setActiveClipId(activeClip.id);
          videoRef.current.src = activeClip.url;
          // Apply startOffset: seek to the trimmed start position
          const localTime = globalTime - activeClip.startTime + (activeClip.startOffset || 0);
            videoRef.current.currentTime = localTime;

            if (isPlaying) {
                videoRef.current.play().catch(console.error);
            }
        } else {
            // Apply startOffset when calculating local time
            const localTime = globalTime - activeClip.startTime + (activeClip.startOffset || 0);
          const timeDiff = Math.abs(videoRef.current.currentTime - localTime);
            if (timeDiff > SEEK_THRESHOLD) {
                videoRef.current.currentTime = localTime;
            }
        }
    }, [isPlaying, globalTime, clips, activeClipId, findActiveClip]);

    useEffect(() => {
        if (isPlaying && clips.length > 0) {
            const activeClip = findActiveClip(globalTime);
            
          if (activeClip && videoRef.current) {
                videoRef.current.play().catch(console.error);

                const handleTimeUpdate = () => {
                    if (videoRef.current && activeClipId) {
                        const currentClip = clips.find(c => c.id === activeClipId);
                        if (currentClip) {
                            // Calculate global time accounting for startOffset
                            const localVideoTime = videoRef.current.currentTime;
                            const trimmedLocalTime = localVideoTime - (currentClip.startOffset || 0);
                            const newGlobalTime = currentClip.startTime + trimmedLocalTime;
                            setGlobalTime(newGlobalTime);
                        }
                    }
                };
                
                videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
              return () => videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
            }
        } else if (!isPlaying && videoRef.current) {
            videoRef.current.pause();
        }
    }, [isPlaying, clips, activeClipId, findActiveClip]);

    useEffect(() => {
        if (!videoRef.current) return;
        
      const handleEnded = () => {
            const activeClip = findActiveClip(globalTime);
            if (activeClip) {
                const nextTime = activeClip.startTime + activeClip.duration;
                const nextClip = findActiveClip(nextTime);
                
                if (nextClip) {
                    setGlobalTime(nextTime);
                } else {
                    setIsPlaying(false);
                    setGlobalTime(0);
                }
            }
        };
        
        videoRef.current.addEventListener('ended', handleEnded);
      return () => videoRef.current?.removeEventListener('ended', handleEnded);
    }, [globalTime, findActiveClip]);

    const togglePlayPause = () => {
        if (clips.length === 0) return;
        setIsPlaying(!isPlaying);
    };

    const handleTimelineClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
      const newTime = clickX / PIXELS_PER_SECOND;
        if (newTime >= 0 && newTime <= totalDuration) {
            if (activeTool === 'blade') {
                // Find clip at this time and split it
                const clipToSplit = findActiveClip(newTime);
                if (clipToSplit) {
                    splitClipAtTime(clipToSplit.id, newTime);
                    // Switch back to select tool after split
                    setActiveTool('select');
                }
            } else {
                // Default behavior: seek to time
                setGlobalTime(newTime);
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

  // Export workflow
    const startExport = () => {
        setIsExporting(true);
        setExportProgress(0);
        setExportComplete(false);
        
      const totalDuration = 4000;
        const messageInterval = totalDuration / EXPORT_MESSAGES.length;
        let messageIndex = 0;

        const messageTimer = setInterval(() => {
            if (messageIndex < EXPORT_MESSAGES.length) {
                setExportMessage(EXPORT_MESSAGES[messageIndex]);
                messageIndex++;
            } else {
                clearInterval(messageTimer);
            }
        }, messageInterval);

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

    return (
        <AuthenticatedLayout
            auth={auth}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={route('studio.projects')}
                className="p-2 hover:bg-white/5 rounded-lg transition"
              >
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                  </Link>
                  <div>
                    <h2 className="font-semibold text-lg text-amber-100 leading-tight flex items-center gap-2">
                      <Film className="w-5 h-5 text-emerald-400" />
                      {projectName}
                    </h2>
                    {project?.id && (
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {isSaving ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                          </>
                        ) : hasUnsavedChanges ? (
                          <span className="text-amber-500">Unsaved changes</span>
                        ) : lastSaved ? (
                          <span className="text-emerald-500">Saved {lastSaved.toLocaleTimeString()}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {quota && (
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                      <HardDrive className="w-4 h-4" />
                      {quota.formatted_remaining} free
                    </div>
                  )}
                        <button
                    onClick={saveTimeline}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50"
                        >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                        <button
                    onClick={() => setShowExportModal(true)}
                            disabled={clips.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition disabled:opacity-50"
                        >
                    🎬 <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            }
      >
        <Head title={`Editor - ${projectName}`} />

        <div className="h-[calc(100vh-140px)] w-full flex flex-col lg:flex-row bg-zinc-900">
          {/* Asset Library Sidebar */}
          <div className={`${showAssetLibrary ? 'block' : 'hidden'} lg:block w-full lg:w-72 bg-zinc-800 border-b lg:border-b-0 lg:border-r border-zinc-700 flex flex-col max-h-48 lg:max-h-full`}>
            <div className="p-4 border-b border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                            Assets
                        </h3>

              {project?.id ? (
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition cursor-pointer text-sm">
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload Asset
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleAssetUpload}
                    className="hidden"
                    accept="video/mp4,video/webm,video/quicktime,audio/*,image/*"
                    disabled={uploading}
                  />
                </label>
              ) : (
                <p className="text-xs text-zinc-500">Save project to upload assets</p>
              )}
            </div>

            {/* Project Assets */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {assets.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs text-zinc-500 uppercase mb-2">Project Assets</h4>
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => addAssetToTimeline(asset)}
                      className="flex items-center gap-3 p-2 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 cursor-pointer transition group"
                    >
                      <div className="w-10 h-10 bg-zinc-600 rounded flex items-center justify-center flex-shrink-0">
                        {asset.type === 'video' ? <Video className="w-5 h-5 text-emerald-400" /> :
                          asset.type === 'audio' ? <Music className="w-5 h-5 text-amber-400" /> :
                            <Image className="w-5 h-5 text-purple-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{asset.name}</p>
                        {asset.duration_seconds && (
                          <p className="text-xs text-zinc-500">{formatTime(asset.duration_seconds)}</p>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  ))}
                </div>
              )}

              {/* User's Video Library */}
              {userVideos.length > 0 && (
                <div>
                  <h4 className="text-xs text-zinc-500 uppercase mb-2">My Videos</h4>
                  {userVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => addFromUserLibrary(video)}
                      className="flex items-center gap-3 p-2 bg-zinc-700/30 rounded-lg hover:bg-zinc-700/50 cursor-pointer transition group"
                    >
                      <div className="w-10 h-10 bg-zinc-600 rounded flex items-center justify-center flex-shrink-0">
                        <Video className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300 truncate">{video.name}</p>
                        <p className="text-xs text-zinc-500">{video.formatted_size}</p>
                      </div>
                      <Plus className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  ))}
                </div>
              )}

              {assets.length === 0 && userVideos.length === 0 && (
                <div className="text-center py-8 text-zinc-500">
                  <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No assets yet</p>
                  <p className="text-xs mt-1">Upload videos to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Video Preview */}
            <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4 md:p-8 min-h-0">
              <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-contain"
                                playsInline
                                crossOrigin="anonymous"
                            />
                            
                            {clips.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                    <div className="text-center">
                      <Film className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-base md:text-lg">Add clips to start editing</p>
                      <p className="text-xs md:text-sm mt-1 text-zinc-600">Upload or drag videos from the sidebar</p>
                                    </div>
                                </div>
                            )}
                        </div>
            </div>

            {/* Playback Controls */}
            <div className="bg-zinc-800 border-t border-zinc-700 px-4 md:px-6 py-3">
              <div className="flex items-center justify-center gap-2 md:gap-4">
                            <button
                                onClick={() => setGlobalTime(0)}
                  className="p-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition disabled:opacity-50"
                                disabled={clips.length === 0}
                            >
                  <SkipBack className="w-4 md:w-5 h-4 md:h-5" />
                            </button>
                            <button
                                onClick={togglePlayPause}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition disabled:opacity-50"
                                disabled={clips.length === 0}
                            >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>
                            <button
                                onClick={() => setGlobalTime(totalDuration)}
                  className="p-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition disabled:opacity-50"
                                disabled={clips.length === 0}
                            >
                  <SkipForward className="w-4 md:w-5 h-4 md:h-5" />
                            </button>
                <span className="text-emerald-300 font-mono text-sm md:text-lg ml-2 md:ml-4">
                  {formatTime(globalTime)} / {formatTime(totalDuration)}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-zinc-800 border-t border-zinc-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Timeline</h3>
                  {/* Tool Indicator */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTool('select')}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        activeTool === 'select' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                          : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                      }`}
                      title="Select Tool (V or A)"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => setActiveTool('blade')}
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        activeTool === 'blade' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                          : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                      }`}
                      title="Blade/Split Tool (B)"
                    >
                      Blade
                    </button>
                  </div>
                </div>
                <span className="text-xs text-zinc-500">{clips.length} clips</span>
              </div>

              <div
                className={`relative bg-zinc-900 rounded-lg min-h-[80px] overflow-x-auto ${
                  activeTool === 'blade' ? 'cursor-crosshair' : 'cursor-pointer'
                }`}
                onClick={handleTimelineClick}
                style={{ width: clips.length > 0 ? `${Math.max(totalDuration * PIXELS_PER_SECOND + 40, 100)}px` : '100%' }}
              >
                <div className="relative h-16 flex items-center px-2">
                  {clips.map((clip, index) => (
                    <div
                      key={clip.id}
                                    className={`group h-12 rounded-md flex items-center justify-between px-2 text-xs font-medium transition cursor-pointer relative
                                            ${clip.id === activeClipId 
                                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-2 ring-emerald-400'
                                          : 'bg-gradient-to-r from-zinc-600 to-zinc-700 text-zinc-300 hover:from-zinc-500 hover:to-zinc-600'
                                      }`}
                                    style={{
                                      width: `${clip.duration * PIXELS_PER_SECOND}px`,
                                      marginLeft: index === 0 ? '0' : '2px',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setGlobalTime(clip.startTime);
                                    }}
                                  >
                                    <span className="truncate">{clip.name || `Clip ${index + 1}`}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeClip(clip.id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-500/20 rounded hover:bg-red-500/40 transition"
                                    >
                                      <X className="w-3 h-3 text-red-300" />
                                    </button>
                                  </div>
                                ))}

                  {clips.length === 0 && (
                    <div className="flex items-center justify-center w-full h-full text-zinc-500 text-sm">
                      Add clips to build your timeline
                    </div>
                  )}
                </div>

                {clips.length > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
                    style={{
                      left: `${globalTime * PIXELS_PER_SECOND + 8}px`,
                      transition: isPlaying ? 'none' : 'left 0.1s ease-out',
                    }}
                  >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>

            {/* Export Modal */}
        <Modal show={showExportModal} onClose={() => !isExporting && setShowExportModal(false)} maxWidth="md">
                <div className="bg-zinc-900 p-6">
                    {!exportComplete ? (
                        <>
                <h2 className="text-xl font-bold text-amber-100 mb-4">🎬 Export Settings</h2>
                            
                            {!isExporting ? (
                  <>
                                    <div className="mb-4">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Resolution</label>
                                        <div className="flex gap-3">
                        {['1080p', '4k'].map((res) => (
                                              <button
                                                key={res}
                                                onClick={() => setExportResolution(res)}
                                                className={`flex-1 px-4 py-3 rounded-lg border transition ${exportResolution === res
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                  }`}
                                              >
                                                <div className="font-semibold">{res.toUpperCase()}</div>
                                              </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Format</label>
                                        <div className="flex gap-3">
                        {['mp4', 'mov'].map((fmt) => (
                                              <button
                                                key={fmt}
                                                onClick={() => setExportFormat(fmt)}
                                                className={`flex-1 px-4 py-3 rounded-lg border transition ${exportFormat === fmt
                                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                                                  }`}
                                              >
                                                <div className="font-semibold">{fmt.toUpperCase()}</div>
                                              </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
                      <div className="text-sm text-zinc-400">Summary</div>
                                        <div className="mt-2 text-amber-100">
                        <span className="font-semibold">{clips.length}</span> clips •
                        <span className="font-semibold ml-1">{formatTime(totalDuration)}</span> duration
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                        onClick={() => setShowExportModal(false)}
                        className="flex-1 px-4 py-3 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={startExport}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition"
                                        >
                        🚀 Start Export
                                        </button>
                                    </div>
                                </>
                ) : (
                                <div className="py-8">
                                    <div className="mb-4">
                                        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                                            <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-100"
                                                style={{ width: `${exportProgress}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-between text-sm">
                                            <span className="text-zinc-400">{Math.round(exportProgress)}%</span>
                                            <span className="text-amber-300 font-mono">{exportMessage}</span>
                                        </div>
                      </div>
                                </div>
                            )}
                        </>
            ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-400" />
                            </div>
                  <h2 className="text-xl font-bold text-emerald-400 mb-2">Export Complete!</h2>
                  <p className="text-zinc-400 mb-6">Your video is ready.</p>
                            
                            <div className="flex flex-col gap-3">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg">
                                    ⬇️ Download Video
                    </button>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="w-full px-4 py-3 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition"
                                >
                      Close
                    </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
