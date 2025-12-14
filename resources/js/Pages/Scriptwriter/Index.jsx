import React, { useState, useEffect, useRef, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import debounce from 'lodash/debounce';

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

    // Block-based state management
    const [blocks, setBlocks] = useState([
        { id: generateBlockId(), type: 'scene-heading', content: 'INT. COFFEE SHOP - DAY' },
        { id: generateBlockId(), type: 'action', content: 'The room is silent.' }
    ]);

    const blockRefs = useRef({});

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

    // Auto-Save Logic (Debounced)
    const handleAutoSave = useCallback(
        debounce((blocksData) => {
            if (!activeScript) return;
            setIsSaving(true);
            axios.put(window.route('scriptwriter.update', activeScript.id), {
                content: JSON.stringify(blocksData),
                title: activeScript.title
            }).then(() => {
                setIsSaving(false);
            }).catch(err => console.error("Save failed", err));
        }, 2000),
        [activeScript]
    );

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

            {/* Full-Width Studio Layout Container */}
            <div className="h-[calc(100vh-64px)] w-full flex bg-zinc-100">

                {/* Left Pane - Scene Navigator */}
                <div className="w-64 bg-white border-r border-zinc-300 flex-shrink-0 flex flex-col">
                    <div className="p-4 border-b border-zinc-200">
                        <button
                            onClick={createNewScript}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded hover:from-amber-400 hover:to-amber-500 transition-all shadow-md"
                        >
                            + New Script
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        <h3 className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Scenes</h3>
                        {scripts.map(script => (
                            <div
                                key={script.id}
                                onClick={() => setActiveScript(script)}
                                className={`p-3 rounded cursor-pointer transition-colors ${activeScript?.id === script.id
                                    ? 'bg-amber-50 text-zinc-900 border-l-4 border-amber-500'
                                    : 'text-zinc-600 hover:bg-zinc-50'
                                    }`}
                            >
                                <div className="font-medium truncate text-sm">{script.title || 'Untitled Script'}</div>
                                <div className="text-xs text-zinc-400 mt-1">{new Date(script.created_at).toLocaleDateString()}</div>
                            </div>
                        ))}
                        {scripts.length === 0 && (
                            <div className="text-center text-zinc-400 text-sm py-6">No scripts yet.</div>
                        )}
                    </div>
                </div>

                {/* Center Pane - Editor */}
                <div className="flex-1 overflow-y-auto flex justify-center p-8 relative">
                    
                    {/* Floating Toolbar */}
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 bg-zinc-800 rounded-full px-4 py-2 shadow-lg">
                        <button 
                            aria-label="Insert scene heading"
                            onClick={() => changeBlockType('scene-heading')}
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Scene Heading
                        </button>
                        <button 
                            aria-label="Insert action line"
                            onClick={() => changeBlockType('action')}
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Action
                        </button>
                        <button 
                            aria-label="Insert character name"
                            onClick={() => changeBlockType('character')}
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Character
                        </button>
                        <button 
                            aria-label="Insert dialogue"
                            onClick={() => changeBlockType('dialogue')}
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Dialogue
                        </button>
                    </div>

                    {/* The "Paper" Component - Responsive wrapper */}
                    <div className="bg-white shadow-lg min-h-[11in] w-full max-w-[8.5in] p-6 md:p-12 font-mono text-zinc-900 mt-16">
                        {/* Title bar inside paper */}
                        <div className="mb-6 pb-4 border-b border-zinc-200 flex items-center justify-between">
                            <input 
                                value={activeScript?.title || ''}
                                onChange={(e) => setActiveScript({ ...activeScript, title: e.target.value })}
                                onBlur={() => handleAutoSave(blocks)}
                                className="bg-transparent border-none text-xl font-bold text-zinc-900 focus:ring-0 placeholder-zinc-400 w-full font-sans"
                                placeholder="Untitled Script"
                            />
                            <div className="text-xs text-amber-600 ml-4 flex-shrink-0">
                                {isSaving ? 'Saving...' : '✓ Saved'}
                            </div>
                        </div>

                        {/* Block-based Editor */}
                        <div className="space-y-2">
                            {blocks.map((block, index) => (
                                <div key={block.id} className="relative">
                                    <input
                                        ref={el => blockRefs.current[block.id] = el}
                                        type="text"
                                        value={block.content}
                                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, block.id, block.type)}
                                        onFocus={() => setFocusedBlockId(block.id)}
                                        className={getBlockClasses(block.type)}
                                        placeholder={`${block.type.replace('-', ' ')}...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tip Bubble */}
                    {showHint && (
                        <div className="fixed bottom-6 left-6 z-40 bg-zinc-800 text-zinc-200 text-sm p-4 rounded-lg border border-zinc-700 shadow-xl max-w-xs">
                            <button 
                                onClick={() => setShowHint(false)}
                                className="absolute top-2 right-2 text-zinc-400 hover:text-white"
                            >
                                ✕
                            </button>
                            <p className="flex items-start gap-2">
                                <span className="text-xl">💡</span>
                                <span><strong>Pro Tip:</strong> Use Enter to add new blocks, Tab to cycle block types, and Backspace on empty blocks to delete them!</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Pane - Spark AI Tools */}
                <div className="w-80 bg-white border-l border-zinc-300 flex-shrink-0 flex flex-col">
                    <div className="p-4 border-b border-zinc-200">
                        <h3 className="font-semibold text-lg text-zinc-900">✨ Spark AI</h3>
                        <p className="text-xs text-zinc-500 mt-1">AI-powered writing assistant</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Smart Formatting</h4>
                            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-700 space-y-2">
                                <div>
                                    <p className="font-semibold">⏎ Enter</p>
                                    <p className="text-zinc-600">Auto-advance to next block type</p>
                                </div>
                                <div>
                                    <p className="font-semibold">⇥ Tab</p>
                                    <p className="text-zinc-600">Cycle through block types</p>
                                </div>
                                <div>
                                    <p className="font-semibold">⌫ Backspace</p>
                                    <p className="text-zinc-600">Delete empty blocks</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-200">
                            <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-2">Block Types</h4>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-zinc-700 space-y-1">
                                <p><span className="font-semibold">Scene Heading:</span> UPPERCASE, bold</p>
                                <p><span className="font-semibold">Action:</span> Standard width</p>
                                <p><span className="font-semibold">Character:</span> Centered, UPPERCASE</p>
                                <p><span className="font-semibold">Dialogue:</span> Centered, 75% width</p>
                                <p><span className="font-semibold">Parenthetical:</span> Centered, italic</p>
                                <p><span className="font-semibold">Transition:</span> Right-aligned, UPPERCASE</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
