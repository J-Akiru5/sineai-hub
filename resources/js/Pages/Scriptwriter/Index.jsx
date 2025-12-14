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
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[9in] font-mono',
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
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Scene Heading
                        </button>
                        <button 
                            aria-label="Insert action line"
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Action
                        </button>
                        <button 
                            aria-label="Insert character name"
                            className="px-4 py-1.5 text-white text-sm font-medium hover:bg-zinc-700 rounded-full transition-colors"
                        >
                            Character
                        </button>
                        <button 
                            aria-label="Insert dialogue"
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
                                onBlur={() => handleAutoSave(editor.getJSON())}
                                className="bg-transparent border-none text-xl font-bold text-zinc-900 focus:ring-0 placeholder-zinc-400 w-full font-sans"
                                placeholder="Untitled Script"
                            />
                            <div className="text-xs text-amber-600 ml-4 flex-shrink-0">
                                {isSaving ? 'Saving...' : '✓ Saved'}
                            </div>
                        </div>

                        {/* Editor Content */}
                        <EditorContent editor={editor} />
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
                                <span><strong>Pro Tip:</strong> Highlight any text in your script to summon Spark for rewrites or scene descriptions!</span>
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
                            <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Quick Actions</h4>
                            <button 
                                onClick={() => handleAiAssist('suggest_next')}
                                className="w-full p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-sm text-sm font-medium text-left"
                            >
                                ➡️ Continue Story
                            </button>
                            <button 
                                onClick={() => handleAiAssist('describe_scene')}
                                className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-400 hover:to-blue-500 transition-all shadow-sm text-sm font-medium text-left"
                            >
                                👁 Describe Scene
                            </button>
                            <button 
                                onClick={() => handleAiAssist('rewrite_dialogue')}
                                className="w-full p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-sm text-sm font-medium text-left"
                            >
                                ✨ Enhance Dialogue
                            </button>
                        </div>

                        <div className="pt-4 border-t border-zinc-200">
                            <h4 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-2">Tips</h4>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-zinc-700">
                                <p className="font-medium mb-1">💡 Selection Mode</p>
                                <p>Highlight any text to get contextual AI suggestions!</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
