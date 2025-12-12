import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import BubbleMenu from '@/Components/BubbleMenu';
import StarterKit from '@tiptap/starter-kit';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function ScriptwriterIndex({ auth, scripts: initialScripts = [] }) {
    const [scripts, setScripts] = useState(initialScripts || []);
    const [selectedScript, setSelectedScript] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const titleInputRef = useRef(null);

    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
    const [isSaving, setIsSaving] = useState(false);

    const saveTimerRef = useRef(null);

    const showToast = (message, type = 'info', ms = 3000) => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), ms);
    };

    const defaultContent = '<p>INT. COFFEE SHOP - DAY</p>\n<p>Two strangers sit across from each other. Steam rises from their cups.</p>';

    // TipTap editor setup
    const editor = useEditor({
        extensions: [StarterKit],
        content: defaultContent,
    });

    // AI menu/selection state (kept from earlier implementation)
    const [isProcessing, setIsProcessing] = useState(false);
    const [menuPos, setMenuPos] = useState({ left: 0, top: 0, visible: false });
    // Pro Tip hint state (floating bulb)
    const [showHint, setShowHint] = useState(true);
    const hintTimerRef = useRef(null);

    // Load a script into the editor
    const loadScript = (script) => {
        setSelectedScript(script);
        if (!editor) return;
        if (script && script.content) {
            const content = script.content;
            (async () => {
                try {
                    // If content looks like HTML, use directly
                    if (typeof content === 'string' && content.trim().startsWith('<')) {
                        editor.commands.setContent(content);
                        return;
                    }

                    // If content appears to be Markdown (no leading <), try to convert using 'marked'
                    if (typeof content === 'string') {
                        try {
                            const marked = (await import('marked')).default || (await import('marked'));
                            const html = marked.parse(content);
                            editor.commands.setContent(html);
                            return;
                        } catch (e) {
                            // marked not available — fall back to inserting as plain text
                            editor.commands.setContent(`<pre>${(content || '').replace(/</g, '&lt;')}</pre>`);
                            return;
                        }
                    }

                    // fallback: set raw content
                    editor.commands.setContent(content || defaultContent);
                } catch (e) {
                    editor.commands.setContent(defaultContent);
                }
            })();
        } else {
            editor.commands.setContent(defaultContent);
        }
    };

    // Create a new script
    const createScript = async () => {
        try {
            const res = await axios.post(route('scriptwriter.store'), { title: 'Untitled Script', content: null });
            const script = res.data.script;
            setScripts(prev => [script, ...prev]);
            loadScript(script);
            showToast('Script created', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to create script', 'error');
        }
    };

    const startEditing = (script) => {
        setEditingId(script.id);
        setEditingTitle(script.title || '');
        setTimeout(() => titleInputRef.current && titleInputRef.current.focus(), 50);
    };

    const submitTitleEdit = async (script) => {
        if (!script) return;
        const newTitle = (editingTitle || '').trim();
        setEditingId(null);
        if (!newTitle) return;
        try {
            await axios.put(route('scriptwriter.update', script.id), { title: newTitle });
            setScripts(prev => prev.map(s => s.id === script.id ? { ...s, title: newTitle } : s));
            if (selectedScript && selectedScript.id === script.id) {
                setSelectedScript(prev => ({ ...prev, title: newTitle }));
            }
            showToast('Title updated', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to update title', 'error');
        }
    };

    const confirmDelete = (script) => {
        if (!script) return;
        if (!window.confirm('Delete this script? This cannot be undone.')) return;
        axios.delete(route('scriptwriter.destroy', script.id))
            .then(() => {
                setScripts(prev => prev.filter(s => s.id !== script.id));
                if (selectedScript && selectedScript.id === script.id) {
                    setSelectedScript(null);
                    editor && editor.commands.setContent(defaultContent);
                }
                showToast('Script deleted', 'success');
            }).catch((err) => {
                console.error(err);
                showToast('Failed to delete script', 'error');
            });
    };

    // Autosave: debounce editor changes and send to server
    const scheduleAutoSave = () => {
        if (!selectedScript) return;
        if (!editor) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            try {
                setIsSaving(true);
                // Try to save Markdown by converting HTML -> Markdown using turndown if available
                let contentToSave = null;
                try {
                    const html = editor.getHTML();
                    const TurndownService = (await import('turndown')).default || (await import('turndown'));
                    const turndown = new TurndownService();
                    contentToSave = turndown.turndown(html);
                } catch (e) {
                    // turndown not available — fall back to saving HTML
                    try { contentToSave = editor.getHTML(); } catch (e2) { contentToSave = editor.getText(); }
                }

                const payload = { content: contentToSave, title: selectedScript.title };
                await axios.put(route('scriptwriter.update', selectedScript.id), payload);
                setScripts(prev => prev.map(s => s.id === selectedScript.id ? { ...s, content: payload.content, title: payload.title } : s));
                setSelectedScript(prev => prev ? ({ ...prev, content: payload.content }) : prev);
                setIsSaving(false);
                showToast('Auto-saved', 'success', 1200);
            } catch (err) {
                console.error(err);
                setIsSaving(false);
                showToast('Auto-save failed', 'error');
            }
        }, 1100);
    };

    useEffect(() => {
        if (!editor) return;
        const onUpdate = () => {
            // only schedule autosave when a script is selected
            if (selectedScript) scheduleAutoSave();
        };
        editor.on('update', onUpdate);
        return () => editor.off('update', onUpdate);
    }, [editor, selectedScript]);

    // selection-aware AI menu (unchanged behaviour)
    useEffect(() => {
        if (!editor) return;
        const updateMenu = () => {
            try {
                const { from, to, empty } = editor.state.selection;
                if (empty || from === to) {
                    setMenuPos((p) => ({ ...p, visible: false }));
                    return;
                }
                const pos = Math.floor((from + to) / 2);
                const coords = editor.view.coordsAtPos(pos);
                const editorRect = editor.view.dom.getBoundingClientRect();
                setMenuPos({ left: coords.left - editorRect.left, top: coords.top - editorRect.top - 44, visible: true });
            } catch (e) {
                setMenuPos((p) => ({ ...p, visible: false }));
            }
        };
        editor.on('selectionUpdate', updateMenu);
        updateMenu();
        return () => editor.off('selectionUpdate', updateMenu);
    }, [editor]);

    const handleAiAssist = async (action) => {
        if (!editor) return;
        const { from, to, empty } = editor.state.selection;
        if (empty || from === to) {
            showToast('Please select some text first.', 'info');
            return;
        }

        const text = editor.state.doc.textBetween(from, to, ' ');
        if (!text || !text.trim()) {
            showToast('Please select some text first.', 'info');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await axios.post(route('scriptwriter.assist'), { selected_text: text, action });
            const suggestion = res.data.suggestion;
            if (!suggestion) {
                showToast('No suggestion returned', 'error');
                return;
            }

            if (action === 'rewrite_dialogue') {
                editor.chain().focus().deleteSelection().insertContent(suggestion).run();
            } else if (action === 'describe_scene' || action === 'suggest_next') {
                const { to } = editor.state.selection;
                editor.chain().focus().setTextSelection(to).insertContent('\n\n' + suggestion).run();
            } else {
                editor.chain().focus().insertContent(suggestion).run();
            }

            // schedule save immediately after applying
            scheduleAutoSave();
            showToast('Suggestion applied', 'success');
        } catch (err) {
            console.error(err);
            showToast('AI request failed', 'error');
        } finally {
            setIsProcessing(false);
            setMenuPos((p) => ({ ...p, visible: false }));
        }
    };

    // initial load: if scripts were passed, pick first
    useEffect(() => {
        if (!initialScripts || initialScripts.length === 0) return;
        // pick first script if none selected
        if (!selectedScript) loadScript(initialScripts[0]);
    }, []);

    // auto-hide the pro tip after 5s when shown
    useEffect(() => {
        if (showHint) {
            if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
            hintTimerRef.current = setTimeout(() => setShowHint(false), 5000);
        }
        return () => {
            if (hintTimerRef.current) {
                clearTimeout(hintTimerRef.current);
                hintTimerRef.current = null;
            }
        };
    }, [showHint]);

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Scriptwriter</h2>}>
            <Head title="Scriptwriter" />

            <div className="py-6 relative">
                {/* Toast */}
                {toast.visible && (
                    <div className={`absolute top-4 right-6 z-50 px-4 py-2 rounded shadow-lg ${toast.type === 'success' ? 'bg-amber-400 text-black' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
                        {toast.message}
                    </div>
                )}

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex h-[76vh]">
                        {/* Sidebar - 25% */}
                        <aside className="w-1/4 min-w-[18rem] border-r border-white/10 p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-md thin-scrollbar">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-amber-100 font-semibold">Scripts</div>
                                <button onClick={createScript} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-md text-sm shadow-md">+ New Script</button>
                            </div>

                            <div className="space-y-2">
                                {scripts.length === 0 && (
                                    <div className="text-sm text-slate-400">No scripts yet. Click <span className="font-medium text-amber-200">New Script</span> to begin.</div>
                                )}

                                {scripts.map((s) => {
                                    const active = selectedScript && selectedScript.id === s.id;
                                    return (
                                        <div key={s.id || Math.random()} className={`group flex items-center justify-between gap-3 p-3 rounded cursor-pointer ${active ? 'bg-white/5 border-l-4 border-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                            <div className="flex-1 min-w-0" onClick={() => loadScript(s)}>
                                                {editingId === s.id ? (
                                                    <input
                                                        ref={titleInputRef}
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onBlur={() => submitTitleEdit(s)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') submitTitleEdit(s); }}
                                                        className="w-full bg-transparent border-b border-white/10 text-white px-1 py-0.5 rounded text-sm"
                                                    />
                                                ) : (
                                                        <div className="font-medium text-sm truncate">{s.title || 'Untitled'}</div>
                                                )}
                                                <div className="text-xs text-amber-200/80 truncate">{s.updated_at ? new Date(s.updated_at).toLocaleString() : ''}</div>
                                            </div>

                                            <div className="ml-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-150">
                                                <button onClick={() => startEditing(s)} title="Edit" className="p-1 rounded-md text-amber-200 hover:text-white hover:bg-white/5 transition-colors duration-150">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12v3h3l8.293-8.293-3-3L5 12z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => confirmDelete(s)} title="Delete" className="p-1 rounded-md text-red-400 hover:text-red-200 hover:bg-white/5 transition-colors duration-150">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Main area - 75% */}
                        <div className="w-3/4 flex-1 flex flex-col bg-slate-950">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {selectedScript ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                value={selectedScript.title || ''}
                                                onChange={(e) => setSelectedScript(prev => ({ ...prev, title: e.target.value }))}
                                                onBlur={() => selectedScript && axios.put(route('scriptwriter.update', selectedScript.id), { title: selectedScript.title }).then(() => showToast('Title saved', 'success')).catch(() => showToast('Failed to save title', 'error'))}
                                                className="bg-transparent text-2xl font-semibold text-white w-96"
                                            />
                                            <div className="text-sm text-amber-200/80">{isSaving ? 'Saving…' : 'Saved'}</div>
                                        </div>
                                    ) : (
                                        <div className="text-lg text-slate-300">Welcome to Scriptwriter</div>
                                    )}
                                </div>
                                <div>
                                    <button onClick={() => { if (selectedScript) scheduleAutoSave(); }} className="px-3 py-1 text-sm bg-white/5 rounded-md text-amber-100">Save Now</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 thin-scrollbar">
                                {selectedScript ? (
                                    <div className="bg-white text-black font-mono p-8 shadow-lg max-w-4xl mx-auto min-h-[60vh] w-full relative">
                                        <EditorContent editor={editor} />

                                        {editor && (
                                            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                                                <div className="bg-slate-800 border border-white/10 shadow-xl rounded-lg flex overflow-hidden text-white">
                                                    {isProcessing ? (
                                                        <div className="px-4 py-2 text-sm">Spark is thinking...</div>
                                                    ) : (
                                                        <>
                                                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleAiAssist('rewrite_dialogue')} disabled={isProcessing} className={`px-3 py-2 hover:bg-amber-600 transition-colors text-sm font-medium flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12v3h3l8.293-8.293-3-3L5 12z" />
                                                                </svg>
                                                                <span>Rewrite</span>
                                                            </button>
                                                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleAiAssist('describe_scene')} disabled={isProcessing} className={`px-3 py-2 hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                                    <path d="M2.166 5.5A2 2 0 014.166 4h11.668a2 2 0 012 1.5L18 14.5A2 2 0 0116 16H4a2 2 0 01-1.834-1.5L2.166 5.5zM7 8a3 3 0 100 6 3 3 0 000-6z" />
                                                                </svg>
                                                                <span>Describe</span>
                                                            </button>
                                                            <button onMouseDown={(e) => e.preventDefault()} onClick={() => handleAiAssist('suggest_next')} disabled={isProcessing} className={`px-3 py-2 hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11V6a1 1 0 10-2 0v3H6a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                                                </svg>
                                                                <span>Suggest Next</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </BubbleMenu>
                                        )}
                                    </div>
                                ) : (
                                    <div className="max-w-4xl mx-auto bg-white/5 p-8 rounded shadow-lg text-slate-200">
                                        <h3 className="text-2xl font-semibold mb-2">Welcome to Scriptwriter</h3>
                                        <p className="mb-4">Use the AI tools to rewrite, describe, or suggest next lines for your screenplay. Click <span className="font-medium text-amber-200">New Script</span> to create a script and begin writing.</p>
                                        <ul className="list-disc pl-6 text-sm text-slate-300 space-y-2">
                                            <li>Highlight text in the editor to open the AI Magic Menu.</li>
                                            <li>Use the gold <span className="font-semibold">New Script</span> button to create and save work.</li>
                                            <li>Auto-save keeps your drafts safe while you write.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Floating Lightbulb Pro Tip (left side) */}
                            <div className="absolute left-6 bottom-6 z-40 flex items-end">
                                {/* Lightbulb trigger on left */}
                                <button
                                    onClick={() => {
                                        if (showHint) {
                                            setShowHint(false);
                                            if (hintTimerRef.current) { clearTimeout(hintTimerRef.current); hintTimerRef.current = null; }
                                        } else {
                                            setShowHint(true);
                                        }
                                    }}
                                    title="Pro Tip"
                                    className={`rounded-full p-3 flex items-center justify-center text-amber-500 shadow-md ${showHint ? 'animate-pulse' : ''}`}
                                    style={{ boxShadow: '0 0 20px rgba(245,158,11,0.45)' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                        <path d="M11 3a1 1 0 10-2 0v1.07a4 4 0 00-2.5 3.65A4 4 0 009 12v1a1 1 0 001 1h0a1 1 0 001-1v-1a4 4 0 00-.5-4.28A4 4 0 0011 4.07V3z" />
                                        <path d="M6 15a2 2 0 104 0H6z" />
                                    </svg>
                                </button>

                                {/* Speech bubble to the right of bulb */}
                                {showHint && (
                                    <div className="ml-3 bg-slate-800/90 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs">
                                        💡 Pro Tip: Highlight any text to open the AI Magic Menu (Rewrite, Describe, Suggest).
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
