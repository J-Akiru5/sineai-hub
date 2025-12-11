import React, { useState, useRef } from 'react';
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
            },
            onError: () => {
                // keep editing state
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
        } catch (err) {
            console.error('Failed to load conversation', err);
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
            if (response.data && response.data.conversation) {
                const serverConv = response.data.conversation;
                setConversations(prev => [serverConv, ...prev.filter(c => c.id !== serverConv.id)]);
                setActiveConversationId(serverConv.id);
                setActiveConversation((serverConv.messages || []).map(m => ({ sender: m.sender, text: m.body })));
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

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Scriptwriter</h2>}>
            <Head title="Scriptwriter" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex h-[70vh]">
                        {/* Sidebar */}
                        <aside className="w-80 border-r border-white/10 p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-amber-100 font-semibold">Conversations</div>
                                <button onClick={newChat} className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-md text-sm">+ New Chat</button>
                            </div>

                            <div className="space-y-2">
                                {conversations.map((c) => {
                                    const active = c.id === activeConversationId;
                                    return (
                                        <div key={c.id || Math.random()} className={`group flex items-center justify-between p-3 rounded cursor-pointer ${active ? 'bg-white/5 border-l-4 border-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                            <div className="flex-1 min-w-0" onClick={() => selectConversation(c)}>
                                                {editingId === c.id ? (
                                                    <input
                                                        ref={editInputRef}
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        onBlur={() => submitEdit(c)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(c); }}
                                                        className="w-full bg-transparent border-b border-white/10 text-white px-1 py-0.5 rounded"
                                                    />
                                                ) : (
                                                    <div className="font-medium text-sm truncate">{c.title || (c.messages && c.messages[0] ? (c.messages[0].body || '').slice(0, 40) : 'Untitled')}</div>
                                                )}
                                                <div className="text-xs text-amber-200/80 truncate">{c.messages && c.messages[0] ? (c.messages[0].body || '').slice(0, 80) : ''}</div>
                                            </div>

                                            <div className="ml-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform">
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

                        {/* Main chat area */}
                        <div className="flex-1 flex flex-col bg-slate-950">
                            <div className="flex-1 flex flex-col overflow-hidden p-6">
                                {(!activeConversation || activeConversation.length === 0) ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                        <img src="/images/spark-head.png" alt="Spark" className="h-36 w-36 object-contain mb-6 drop-shadow-[0_0_30px_rgba(245,158,11,0.45)]" />
                                        <h2 className="text-2xl font-bold text-amber-400 mb-2">Hello, Creator!</h2>
                                        <p className="text-slate-400 max-w-md">I am Spark, your AI production assistant. Ask me to brainstorm ideas, write scripts, or create character bios.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        {activeConversation.map((msg, index) => (
                                            <MessageBubble key={index} sender={msg.sender} text={msg.text} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10">
                                <form onSubmit={handleSubmit} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Ask Spark for script ideas, a shot list, or a movie title..."
                                        className="flex-1 bg-slate-800/30 border border-white/6 text-amber-100 placeholder-amber-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                        disabled={isLoading}
                                    />
                                    <button type="submit" className="bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 px-4 py-2 rounded-md font-semibold" disabled={isLoading}>
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
