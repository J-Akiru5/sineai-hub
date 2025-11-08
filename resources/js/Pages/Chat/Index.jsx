import React, { useEffect, useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import supabase from '@/supabase';

// Accept initial messages and users from the server (messages prop is aliased to initialMessages)
export default function ChatIndex({ auth, channels = [], messages: initialMessages = [], users: initialUsers = {}, defaultChannelId = null }) {
    const [channelList, setChannelList] = useState(channels);
    const [activeChannel, setActiveChannel] = useState(defaultChannelId);

    // messages/users kept in state so realtime updates can modify them
    const [messages, setMessages] = useState(initialMessages || []);
    const [users, setUsers] = useState(initialUsers || {});

    const { data, setData, post, processing, reset } = useForm({ channel_id: activeChannel, body: '' });
    const subscriptionRef = useRef(null);

    // keep the form channel_id in sync
    useEffect(() => {
        setData('channel_id', activeChannel);
    }, [activeChannel]);

    // update channel list when prop changes
    useEffect(() => {
        setChannelList(channels);
    }, [channels]);

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
                newMessage.user = userObj ?? { name: 'User' };

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
        <AuthenticatedLayout auth={auth} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Chat</h2>}>
            <Head title="Chat" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-4 gap-6">
                    <aside className="col-span-1 bg-white p-4 rounded shadow">
                        <h3 className="font-semibold mb-3">Channels</h3>
                        <ul>
                            {channelList.map((c) => (
                                <li key={c.id}>
                                    <button
                                        className={`w-full text-left py-2 px-3 rounded ${c.id === activeChannel ? 'bg-sky-100' : 'hover:bg-slate-50'}`}
                                        onClick={() => {
                                                    setActiveChannel(c.id);
                                                    setMessages([]); // optionally clear while loading
                                                }}
                                    >
                                        {c.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <section className="col-span-3 bg-white p-4 rounded shadow flex flex-col" style={{ minHeight: '60vh' }}>
                        <div className="flex-1 overflow-auto mb-4">
                            {messages.length === 0 ? (
                                <div className="text-gray-500">No messages yet in this channel.</div>
                            ) : (
                                <div className="space-y-3">
                                    {messages.map((m, i) => (
                                        <div key={m.id ?? i} className="p-2 rounded bg-slate-50">
                                            <div className="text-sm text-slate-700 font-semibold">{m.user?.name ?? 'User'}</div>
                                            <div className="text-base text-slate-900">{m.body}</div>
                                            <div className="text-xs text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form onSubmit={submit} className="mt-2">
                            <input type="hidden" name="channel_id" value={activeChannel} />
                            <div className="flex">
                                <input
                                    type="text"
                                    name="body"
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (!processing && data.body?.trim()) submit();
                                        }
                                    }}
                                    className="flex-1 border rounded px-3 py-2 mr-2"
                                    placeholder="Write a message..."
                                />
                                <button type="submit" disabled={processing} className="bg-sky-500 text-white px-4 py-2 rounded">
                                    Send
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
