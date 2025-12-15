import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { Cloud, CloudOff, Check, RefreshCw, FileText, Sparkles, Type, MessageSquare, Film, Wand2, Zap, BookOpen, Link2, X } from 'lucide-react';

// Utility to generate unique IDs
let blockIdCounter = Date.now();
const generateBlockId = () => ++blockIdCounter;

export default function Scriptwriter({ auth, scripts: initialScripts = [] }) {
    // State
    const [scripts, setScripts] = useState(initialScripts);
    const [activeScript, setActiveScript] = useState(scripts.length > 0 ? scripts[0] : null);
    const [isSaving, setIsSaving] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const [focusedBlockId, setFocusedBlockId] = useState(null);
    
    // Sync status state
    const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'

    // Project linking state
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [userProjects, setUserProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [syncingProject, setSyncingProject] = useState(false);

    // Spark AI state
    const [isRewriting, setIsRewriting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scenePrompt, setScenePrompt] = useState('');

    // Block-based state management
    const [blocks, setBlocks] = useState([
        { id: generateBlockId(), type: 'scene-heading', content: 'INT. COFFEE SHOP - DAY' },
        { id: generateBlockId(), type: 'action', content: 'The room is silent.' }
    ]);

    const blockRefs = useRef({});
    const activeScriptRef = useRef(activeScript);

    // Keep ref in sync with state
    useEffect(() => {
        activeScriptRef.current = activeScript;
    }, [activeScript]);

    // Derived state: Extract scenes for navigation (memoized for performance)
    const scenes = useMemo(() => {
        return blocks
            .map((block, index) => ({ ...block, originalIndex: index }))
            .filter(block => block.type === 'scene-heading')
            .map((scene, sceneIndex) => ({
                ...scene,
                sceneNumber: sceneIndex + 1
            }));
    }, [blocks]);

    // Scene number map for O(1) lookups (memoized)
    const sceneNumberMap = useMemo(() => {
        const map = new Map();
        scenes.forEach(scene => {
            map.set(scene.id, scene.sceneNumber);
        });
        return map;
    }, [scenes]);

    // Initialize blocks from activeScript
    useEffect(() => {
        if (activeScript && activeScript.content) {
            try {
                const parsed = typeof activeScript.content === 'string' 
                    ? JSON.parse(activeScript.content) 
                    : activeScript.content;
                
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Ensure each block has a unique ID
                    const blocksWithIds = parsed.map(block => ({
                        ...block,
                        id: block.id || generateBlockId()
                    }));
                    setBlocks(blocksWithIds);
                } else {
                    // Default blocks if content is not in expected format
                    setBlocks([
                        { id: generateBlockId(), type: 'scene-heading', content: 'INT. SCENE 1 - DAY' },
                        { id: generateBlockId(), type: 'action', content: '' }
                    ]);
                }
            } catch (e) {
                // If parsing fails, initialize with default blocks
                setBlocks([
                    { id: generateBlockId(), type: 'scene-heading', content: 'INT. SCENE 1 - DAY' },
                    { id: generateBlockId(), type: 'action', content: '' }
                ]);
            }
        }
    }, [activeScript]);

    // Create New Script
    const createNewScript = async () => {
        try {
            const res = await axios.post(window.route('scriptwriter.store'));
            const newScript = res.data.script;
            setScripts([newScript, ...scripts]);
            setActiveScript(newScript);
        } catch (error) {
            console.error(error);
        }
    };

    // Save Title Function
    const saveTitle = useCallback((newTitle) => {
        const currentScript = activeScriptRef.current;
        if (!currentScript || !currentScript.id) return;
        
        setSyncStatus('syncing');
        axios.put(route('scriptwriter.update', currentScript.id), {
            title: newTitle
        }).then((response) => {
            setSyncStatus('synced');
            // Update the script in the list
            setScripts(prev => prev.map(s => 
                s.id === currentScript.id ? { ...s, title: newTitle } : s
            ));
        }).catch(err => {
            console.error("Title save failed", err);
            setSyncStatus('offline');
        });
    }, []);

    // Auto-Save Logic (Debounced)
    const handleAutoSave = useCallback(
        debounce((blocksData) => {
            const currentScript = activeScriptRef.current;
            if (!currentScript || !currentScript.id) return;
            setIsSaving(true);
            setSyncStatus('syncing');
            axios.put(route('scriptwriter.update', currentScript.id), {
                content: JSON.stringify(blocksData)
            }).then(() => {
                setIsSaving(false);
                setSyncStatus('synced');
            }).catch(err => {
                console.error("Save failed", err);
                setSyncStatus('offline');
            });
        }, 2000),
        []
    );

    // Manual sync trigger
    const handleManualSync = () => {
        const currentScript = activeScriptRef.current;
        if (!currentScript || !currentScript.id || syncStatus === 'syncing') return;
        setSyncStatus('syncing');
        axios.put(route('scriptwriter.update', currentScript.id), {
            content: JSON.stringify(blocks)
        }).then(() => {
            setSyncStatus('synced');
        }).catch(err => {
            console.error("Sync failed", err);
            setSyncStatus('offline');
        });
    };

    // Save blocks when they change
    useEffect(() => {
        if (blocks.length > 0) {
            handleAutoSave(blocks);
        }
    }, [blocks]);

    // Predictive "Enter" logic
    const getNextBlockType = (currentType) => {
        const flowMap = {
            'scene-heading': 'action',
            'character': 'dialogue',
            'parenthetical': 'dialogue',
            'dialogue': 'character',
            'transition': 'scene-heading',
            'action': 'action'
        };
        return flowMap[currentType] || 'action';
    };

    // Tab cycling logic
    const getNextTypeOnTab = (currentType) => {
        const tabCycle = {
            'action': 'character',
            'character': 'transition',
            'transition': 'action',
            'dialogue': 'parenthetical',
            'parenthetical': 'dialogue',
            'scene-heading': 'action'
        };
        return tabCycle[currentType] || currentType;
    };

    // Handle key events
    const handleKeyDown = (e, blockId, blockType) => {
        const blockIndex = blocks.findIndex(b => b.id === blockId);
        
        // Enter key
        if (e.key === 'Enter') {
            e.preventDefault();
            const newBlockType = getNextBlockType(blockType);
            const newBlock = {
                id: generateBlockId(),
                type: newBlockType,
                content: ''
            };
            
            const newBlocks = [
                ...blocks.slice(0, blockIndex + 1),
                newBlock,
                ...blocks.slice(blockIndex + 1)
            ];
            setBlocks(newBlocks);
            
            // Focus new block after render
            setTimeout(() => {
                blockRefs.current[newBlock.id]?.focus();
            }, 0);
        }
        
        // Tab key - cycle block type
        if (e.key === 'Tab') {
            e.preventDefault();
            const newType = getNextTypeOnTab(blockType);
            const newBlocks = blocks.map(block => 
                block.id === blockId ? { ...block, type: newType } : block
            );
            setBlocks(newBlocks);
        }
        
        // Backspace - delete empty block
        if (e.key === 'Backspace' && blocks[blockIndex].content === '' && blocks.length > 1) {
            e.preventDefault();
            const newBlocks = blocks.filter(b => b.id !== blockId);
            setBlocks(newBlocks);
            
            // Focus previous block
            if (blockIndex > 0) {
                const prevBlock = blocks[blockIndex - 1];
                setTimeout(() => {
                    blockRefs.current[prevBlock.id]?.focus();
                }, 0);
            }
        }
    };

    // Update block content
    const updateBlockContent = (blockId, newContent) => {
        const newBlocks = blocks.map(block => 
            block.id === blockId ? { ...block, content: newContent } : block
        );
        setBlocks(newBlocks);
    };

    // Change block type from toolbar
    const changeBlockType = (newType) => {
        if (focusedBlockId) {
            const newBlocks = blocks.map(block => 
                block.id === focusedBlockId ? { ...block, type: newType } : block
            );
            setBlocks(newBlocks);
        }
    };

    // Get block styling classes
    const getBlockClasses = (type) => {
        const baseClasses = 'w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-amber-500/20 rounded px-2 py-1 transition-all';
        const typeClasses = {
            'scene-heading': 'font-bold uppercase text-base',
            'action': 'text-base',
            'character': 'text-center uppercase font-semibold w-1/2 mx-auto text-base',
            'dialogue': 'text-center w-3/4 mx-auto text-base',
            'parenthetical': 'text-center w-1/3 mx-auto italic text-sm',
            'transition': 'text-right uppercase font-semibold text-base'
        };
        return `${baseClasses} ${typeClasses[type] || ''}`;
    };

    // Spark AI: Rewrite focused block
    const handleSparkRewrite = async (tone) => {
        if (!focusedBlockId) {
            alert('Please select a block first by clicking on it.');
            return;
        }

        const block = blocks.find(b => b.id === focusedBlockId);
        if (!block || !block.content.trim()) {
            alert('The selected block is empty. Please add some content first.');
            return;
        }

        setIsRewriting(true);
        try {
            const response = await axios.post(window.route('spark.rewrite'), {
                content: block.content,
                type: block.type,
                tone: tone
            });

            // Update the block with the rewritten content
            const newBlocks = blocks.map(b => 
                b.id === focusedBlockId 
                    ? { ...b, content: response.data.rewrittenContent } 
                    : b
            );
            setBlocks(newBlocks);
        } catch (error) {
            console.error('Rewrite error:', error);
            alert(error.response?.data?.error || 'Failed to rewrite. Please try again.');
        } finally {
            setIsRewriting(false);
        }
    };

    // Spark AI: Generate new scene
    const handleSparkGenerate = async () => {
        if (!scenePrompt.trim()) {
            alert('Please describe the scene you want to generate.');
            return;
        }

        setIsGenerating(true);
        try {
            // Get last 3 blocks as context
            const contextBlocks = blocks.slice(-3);
            const context = contextBlocks.map(b => `${b.type}: ${b.content}`).join('\n');

            const response = await axios.post(window.route('spark.generate'), {
                prompt: scenePrompt,
                context: context
            });

            // Add IDs to generated blocks and append to current script
            const generatedBlocks = response.data.blocks.map(block => ({
                ...block,
                id: generateBlockId()
            }));

            setBlocks([...blocks, ...generatedBlocks]);
            setScenePrompt(''); // Clear the prompt

            // Scroll to the newly generated content
            setTimeout(() => {
                const lastBlock = generatedBlocks[generatedBlocks.length - 1];
                blockRefs.current[lastBlock.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        } catch (error) {
            console.error('Generate error:', error);
            alert(error.response?.data?.error || 'Failed to generate scene. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Scene Navigation: Scroll to specific scene block
    const scrollToScene = (blockId) => {
        const element = blockRefs.current[blockId];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            setFocusedBlockId(blockId);
        }
    };

    // Project Syncing Functions
    const fetchUserProjects = async () => {
        setLoadingProjects(true);
        try {
            const response = await axios.get(route('scriptwriter.userProjects'));
            setUserProjects(response.data.projects);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleOpenProjectModal = () => {
        setShowProjectModal(true);
        fetchUserProjects();
    };

    const handleSyncToProject = async (projectId) => {
        if (!activeScript || !activeScript.id) return;
        
        setSyncingProject(true);
        try {
            const response = await axios.post(route('scriptwriter.attachProject', activeScript.id), {
                project_id: projectId
            });
            
            // Update active script with project info
            setActiveScript(response.data.script);
            setScripts(prev => prev.map(s => 
                s.id === activeScript.id ? response.data.script : s
            ));
            
            setShowProjectModal(false);
            setSyncStatus('synced');
        } catch (error) {
            console.error('Failed to sync to project:', error);
            alert(error.response?.data?.error || 'Failed to sync to project');
        } finally {
            setSyncingProject(false);
        }
    };

    const handleUnlinkProject = async () => {
        if (!activeScript || !activeScript.id) return;
        
        setSyncingProject(true);
        try {
            const response = await axios.post(route('scriptwriter.attachProject', activeScript.id), {
                project_id: null
            });
            
            setActiveScript(response.data.script);
            setScripts(prev => prev.map(s => 
                s.id === activeScript.id ? response.data.script : s
            ));
            
            setShowProjectModal(false);
        } catch (error) {
            console.error('Failed to unlink project:', error);
        } finally {
            setSyncingProject(false);
        }
    };

    // PDF Export: Trigger browser print
    const handleExportPDF = () => {
        window.print();
    };

    // Get scene number for a block (O(1) lookup)
    const getSceneNumber = (blockId) => {
        return sceneNumberMap.get(blockId) || null;
    };

    // Hint Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={null}
        >
            <Head title="Scriptwriter" />

            {/* Print Styles for PDF Export */}
            <style>{`
                @media print {
                    @page {
                        size: letter;
                        margin: 1in;
                    }
                    
                    body {
                        background: white !important;
                    }
                    
                    /* Hide UI elements */
                    nav, .print\\:hidden {
                        display: none !important;
                    }
                    
                    /* Ensure black text */
                    * {
                        color: black !important;
                    }
                    
                    /* Page breaks for scene headings */
                    .print\\:break-before-page:not(:first-child) {
                        page-break-before: always;
                    }
                    
                    /* Full width paper */
                    .print\\:w-full {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    
                    /* Remove shadows */
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    
                    /* Remove padding */
                    .print\\:p-0 {
                        padding: 0 !important;
                    }
                    
                    /* Remove margin-top */
                    .print\\:mt-0 {
                        margin-top: 0 !important;
                    }
                    
                    /* Ensure proper font for screenplay */
                    input[type="text"] {
                        border: none !important;
                        outline: none !important;
                        background: transparent !important;
                    }
                }
            `}</style>

            {/* Full-Width Studio Layout with Cinematic Gradient Background */}
            <div className="h-[calc(100vh-64px)] w-full flex bg-gradient-to-br from-slate-950 via-slate-900 to-black">

                {/* Left Pane - Scene Navigator (Glass Pane) */}
                <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex-shrink-0 flex flex-col print:hidden">
                    <div className="p-4 border-b border-white/10 space-y-3">
                        <button
                            onClick={createNewScript}
                            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            + New Script
                        </button>
                        <button
                            onClick={handleOpenProjectModal}
                            className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold rounded-xl transition-all border border-purple-500/30 flex items-center justify-center gap-2"
                            disabled={!activeScript}
                        >
                            <Link2 className="w-4 h-4" />
                            Sync to Project
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold rounded-xl transition-all border border-blue-500/30 flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            Export PDF
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <h3 className="px-2 text-xs font-semibold text-amber-500/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Film className="w-3 h-3" />
                            Scenes ({scenes.length})
                        </h3>
                        {scenes.map((scene) => (
                            <div
                                key={scene.id}
                                onClick={() => scrollToScene(scene.id)}
                                className="p-3 rounded-xl cursor-pointer transition-all bg-white/5 hover:bg-white/10 border border-transparent hover:border-amber-500/30 group"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-900 text-xs font-bold flex-shrink-0 shadow-lg shadow-amber-500/20">
                                        {scene.sceneNumber}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-slate-200 truncate group-hover:text-white transition-colors">
                                            {scene.content || `Scene ${scene.sceneNumber}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {scenes.length === 0 && (
                            <div className="text-center text-slate-500 text-sm py-8 px-4">
                                <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No scenes yet. Add a Scene Heading block to get started.
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Pane - Editor */}
                <div className="flex-1 overflow-y-auto flex justify-center p-8 relative">
                    
                    {/* Command Dock - macOS style bottom toolbar */}
                    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 print:hidden">
                        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl rounded-2xl px-2 py-2 shadow-2xl shadow-black/50 border border-white/10">
                            <button
                                aria-label="Insert scene heading"
                                onClick={() => changeBlockType('scene-heading')}
                                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${focusedBlockId && blocks.find(b => b.id === focusedBlockId)?.type === 'scene-heading' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Film className="w-4 h-4" />
                                Scene
                            </button>
                            <button
                                aria-label="Insert action line"
                                onClick={() => changeBlockType('action')}
                                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${focusedBlockId && blocks.find(b => b.id === focusedBlockId)?.type === 'action' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Zap className="w-4 h-4" />
                                Action
                            </button>
                            <button
                                aria-label="Insert character name"
                                onClick={() => changeBlockType('character')}
                                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${focusedBlockId && blocks.find(b => b.id === focusedBlockId)?.type === 'character' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Type className="w-4 h-4" />
                                Character
                            </button>
                            <button
                                aria-label="Insert dialogue"
                                onClick={() => changeBlockType('dialogue')}
                                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${focusedBlockId && blocks.find(b => b.id === focusedBlockId)?.type === 'dialogue' ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Dialogue
                            </button>
                            <div className="w-px h-8 bg-white/20 mx-1" />
                            <button
                                aria-label="Insert parenthetical"
                                onClick={() => changeBlockType('parenthetical')}
                                className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${focusedBlockId && blocks.find(b => b.id === focusedBlockId)?.type === 'parenthetical' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                (...)
                            </button>
                            <button
                                aria-label="Insert transition"
                                onClick={() => changeBlockType('transition')}
                                className={`px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${focusedBlockId && blocks.find(b => b.id === focusedBlockId)?.type === 'transition' ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                CUT TO
                            </button>
                        </div>
                    </div>

                    {/* The "Paper" Component - Floating with realistic shadow */}
                    <div className="bg-white shadow-[0_25px_100px_-12px_rgba(0,0,0,0.8)] min-h-[11in] w-full max-w-[8.5in] p-6 md:p-12 font-mono text-zinc-900 rounded-lg print:shadow-none print:p-0 print:mt-0 print:w-full print:max-w-full print:rounded-none">
                        {/* Title bar inside paper */}
                        <div className="mb-6 pb-4 border-b border-zinc-200 flex items-center justify-between print:hidden">
                            <div className="flex-1 flex flex-col gap-2">
                                <input 
                                    value={activeScript?.title || ''}
                                    onChange={(e) => {
                                        if (activeScript) {
                                            setActiveScript({ ...activeScript, title: e.target.value });
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (activeScript && activeScript.id) {
                                            saveTitle(e.target.value);
                                        }
                                    }}
                                    className="bg-transparent border-none text-xl font-bold text-zinc-900 focus:ring-0 placeholder-zinc-400 w-full font-sans"
                                    placeholder="Untitled Script"
                                />
                                {activeScript?.project && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Link2 className="w-4 h-4" />
                                        <span>Synced to: <span className="font-semibold">{activeScript.project.title}</span></span>
                                        <button
                                            onClick={handleUnlinkProject}
                                            className="text-red-600 hover:text-red-800 ml-2"
                                            title="Unlink from project"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Cloud Sync Button */}
                            <button
                                onClick={handleManualSync}
                                disabled={syncStatus === 'syncing'}
                                className={`ml-4 flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${syncStatus === 'synced'
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : syncStatus === 'syncing'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                            >
                                {syncStatus === 'synced' && (
                                    <>
                                        <Cloud className="w-4 h-4" />
                                        <span>Synced</span>
                                        <Check className="w-3 h-3" />
                                    </>
                                )}
                                {syncStatus === 'syncing' && (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Syncing...</span>
                                    </>
                                )}
                                {syncStatus === 'offline' && (
                                    <>
                                        <CloudOff className="w-4 h-4" />
                                        <span>Retry Sync</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Block-based Editor */}
                        <div className="space-y-2">
                            {blocks.map((block, index) => {
                                const sceneNumber = block.type === 'scene-heading' ? getSceneNumber(block.id) : null;
                                return (
                                    <div key={block.id} className="relative flex items-start gap-2">
                                        {/* Scene Number Badge (only for scene headings) */}
                                        {sceneNumber && (
                                            <div className="flex-shrink-0 w-8 pt-1 print:hidden">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
                                                    {sceneNumber}
                                                </span>
                                            </div>
                                        )}
                                        {!sceneNumber && <div className="flex-shrink-0 w-8 print:hidden"></div>}
                                        
                                        <textarea
                                            ref={el => blockRefs.current[block.id] = el}
                                            value={block.content}
                                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, block.id, block.type)}
                                            onFocus={() => setFocusedBlockId(block.id)}
                                            className={`${getBlockClasses(block.type)} ${block.type === 'scene-heading' ? 'print:break-before-page' : ''} flex-1 resize-none overflow-hidden`}
                                            placeholder={`${block.type.replace('-', ' ')}...`}
                                            rows={1}
                                            style={{ minHeight: '1.75rem' }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pro Tip Bubble */}
                    {showHint && (
                        <div className="fixed bottom-24 left-6 z-40 bg-slate-900/95 backdrop-blur-xl text-slate-200 text-sm p-4 rounded-2xl border border-white/10 shadow-2xl max-w-xs print:hidden">
                            <button 
                                onClick={() => setShowHint(false)}
                                className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                            <p className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <span><strong className="text-amber-500">Pro Tip:</strong> Use Enter to add new blocks, Tab to cycle block types, and Backspace on empty blocks to delete them!</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Pane - Spark AI Tools (Glass Pane) */}
                <div className="w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex-shrink-0 flex flex-col print:hidden">
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-white">Spark AI</h3>
                                <p className="text-xs text-slate-400">AI-powered writing assistant</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-5">
                        
                        {/* Rewrite Section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                <Wand2 className="w-3 h-3" />
                                Rewrite Block
                            </h4>
                            <p className="text-xs text-slate-400">Select a tone to rewrite the focused block:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleSparkRewrite('witty')}
                                    disabled={isRewriting || !focusedBlockId}
                                    className="p-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-all border border-purple-500/30 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {isRewriting ? <RefreshCw className="w-3 h-3 animate-spin" /> : '😄'} Witty
                                </button>
                                <button
                                    onClick={() => handleSparkRewrite('dramatic')}
                                    disabled={isRewriting || !focusedBlockId}
                                    className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all border border-red-500/30 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {isRewriting ? <RefreshCw className="w-3 h-3 animate-spin" /> : '🎭'} Dramatic
                                </button>
                                <button
                                    onClick={() => handleSparkRewrite('concise')}
                                    disabled={isRewriting || !focusedBlockId}
                                    className="p-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl transition-all border border-blue-500/30 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {isRewriting ? <RefreshCw className="w-3 h-3 animate-spin" /> : '✂️'} Concise
                                </button>
                                <button
                                    onClick={() => handleSparkRewrite('aggressive')}
                                    disabled={isRewriting || !focusedBlockId}
                                    className="p-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-xl transition-all border border-orange-500/30 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {isRewriting ? <RefreshCw className="w-3 h-3 animate-spin" /> : '💪'} Aggressive
                                </button>
                            </div>
                        </div>

                        {/* Scene Generator Section */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                            <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Generate Scene
                            </h4>
                            <textarea
                                value={scenePrompt}
                                onChange={(e) => setScenePrompt(e.target.value)}
                                placeholder="Describe the scene you want to generate..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-sm text-white placeholder-slate-500 resize-none transition-all"
                                rows="3"
                                disabled={isGenerating}
                            />
                            <button
                                onClick={handleSparkGenerate}
                                disabled={isGenerating || !scenePrompt.trim()}
                                className="w-full p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg shadow-emerald-500/20 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Generate Scene
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-slate-500 italic">Tip: Spark will use your recent script as context.</p>
                        </div>

                        {/* Smart Formatting Guide */}
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3">Smart Formatting</h4>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-slate-300 space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-mono">↵</span>
                                    <div>
                                        <p className="font-semibold text-white">Enter</p>
                                        <p className="text-slate-400">Auto-advance to next block type</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-mono">⇥</span>
                                    <div>
                                        <p className="font-semibold text-white">Tab</p>
                                        <p className="text-slate-400">Cycle through block types</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-mono">⌫</span>
                                    <div>
                                        <p className="font-semibold text-white">Backspace</p>
                                        <p className="text-slate-400">Delete empty blocks</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Block Types Reference */}
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3">Block Types</h4>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                                <p><span className="font-semibold text-amber-400">Scene Heading:</span> UPPERCASE, bold</p>
                                <p><span className="font-semibold text-amber-400">Action:</span> Standard width</p>
                                <p><span className="font-semibold text-amber-400">Character:</span> Centered, UPPERCASE</p>
                                <p><span className="font-semibold text-amber-400">Dialogue:</span> Centered, 75% width</p>
                                <p><span className="font-semibold text-amber-400">Parenthetical:</span> Centered, italic</p>
                                <p><span className="font-semibold text-amber-400">Transition:</span> Right-aligned, UPPERCASE</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Project Selector Modal */}
            {showProjectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-white/10">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                    <Link2 className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Sync to Project</h3>
                                    <p className="text-sm text-slate-400">Link this script to one of your projects</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProjectModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                                </div>
                            ) : userProjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <Film className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 mb-2">No projects found</p>
                                    <p className="text-sm text-slate-500">Create a project first to sync your script</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {activeScript?.project_id && (
                                        <button
                                            onClick={handleUnlinkProject}
                                            disabled={syncingProject}
                                            className="p-4 rounded-xl border-2 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <X className="w-5 h-5 text-red-400" />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-red-400">Unlink from Current Project</p>
                                                    <p className="text-sm text-slate-400">Make this script standalone</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                    {userProjects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleSyncToProject(project.id)}
                                            disabled={syncingProject || activeScript?.project_id === project.id}
                                            className={`p-4 rounded-xl border transition-all text-left ${
                                                activeScript?.project_id === project.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50'
                                            } ${syncingProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {project.thumbnail_url ? (
                                                    <img
                                                        src={project.thumbnail_url}
                                                        alt={project.title}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                                                        <Film className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-white">{project.title}</p>
                                                    <p className="text-sm text-slate-400">
                                                        Created {new Date(project.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {activeScript?.project_id === project.id && (
                                                    <Check className="w-5 h-5 text-purple-400" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
