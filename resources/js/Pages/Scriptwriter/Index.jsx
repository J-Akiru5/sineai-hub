import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const MessageBubble = ({ sender, text }) => {
    const isUser = sender === 'user';
    const bubbleClasses = isUser
        ? 'ml-auto max-w-[78%] px-4 py-3 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl rounded-tr-none shadow-lg'
        : 'mr-auto max-w-[78%] px-4 py-3 bg-slate-800 text-slate-200 rounded-xl rounded-tl-none';

    return (
        <div className="w-full flex">
            <div className={bubbleClasses}>
                <div className="prose prose-invert text-sm">
                    <ReactMarkdown>{text || ''}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default function ScriptwriterIndex({ auth, conversations: initialConversations = [] }) {
    const [conversations, setConversations] = useState(initialConversations || []);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeConversation, setActiveConversation] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const editInputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const messageEndRef = useRef(null);

    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    const showToast = (message, type = 'info', ms = 3000) => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), ms);
    };

    const startEditing = (conv) => {
        setEditingId(conv.id);
        setEditingTitle(conv.title || '');
        setTimeout(() => editInputRef.current && editInputRef.current.focus(), 50);
    };

    const submitEdit = (conv) => {
        if (!conv || !conv.id) return;
        const newTitle = (editingTitle || '').trim();
        if (!newTitle) { setEditingId(null); return; }
        router.put(route('ai.conversations.update', conv.id), { title: newTitle }, {
            onSuccess: (page) => {
                setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, title: newTitle } : c));
                setEditingId(null);
                showToast('Conversation renamed', 'success');
            },
            onError: (err) => {
                showToast('Failed to rename conversation', 'error');
            }
        });
    };

    const confirmDelete = (conv) => {
        if (!conv || !conv.id) return;
        if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
        router.delete(route('ai.conversations.destroy', conv.id), {
            onSuccess: () => {
                setConversations(prev => prev.filter(c => c.id !== conv.id));
                if (activeConversationId === conv.id) {
                    setActiveConversationId(null);
                    setActiveConversation([]);
                }
                showToast('Conversation deleted', 'success');
            },
            onError: () => {
                showToast('Failed to delete conversation', 'error');
            }
        });
    };

    const selectConversation = async (conv) => {
        if (!conv || !conv.id) {
            setActiveConversation([]);
            setActiveConversationId(null);
            return;
        }
        try {
            const res = await axios.get(route('ai.conversations.show', conv.id));
            const msgs = (res.data.messages || []).map(m => ({ sender: m.sender, text: m.body }));
            setActiveConversation(msgs);
            setActiveConversationId(res.data.conversation.id);
            // scroll after render
            setTimeout(() => scrollToBottom(), 80);
        } catch (err) {
            console.error('Failed to load conversation', err);
            showToast('Failed to load conversation', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        const promptToSend = prompt?.trim();
        if (!promptToSend) return;
        setIsLoading(true);
        try {
            const response = await axios.post(route('ai.chat'), { prompt: promptToSend, conversation_id: activeConversationId });
            const aiReply = response.data.reply;
            setActiveConversation(prev => [...prev, { sender: 'user', text: promptToSend }, { sender: 'ai', text: aiReply }]);
            setPrompt('');
            setTimeout(() => scrollToBottom(), 40);
            if (response.data && response.data.conversation) {
                const serverConv = response.data.conversation;
                setConversations(prev => [serverConv, ...prev.filter(c => c.id !== serverConv.id)]);
                setActiveConversationId(serverConv.id);
                setActiveConversation((serverConv.messages || []).map(m => ({ sender: m.sender, text: m.body })));
                setTimeout(() => scrollToBottom(), 80);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const newChat = () => {
        setActiveConversation([]);
        setActiveConversationId(null);
    };

    // TipTap editor setup
    const editor = useEditor({
        extensions: [StarterKit],
        content: '<p>INT. COFFEE SHOP - DAY</p>\n<p>Two strangers sit across from each other. Steam rises from their cups.</p>',
    });

    useEffect(() => {
        return () => {
            if (editor) editor.destroy();
        };
    }, [editor]);

    useEffect(() => {
        // whenever activeConversation changes, ensure scroll to bottom
        scrollToBottom();
    }, [activeConversationId, activeConversation]);

    const scrollToBottom = () => {
        try {
            const el = messagesContainerRef.current;
            if (el) {
                el.scrollTop = el.scrollHeight;
            }
        } catch (e) {
            // ignore
        }
    };

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
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex h-[70vh]">
                        {/* Sidebar - 25% */}
                        <aside className="w-1/4 min-w-[18rem] border-r border-white/10 p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-md thin-scrollbar">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-amber-100 font-semibold">Conversations</div>
                                <button onClick={newChat} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-md text-sm shadow-md">+ New Chat</button>
                            </div>

                            <div className="space-y-2">
                                {conversations.map((c) => {
                                    const active = c.id === activeConversationId;
                                    return (
                                        <div key={c.id || Math.random()} className={`group flex items-center justify-between gap-3 p-3 rounded cursor-pointer ${active ? 'bg-white/5 border-l-4 border-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                            <div className="flex-1 min-w-0" onClick={() => selectConversation(c)}>
                                                {editingId === c.id ? (
                                                    <input
                                                        ref={editInputRef}
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onBlur={() => submitEdit(c)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(c); }}
                                                        className="w-full bg-transparent border-b border-white/10 text-white px-1 py-0.5 rounded text-sm"
                                                    />
                                                ) : (
                                                    <div className="font-medium text-sm truncate">{c.title || (c.messages && c.messages[0] ? (c.messages[0].body || '').slice(0, 40) : 'Untitled')}</div>
                                                )}
                                                <div className="text-xs text-amber-200/80 truncate">{c.messages && c.messages[0] ? (c.messages[0].body || '').slice(0, 80) : ''}</div>
                                            </div>

                                            <div className="ml-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-150">
                                                <button onClick={() => startEditing(c)} title="Edit" className="p-1 rounded-md text-amber-200 hover:text-white hover:bg-white/5 transition-colors duration-150">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12v3h3l8.293-8.293-3-3L5 12z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => confirmDelete(c)} title="Delete" className="p-1 rounded-md text-red-400 hover:text-red-200 hover:bg-white/5 transition-colors duration-150">
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

                        {/* Main chat area - 75% */}
                        <div className="w-3/4 flex-1 flex flex-col bg-slate-950">
                            <div className="flex-1 flex flex-col overflow-y-auto p-6 thin-scrollbar">
                                <div className="w-full flex-1 flex items-start justify-center py-8">
                                    <div className="bg-white text-black font-mono p-8 shadow-lg max-w-4xl mx-auto min-h-[80vh] w-full">
                                        {editor ? (
                                            <EditorContent editor={editor} />
                                        ) : (
                                            <div className="text-sm text-slate-600">Loading editor…</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
