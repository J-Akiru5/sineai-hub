// resources/js/Pages/Assistant/Index.jsx

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios'; // We'll use axios for clean API calls

// A reusable component for displaying a single chat bubble
const MessageBubble = ({ sender, text }) => {
    const isUser = sender === 'user';
    const bubbleClasses = isUser
        ? 'ml-auto max-w-2xl px-4 py-3 bg-slate-700 text-white rounded-lg rounded-tr-none shadow-sm'
        : 'mr-auto max-w-2xl px-4 py-3 bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-lg rounded-tl-none shadow-lg';

    return (
        <div className="flex w-full">
            <div className={bubbleClasses}>
                <div className="prose prose-invert text-sm">
                    <ReactMarkdown>{text || ''}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default function Index({ auth, conversations: initialConversations = [] }) {
    // Conversations list (sidebar)
    const [conversations, setConversations] = useState(initialConversations || []);
    // Active conversation messages shown in the main pane — always start a new chat on landing
    const [activeConversation, setActiveConversation] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    // State to hold the user's current input
    const [prompt, setPrompt] = useState('');
    // State to manage the loading indicator
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const messagesContainerRef = useRef(null);
    const messageEndRef = useRef(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const editInputRef = useRef(null);

    useEffect(() => {
        // auto-scroll when messages change
        try {
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        } catch (e) { }
    }, [activeConversationId, activeConversation]);

    const startEditing = (conv) => {
        setEditingId(conv.id);
        setEditingTitle(conv.title || '');
        setTimeout(() => editInputRef.current && editInputRef.current.focus(), 50);
    };

    const submitEdit = async (conv) => {
        if (!conv || !conv.id) return;
        const newTitle = (editingTitle || '').trim();
        if (!newTitle) { setEditingId(null); return; }
        try {
            await axios.put(route('ai.conversations.update', conv.id), { title: newTitle });
            setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, title: newTitle } : c));
            setEditingId(null);
        } catch (err) {
            console.error('Failed to rename conversation', err);
            // keep editing state for user to retry
        }
    };

    const confirmDelete = async (conv) => {
        if (!conv || !conv.id) return;
        if (!window.confirm('Delete this conversation? This cannot be undone.')) return;
        try {
            await axios.delete(route('ai.conversations.destroy', conv.id));
            setConversations(prev => prev.filter(c => c.id !== conv.id));
            if (activeConversationId === conv.id) {
                setActiveConversation([]);
                setActiveConversationId(null);
            }
        } catch (err) {
            console.error('Failed to delete conversation', err);
        }
    };
    // input state

    // handleSubmit supports being called with either an event (form submit)
    // or a prompt string (programmatic invoke). When passed a string we use
    // that as the prompt to send; otherwise we read from the `prompt` state.
    const handleSubmit = async (eOrPrompt) => {
        let promptToSend;
        if (typeof eOrPrompt === 'string') {
            promptToSend = eOrPrompt;
        } else {
            eOrPrompt?.preventDefault?.();
            promptToSend = prompt;
        }

        if (!promptToSend || !promptToSend.trim()) return; // Don't send empty messages

        // 1. Optimistic UI update: Add user's message immediately to active conversation
        const userMessage = { sender: 'user', text: promptToSend };
        setActiveConversation(prev => [...prev, userMessage]);
        // Clear the input field when user submitted manually; if programmatic we still
        // clear to keep input tidy.
        setPrompt('');
        setIsLoading(true);

        try {
            // 2. Make the API call to our Laravel backend and include the conversation id if present
            const response = await axios.post(route('ai.chat'), { prompt: promptToSend, conversation_id: activeConversationId });

            // 3. Add the AI's response to the conversation
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setActiveConversation(prev => [...prev, aiMessage]);

            // If backend returned a full conversation object (newly created), use it as authoritative
            if (response.data && response.data.conversation) {
                const serverConv = response.data.conversation;
                // normalize messages if needed and insert the server conversation at the top
                setConversations(prev => [serverConv, ...prev.filter(c => c.id !== serverConv.id)]);
                setActiveConversationId(serverConv.id);
                setActiveConversation((serverConv.messages || []).map(m => ({ sender: m.sender, text: m.body })));
            } else if (response.data && response.data.conversation_id) {
                // backward-compatible fallback: update by id
                if (!activeConversationId) {
                    const newConv = {
                        id: response.data.conversation_id,
                        title: response.data.title || 'Untitled',
                        messages: [
                            { sender: 'user', body: promptToSend },
                            { sender: 'ai', body: response.data.reply }
                        ]
                    };
                    setConversations(prev => [newConv, ...prev]);
                    setActiveConversationId(response.data.conversation_id);
                    setActiveConversation(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
                } else {
                    setConversations(prev => prev.map(c => c.id === response.data.conversation_id ? { ...c, messages: [...c.messages, { sender: 'ai', body: response.data.reply }] } : c));
                }
            }

        } catch (error) {
            console.error("Error communicating with the AI assistant:", error);
            const errorMessage = { sender: 'ai', text: 'Sorry, I am having trouble connecting right now. Please try again later.' };
            setActiveConversation(prev => [...prev, errorMessage]);
        } finally {
            // 4. Hide the loading indicator
            setIsLoading(false);
        }
    };

    // Create a new, very specific moodboard prompt using the last AI message and
    // invoke the existing submission flow.
    const handleGenerateMoodboard = async () => {
        const lastAiMessage = activeConversation.slice().reverse().find(m => m.sender === 'ai');
        if (!lastAiMessage) return;
        const newPrompt = `Based on the following film concept, generate a detailed list of visual keywords and stylistic prompts suitable for an AI image generator like Midjourney. Focus on camera angles, lighting, color palette, and overall mood. Concept: "${lastAiMessage.text}"`;
        // Call the existing submit logic with the generated prompt so we reuse optimistic UI, network, and response handling.
        await handleSubmit(newPrompt);
    };

    const selectConversation = async (conv) => {
        // If conversation has an id, fetch full history from backend
        if (!conv || !conv.id) {
            setActiveConversation([]);
            setActiveConversationId(null);
            return;
        }

        setIsFetching(true);
        try {
            const res = await axios.get(route('ai.conversations.show', conv.id));
            const msgs = (res.data.messages || []).map(m => ({ sender: m.sender, text: m.body }));
            setActiveConversation(msgs);
            setActiveConversationId(res.data.conversation.id);

            // update title in the sidebar list if changed
            setConversations(prev => prev.map(c => c.id === res.data.conversation.id ? { ...c, title: res.data.conversation.title || c.title, messages: c.messages } : c));
        } catch (err) {
            console.error('Failed to load conversation', err);
            // optionally show a user-visible error
        } finally {
            setIsFetching(false);
        }
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Spark AI Assistant</h2>}
        >
            <Head title="Spark Assistant" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex h-[70vh]">
                        {/* Sidebar */}
                        <div className="w-72 min-w-[18rem] border-r border-white/10 p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-md thin-scrollbar">
                            <div className="mb-3 flex gap-2">
                                <button onClick={() => { setActiveConversation([]); setActiveConversationId(null); }} className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 rounded font-semibold text-sm">+ New Chat</button>
                                <Link href={route('scriptwriter.index')} className="px-3 py-2 rounded bg-amber-600/90 text-white hover:bg-amber-600/100 text-sm">Scriptwriter</Link>
                            </div>
                            <div className="space-y-2">
                                {conversations.map((c) => (
                                    <div key={c.id || Math.random()} className={`group flex items-center justify-between gap-3 p-3 rounded cursor-pointer ${c.id === activeConversationId ? 'bg-white/5 border-l-4 border-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`} onClick={() => selectConversation(c)}>
                                        <div className="flex-1 min-w-0">
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
                                            <button onClick={(e) => { e.stopPropagation(); startEditing(c); }} title="Edit" className="p-1 rounded-md text-amber-200 hover:text-white hover:bg-white/5 transition-colors duration-150">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 12v3h3l8.293-8.293-3-3L5 12z" />
                                                </svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); confirmDelete(c); }} title="Delete" className="p-1 rounded-md text-red-400 hover:text-red-200 hover:bg-white/5 transition-colors duration-150">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm2 6a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main chat area */}
                        <div className="flex-1 flex flex-col bg-slate-950">
                            <div ref={messagesContainerRef} className="flex-1 p-6 overflow-y-auto flex flex-col thin-scrollbar">
                                {activeConversation.length === 0 ? (
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
                                        <div ref={messageEndRef} />
                                    </div>
                                )}
                                {isLoading && (
                                    <div className="self-start p-4 my-2 rounded-lg shadow bg-slate-800/40 text-amber-100">
                                        Spark is thinking...
                                    </div>
                                )}
                            </div>

                            {/* Input Form Area */}
                            <div className="p-6 border-t border-white/10 bg-transparent">
                                <form onSubmit={handleSubmit} className="flex gap-4 items-center">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Ask Spark for script ideas, a shot list, or a movie title..."
                                        className="flex-1 bg-slate-800/20 border border-white/6 text-amber-100 placeholder-amber-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                        disabled={isLoading}
                                    />
                                    <button type="submit" className="ml-2 bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 px-4 py-2 rounded-md font-semibold" disabled={isLoading}>
                                        Send
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGenerateMoodboard}
                                        className="ml-2 px-3 py-2 bg-slate-800/30 text-amber-200 rounded-md"
                                    >
                                        ✨
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