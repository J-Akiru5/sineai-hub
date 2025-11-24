// resources/js/Pages/Assistant/Index.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios'; // We'll use axios for clean API calls

// A reusable component for displaying a single chat bubble
const MessageBubble = ({ sender, text }) => {
    const isUser = sender === 'user';
    const bubbleClasses = isUser
        ? 'bg-blue-500 text-white self-end'
        : 'bg-gray-200 text-gray-800 self-start';
    
    // Replace newline characters with <br> tags for proper formatting
    const formattedText = (text || '').split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br />
        </React.Fragment>
    ));

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-4 my-2 rounded-lg shadow ${bubbleClasses}`}>
                {formattedText}
            </div>
        </div>
    );
};

export default function Index({ auth, conversations: initialConversations = [] }) {
    // Conversations list (sidebar)
    const [conversations, setConversations] = useState(initialConversations || []);
    // Active conversation messages shown in the main pane
    const [activeConversation, setActiveConversation] = useState(() => {
        const first = (initialConversations && initialConversations[0]) || null;
        return first ? (first.messages || []).map(m => ({ sender: m.sender, text: m.body })) : [];
    });
    const [activeConversationId, setActiveConversationId] = useState(() => (initialConversations && initialConversations[0] ? initialConversations[0].id : null));
    // State to hold the user's current input
    const [prompt, setPrompt] = useState('');
    // State to manage the loading indicator
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Spark AI Assistant</h2>}
        >
            <Head title="Spark Assistant" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg flex h-[70vh]">
                        {/* Sidebar */}
                        <div className="w-80 border-r dark:border-gray-700 p-4 overflow-y-auto">
                            <button onClick={() => { setActiveConversation([]); setActiveConversationId(null); }} className="w-full mb-3 bg-blue-500 text-white py-2 rounded">+ New Conversation</button>
                            <div className="space-y-2">
                                {conversations.map((c) => (
                                    <div key={c.id || Math.random()} className={`p-3 rounded cursor-pointer ${c.id === activeConversationId ? 'bg-gray-100 dark:bg-gray-900' : ''}`} onClick={() => selectConversation(c)}>
                                        <div className="font-medium text-sm">{c.title || (c.messages && c.messages[0] ? (c.messages[0].body || '').slice(0, 40) : 'Untitled')}</div>
                                        <div className="text-xs text-gray-500">{c.messages && c.messages[0] ? (c.messages[0].body || '').slice(0, 80) : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main chat area */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1 p-6 overflow-y-auto flex flex-col">
                                {activeConversation.map((msg, index) => (
                                    <MessageBubble key={index} sender={msg.sender} text={msg.text} />
                                ))}
                                {isLoading && (
                                    <div className="self-start p-4 my-2 rounded-lg shadow bg-gray-200 text-gray-800">
                                        Spark is thinking...
                                    </div>
                                )}
                            </div>

                            {/* Input Form Area */}
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSubmit} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Ask Spark for script ideas, a shot list, or a movie title..."
                                        className="input flex-1 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-md shadow-sm"
                                        disabled={isLoading}
                                    />
                                    <button type="submit" className="btn btn-primary bg-red-500 text-white p-2 rounded-md" disabled={isLoading}>
                                        Send
                                    </button>
                                                                        <button
                                                                                type="button"
                                                                                onClick={handleGenerateMoodboard}
                                                                                className="btn mb-2"
                                                                        >
                                                                                ✨ Generate Mood Board Ideas
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