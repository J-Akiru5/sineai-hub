import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import { createPortal } from 'react-dom';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';

export default function Index({ auth }) {
    const [aiIsLoading, setAiIsLoading] = useState(false);

    // Create a detached DOM element for the floating menu. The extension will
    // append it to the editor's container when it becomes visible.
    const menuRef = React.useRef(null);
    if (typeof window !== 'undefined' && menuRef.current === null) {
        menuRef.current = document.createElement('div');
        menuRef.current.className = 'scriptwriter-floating-menu';
    }

    const editor = useEditor({
        extensions: [
            StarterKit,
            // configure the floating menu extension to use our detached element
            FloatingMenuExtension.configure({
                element: menuRef.current,
                // show when there is a non-empty selection
                shouldShow: ({ from, to }) => from !== to,
            }),
        ],
        content: `<h2>My Awesome Script</h2><p>Start writing your scene here. Select any text to get help from Spark!</p>`,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none p-4 min-h-[60vh]',
            },
        },
    });


    // Render the menu content into the detached element via a portal. The
    // extension will handle showing/hiding and appending the element into the
    // DOM when needed.
    const menuPortal = menuRef.current ? createPortal(
        <div className="flex bg-gray-800 text-white p-1 rounded-md shadow-lg border border-gray-700">
            {aiIsLoading ? (
                <span className="px-3 py-1">Spark is thinking...</span>
            ) : (
                <>
                    <button onClick={() => handleAiAction('rewrite')} className="px-3 py-1 hover:bg-gray-700 rounded-md">Rewrite</button>
                    <button onClick={() => handleAiAction('describe')} className="px-3 py-1 hover:bg-gray-700 rounded-md">Describe</button>
                    <button onClick={() => handleAiAction('continue')} className="px-3 py-1 hover:bg-gray-700 rounded-md">Continue</button>
                </>
            )}
        </div>,
        menuRef.current
    ) : null;

    // cleanup: remove the detached element on unmount
    React.useEffect(() => {
        return () => {
            if (menuRef.current && menuRef.current.parentNode) {
                menuRef.current.parentNode.removeChild(menuRef.current);
            }
            menuRef.current = null;
        };
    }, []);

    const handleAiAction = async (action) => {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);

        if (!selectedText) return;

        setAiIsLoading(true);
        try {
            const response = await axios.post(route('scriptwriter.assist'), {
                text: selectedText,
                action: action,
            });
            const suggestion = response.data.suggestion;
            editor.chain().focus().insertContentAt({ from, to }, suggestion).run();
        } catch (error) {
            console.error("Error with AI assistance:", error);
        } finally {
            setAiIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">AI Scriptwriter</h2>}
        >
            <Head title="Scriptwriter" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg relative">
                        {editor && (
                            <BubbleMenu
                                editor={editor}
                                tippyOptions={{ duration: 100 }}
                                shouldShow={({ state }) => {
                                    const { from, to } = state.selection;
                                    return from !== to;
                                }}
                                className="flex bg-gray-800 text-white p-1 rounded-md shadow-lg border border-gray-700"
                            >
                                {aiIsLoading ? (
                                    <span className="px-3 py-1">Spark is thinking...</span>
                                ) : (
                                    <>
                                        <button onClick={() => handleAiAction('rewrite')} className="px-3 py-1 hover:bg-gray-700 rounded-md">Rewrite</button>
                                        <button onClick={() => handleAiAction('describe')} className="px-3 py-1 hover:bg-gray-700 rounded-md">Describe</button>
                                        <button onClick={() => handleAiAction('continue')} className="px-3 py-1 hover:bg-gray-700 rounded-md">Continue</button>
                                    </>
                                )}
                            </BubbleMenu>
                        )}
                        {/* render the portal content for the floating menu */}
                        {menuPortal}
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}