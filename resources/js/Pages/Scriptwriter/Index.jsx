import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import debounce from 'lodash/debounce';

export default function Scriptwriter({ auth, scripts: initialScripts = [] }) {
    // State
    const [scripts, setScripts] = useState(initialScripts);
    const [activeScript, setActiveScript] = useState(scripts.length > 0 ? scripts[0] : null);
    const [isSaving, setIsSaving] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0, show: false });
    const [showHint, setShowHint] = useState(true);

    // Initialize Editor
    // helper to safely parse script content which may be stored as JSON or plain text
    const safeParse = (content) => {
        if (!content) return '<p></p>';
        if (typeof content === 'object') return content; // already parsed
        try {
            return JSON.parse(content);
        } catch (e) {
            return content; // plain string/HTML
        }
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: activeScript ? safeParse(activeScript.content) : '<p>INT. SCENE HEADING - DAY</p><p>Action lines go here...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-300px)]',
            },
        },
        onUpdate: ({ editor }) => {
            handleAutoSave(editor.getJSON());
        },
        onSelectionUpdate: ({ editor }) => {
            const { empty, from, to } = editor.state.selection;
            if (empty || from === to) {
                setMenuPos({ ...menuPos, show: false });
                return;
            }

            // Calculate position for the "Magic Menu"
            const view = editor.view;
            const { top, left, right } = view.coordsAtPos(from);
            // Center the menu above the selection
            setMenuPos({
                top: top - 50, // 50px above cursor
                left: left,
                show: true
            });
        }
    });

    // Create New Script
    const createNewScript = async () => {
        try {
            const res = await axios.post(route('scriptwriter.store'));
            const newScript = res.data.script;
            setScripts([newScript, ...scripts]);
            setActiveScript(newScript);
        } catch (error) {
            console.error(error);
        }
    };

    // Auto-Save Logic (Debounced)
    const handleAutoSave = debounce((content) => {
        if (!activeScript) return;
        setIsSaving(true);
        axios.put(route('scriptwriter.update', activeScript.id), {
            content: content,
            title: activeScript.title
        }).then(() => {
            setIsSaving(false);
        }).catch(err => console.error("Save failed", err));
    }, 2000);

    // AI Assist Handler
    const handleAiAssist = async (action) => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');

        setMenuPos(prev => ({ ...prev, show: false })); // Hide menu while processing

        try {
            // Insert placeholder
            editor.chain().focus().insertContent(` [Spark is thinking...] `).run();

            const response = await axios.post(route('scriptwriter.assist'), {
                selected_text: text,
                action: action
            });

            // Undo placeholder and insert real content
            editor.commands.undo();

            if (action === 'rewrite_dialogue') {
                editor.chain().focus().deleteSelection().insertContent(response.data.suggestion).run();
            } else {
                editor.chain().focus().insertContentAfter(`\n\n${response.data.suggestion}`).run();
            }
        } catch (error) {
            alert("Spark encountered an error. Please try again.");
            editor.commands.undo();
        }
    };

    // Hint Timer
    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 8000);
        return () => clearTimeout(timer);
    }, []);

    // Update editor when activeScript changes, but avoid unnecessary updates
    useEffect(() => {
        if (editor && activeScript) {
            const newContent = safeParse(activeScript.content);

            try {
                const current = editor.getJSON();
                if (JSON.stringify(current) !== JSON.stringify(newContent)) {
                    editor.commands.setContent(newContent);
                }
            } catch (err) {
                // If getJSON fails (editor empty or content is string), just set content
                editor.commands.setContent(newContent);
            }
        }
    }, [activeScript, editor]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Scriptwriter Studio</h2>}
        >
            <Head title="Scriptwriter" />

            {/* Standard Page Container (Matches Spark/Dashboard) */}
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                {/* The "App Box" - Assistant-style Contained */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex flex-col md:flex-row h-[70vh]">

                    {/* Sidebar - Scripts List */}
                    <div className="w-full md:w-64 bg-slate-900 border-r border-white/10 flex-shrink-0 flex flex-col z-20">
                        <div className="p-4 border-b border-white/10">
                            <button
                                onClick={createNewScript}
                                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold rounded hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg"
                            >
                                + New Script
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">Your Scripts</h3>
                            {scripts.map(script => (
                                <div
                                    key={script.id}
                                    onClick={() => setActiveScript(script)}
                                    className={`p-3 rounded cursor-pointer transition-colors ${activeScript?.id === script.id
                                        ? 'bg-white/10 text-amber-100 border-l-4 border-amber-500'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <div className="font-medium truncate">{script.title || 'Untitled Script'}</div>
                                    <div className="text-xs opacity-50">{new Date(script.created_at).toLocaleDateString()}</div>
                                </div>
                            ))}
                            {scripts.length === 0 && (
                                <div className="text-center text-slate-600 text-sm py-4">No scripts yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">

                        {/* Top Bar: Title & Status */}
                        <div className="h-14 border-b border-white/10 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 flex-shrink-0">
                            <input 
                                value={activeScript?.title || ''}
                                onChange={(e) => setActiveScript({ ...activeScript, title: e.target.value })}
                                onBlur={() => handleAutoSave(editor.getJSON())} // Save title on blur
                                className="bg-transparent border-none text-xl font-bold text-white focus:ring-0 placeholder-slate-600 w-full"
                                placeholder="Untitled Script"
                            />
                            <div className="text-xs font-mono text-amber-500 animate-pulse">
                                {isSaving ? 'Saving...' : 'Saved'}
                            </div>
                        </div>

                        {/* Editor Scroll Container */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-12 relative cursor-text" onClick={() => editor?.commands.focus()}>
                            <div className="max-w-4xl mx-auto bg-white text-black min-h-[1000px] shadow-2xl rounded-sm p-8 md:p-16 relative">
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* The Manual "Magic Menu" (Floating) */}
                        {menuPos.show && (
                            <div
                                className="fixed z-50 flex gap-1 bg-slate-800 border border-amber-500/30 rounded-lg shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-100"
                                style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                            >
                                <button onClick={() => handleAiAssist('rewrite_dialogue')} className="px-3 py-1.5 hover:bg-amber-600 text-white text-xs font-medium rounded flex items-center gap-2 transition-colors">
                                    ✨ Rewrite
                                </button>
                                <button onClick={() => handleAiAssist('describe_scene')} className="px-3 py-1.5 hover:bg-blue-600 text-white text-xs font-medium rounded flex items-center gap-2 transition-colors">
                                    👁 Describe
                                </button>
                                <button onClick={() => handleAiAssist('suggest_next')} className="px-3 py-1.5 hover:bg-emerald-600 text-white text-xs font-medium rounded flex items-center gap-2 transition-colors">
                                    ➡️ Next
                                </button>
                            </div>
                        )}

                        {/* Pro Tip Bubble */}
                        <div className="absolute bottom-6 left-6 z-40 group">
                            <div className="w-12 h-12 bg-slate-800 border border-amber-500/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowHint(true)}>
                                <span className="text-2xl">💡</span>
                            </div>
                            {showHint && (
                                <div className="absolute left-14 bottom-0 w-64 bg-slate-800 text-slate-200 text-sm p-3 rounded-lg border border-white/10 shadow-xl mb-2">
                                    <p><strong>Pro Tip:</strong> Highlight any text in your script to summon Spark for rewrites or scene descriptions!</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
