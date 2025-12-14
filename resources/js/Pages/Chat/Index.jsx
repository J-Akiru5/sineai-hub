import React, { useEffect, useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserAvatar from '@/Components/UserAvatar';
import { Head, useForm } from '@inertiajs/react';
import supabase from '@/supabase';
import { router } from '@inertiajs/react';

// Accept initial messages and users from the server (messages prop is aliased to initialMessages)
export default function ChatIndex({ auth, channels = [], messages: initialMessages = [], users: initialUsers = {}, defaultChannelId = null }) {
    const [channelList, setChannelList] = useState(channels);
    const [activeChannel, setActiveChannel] = useState(defaultChannelId);
    const [showSidebar, setShowSidebar] = useState(true);

    // messages/users kept in state so realtime updates can modify them
    const [messages, setMessages] = useState(initialMessages || []);
    const [users, setUsers] = useState(initialUsers || {});

    const { data, setData, post, processing, reset } = useForm({ channel_id: activeChannel, body: '' });
    const subscriptionRef = useRef(null);
    const messagesEndRef = useRef(null);

    // keep the form channel_id in sync
    useEffect(() => {
        setData('channel_id', activeChannel);
    }, [activeChannel]);

    // When activeChannel changes, load the historic messages for that channel
    const loadChannelMessages = async (channelId) => {
        if (!channelId) {
            setMessages([]);
            return;
        }

        try {
            const res = await fetch(route('chat.show', channelId));
            if (!res.ok) throw new Error('Failed to load messages');
            const json = await res.json();
            const loaded = json.messages || [];

            // build users map from loaded messages
            const usersMap = {};
            loaded.forEach((m) => {
                if (m.user) usersMap[m.user.id] = m.user;
            });

            setUsers((prev) => ({ ...prev, ...usersMap }));
            setMessages(loaded);

            // update URL so refresh will preserve the selected channel
            const url = new URL(window.location.href);
            url.searchParams.set('channel', channelId);
            window.history.replaceState({}, '', url.toString());

        } catch (e) {
            console.error('Failed to load channel messages', e);
        }
    };

    // update channel list when prop changes
    useEffect(() => {
        setChannelList(channels);
    }, [channels]);

    // hide sidebar on mobile when a channel is pre-selected
    useEffect(() => {
        if (defaultChannelId) {
            setShowSidebar(false);
        }
    }, [defaultChannelId]);

    // Subscribe to message inserts and attach full user objects from our users state
    useEffect(() => {
        // cleanup previous subscription
        if (subscriptionRef.current) {
            try { supabase.removeChannel(subscriptionRef.current); } catch (e) { }
            subscriptionRef.current = null;
        }

        const channelSubscription = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMessage = payload.new;

                // only add messages for the active channel
                if (String(newMessage.channel_id) !== String(activeChannel)) return;

                // look up the full user object using the user_id
                const userObj = users?.[newMessage.user_id] ?? null;
                // prefer to leave user null so the UI can decide (and show auth user name for self)
                newMessage.user = userObj ?? null;

                setMessages((prev) => [...prev, newMessage]);
            })
            .subscribe();

        subscriptionRef.current = channelSubscription;

        return () => {
            if (subscriptionRef.current) {
                try { supabase.removeChannel(subscriptionRef.current); } catch (e) { }
                subscriptionRef.current = null;
            }
        };
    }, [users, activeChannel]);

    // Auto-scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const submit = (e) => {
        if (e) e.preventDefault();

        // Simple POST; do not add optimistic/pending messages.
        post(route('chat.messages'), {
            onSuccess: () => {
                // Clear input; the authoritative message will arrive via realtime and be appended.
                reset('body');
            },
            onError: () => {
                // Keep the input as-is so the user can retry.
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Chat</h2>}>
            <Head title="Chat" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex h-[70vh]">
                        {/* Sidebar */}
                        <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-72 min-w-[18rem] border-r border-white/10 p-4 overflow-y-auto bg-slate-900/80 backdrop-blur-md`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-amber-100 font-semibold">Channels</div>
                            </div>
                            <div className="space-y-2">
                                {channelList.map((c) => (
                                    <div key={c.id} className={`group p-2 rounded cursor-pointer ${c.id === activeChannel ? 'bg-white/5 border-l-4 border-amber-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <button className="w-full text-left" onClick={async () => { setActiveChannel(c.id); await loadChannelMessages(c.id); setShowSidebar(false); }}>
                                            <div className="font-medium text-sm truncate">{c.name}</div>
                                            <div className="text-xs text-amber-200/80 truncate">{c.description ?? ''}</div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </aside>

                        {/* Main chat area */}
                        <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 flex-col`}> 
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-6" id="messages-container">
                                    <div className="mb-4 flex items-center gap-3">
                                        <button onClick={() => { setActiveChannel(null); setShowSidebar(true); }} className="block md:hidden p-2 rounded-md text-amber-200 hover:bg-white/5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <div>
                                            <h2 className="text-lg font-semibold text-amber-100">{channelList.find(c => c.id === activeChannel)?.name ?? 'Channel'}</h2>
                                            <div className="text-xs text-amber-200">{channelList.find(c => c.id === activeChannel)?.description ?? ''}</div>
                                        </div>
                                    </div>

                                    {messages.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-amber-200/70">No messages yet in this channel.</div>
                                    ) : (
                                            <div className={`flex flex-col ${messages.length <= 1 ? 'justify-center' : ''} space-y-3`}>
                                                {messages.map((m, i) => {
                                                    const isMe = String(m.user?.id ?? m.user_id) === String(auth.user?.id);
                                                    const displayName = isMe ? auth.user?.name : (m.user?.name ?? 'Unknown');
                                                    return (
                                                        <div key={m.id ?? i} className={`w-full flex items-start ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            {!isMe && (
                                                                <div className="mr-3">
                                                                    <UserAvatar user={m.user} />
                                                                </div>
                                                            )}

                                                            <div className={`${isMe ? 'ml-auto' : 'mr-auto'} max-w-[78%] px-4 py-2 rounded-xl ${isMe ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                                                                <div className="text-xs font-semibold mb-1 text-amber-100">{displayName}</div>
                                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</div>
                                                                <div className="text-[11px] text-amber-200 mt-2 text-right">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</div>
                                                            </div>

                                                            {isMe && (
                                                                <div className="ml-3">
                                                                    <UserAvatar user={auth.user} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-4 border-t border-white/10">
                                <form onSubmit={submit} className="flex items-end gap-3">
                                    <input type="hidden" name="channel_id" value={activeChannel} />
                                    <textarea
                                        rows={1}
                                        name="body"
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (!processing && data.body?.trim()) submit();
                                            }
                                        }}
                                        className="flex-1 resize-none rounded-xl bg-slate-800/30 text-amber-100 placeholder-amber-300 p-3 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                                        placeholder="Write a message..."
                                    />
                                    <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold shadow">
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
