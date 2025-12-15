import React, { useEffect, useState, useRef, Fragment, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import UserAvatar from '@/Components/UserAvatar';
import UserBadge, { UserBadgeCompact } from '@/Components/UserBadge';
import { Head, useForm, router } from '@inertiajs/react';
import supabase from '@/supabase';
import { Transition, Popover } from '@headlessui/react';

// MessageBubble component for rendering different message types
function MessageBubble({ message, isMe, displayName, user, authUser }) {
    const messageType = message.message_type || 'text';
    const attachmentData = message.attachment_data;

    // Announcement styling
    if (messageType === 'announcement') {
        return (
            <div className="w-full px-4 py-3 rounded-xl border-2 border-amber-500 bg-amber-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 text-lg">📢</span>
                    <span className="text-xs font-bold uppercase tracking-wide text-amber-400">Announcement</span>
                </div>
                <div className="flex items-start gap-3">
                    <UserAvatar user={isMe ? authUser : user} size={8} />
                    <div className="flex-1">
                        <div className="text-xs font-semibold text-amber-300">{displayName}</div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed font-bold text-amber-100 mt-1">{message.body}</div>
                        <div className="text-[11px] text-amber-400/70 mt-2">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Script attachment styling
    if (messageType === 'script' && attachmentData) {
        return (
            <div className={`w-full flex items-start ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                    <div className="mr-3">
                        <UserAvatar user={user} />
                    </div>
                )}
                <div className={`${isMe ? 'ml-auto' : 'mr-auto'} max-w-[78%]`}>
                    <div className={`px-4 py-2 rounded-xl ${isMe ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                        <div className="text-xs font-semibold mb-1 text-amber-100">{displayName}</div>
                        {message.body && <div className="whitespace-pre-wrap text-sm leading-relaxed mb-2">{message.body}</div>}
                    </div>
                    {/* Script Card */}
                    <div className="mt-2 bg-slate-800/80 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📄</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-purple-200 truncate">{attachmentData.title || 'Untitled Script'}</div>
                                <div className="text-xs text-purple-400">Script</div>
                            </div>
                            <button
                                onClick={() => router.visit(route('scriptwriter.show', attachmentData.id))}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                Open in Studio
                            </button>
                        </div>
                    </div>
                    <div className="text-[11px] text-amber-200/70 mt-1 text-right">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</div>
                </div>
                {isMe && (
                    <div className="ml-3">
                        <UserAvatar user={authUser} />
                    </div>
                )}
            </div>
        );
    }

    // Project attachment styling
    if (messageType === 'project' && attachmentData) {
        return (
            <div className={`w-full flex items-start ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                    <div className="mr-3">
                        <UserAvatar user={user} />
                    </div>
                )}
                <div className={`${isMe ? 'ml-auto' : 'mr-auto'} max-w-[78%]`}>
                    <div className={`px-4 py-2 rounded-xl ${isMe ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                        <div className="text-xs font-semibold mb-1 text-amber-100">{displayName}</div>
                        {message.body && <div className="whitespace-pre-wrap text-sm leading-relaxed mb-2">{message.body}</div>}
                    </div>
                    {/* Project Card */}
                    <div className="mt-2 bg-slate-800/80 border border-amber-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                            {attachmentData.thumbnail_url ? (
                                <img src={attachmentData.thumbnail_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🎬</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-amber-200 truncate">{attachmentData.title || 'Untitled Project'}</div>
                                <div className="text-xs text-amber-400">Project</div>
                            </div>
                            <button
                                onClick={() => router.visit(route('projects.show', attachmentData.id))}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                View Project
                            </button>
                        </div>
                    </div>
                    <div className="text-[11px] text-amber-200/70 mt-1 text-right">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</div>
                </div>
                {isMe && (
                    <div className="ml-3">
                        <UserAvatar user={authUser} />
                    </div>
                )}
            </div>
        );
    }

    // Default text message
    return (
        <div className={`w-full flex items-start ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && (
                <div className="mr-3">
                    <UserAvatar user={user} />
                </div>
            )}
            <div className={`${isMe ? 'ml-auto' : 'mr-auto'} max-w-[78%] px-4 py-2 rounded-xl ${isMe ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                <div className="text-xs font-semibold mb-1 text-amber-100">{displayName}</div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</div>
                <div className="text-[11px] text-amber-200 mt-2 text-right">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</div>
            </div>
            {isMe && (
                <div className="ml-3">
                    <UserAvatar user={authUser} />
                </div>
            )}
        </div>
    );
}

// Accept initial messages and users from the server (messages prop is aliased to initialMessages)
export default function ChatIndex({ auth, channels = [], messages: initialMessages = [], users: initialUsers = {}, defaultChannelId = null, canAnnounce = false }) {
    const [channelList, setChannelList] = useState(channels);
    const [activeChannel, setActiveChannel] = useState(defaultChannelId);
    const [showSidebar, setShowSidebar] = useState(true);

    // messages/users kept in state so realtime updates can modify them
    const [messages, setMessages] = useState(initialMessages || []);
    const [users, setUsers] = useState(initialUsers || {});
    
    // Online presence tracking
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    
    // Announcement mode toggle
    const [isAnnouncementMode, setIsAnnouncementMode] = useState(false);
    
    // Smart attachments state
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [userScripts, setUserScripts] = useState([]);
    const [userProjects, setUserProjects] = useState([]);
    const [showScriptPicker, setShowScriptPicker] = useState(false);
    const [showProjectPicker, setShowProjectPicker] = useState(false);
    const [selectedScript, setSelectedScript] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    const { data, setData, post, processing, reset } = useForm({ 
        channel_id: activeChannel, 
        body: '',
        message_type: 'text',
        attachment_data: null
    });
    const subscriptionRef = useRef(null);
    const presenceRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Group channels by category (memoized)
    const groupedChannels = useMemo(() => {
        return channelList.reduce((acc, channel) => {
            const category = channel.category || 'General';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(channel);
            return acc;
        }, {});
    }, [channelList]);

    // Define category order for display
    const categoryOrder = ['General', 'Production', 'Officer Deck'];
    const sortedCategories = useMemo(() => {
        return Object.keys(groupedChannels).sort((a, b) => {
            const indexA = categoryOrder.indexOf(a);
            const indexB = categoryOrder.indexOf(b);
            if (indexA === -1 && indexB === -1) return a.localeCompare(b);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [groupedChannels]);

    // Memoize online users list for performance
    const displayedOnlineUsers = useMemo(() => {
        return Object.values(users).filter(u => onlineUsers.has(u?.id)).slice(0, 10);
    }, [users, onlineUsers]);

    // keep the form channel_id in sync
    useEffect(() => {
        setData('channel_id', activeChannel);
    }, [activeChannel]);

    // Update message_type when announcement mode changes
    useEffect(() => {
        setData('message_type', isAnnouncementMode ? 'announcement' : 'text');
    }, [isAnnouncementMode]);

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

    // Fetch user's scripts
    const fetchUserScripts = async () => {
        try {
            const res = await fetch(route('chat.user.scripts'));
            if (res.ok) {
                const json = await res.json();
                setUserScripts(json.scripts || []);
            }
        } catch (e) {
            console.error('Failed to load scripts', e);
        }
    };

    // Fetch user's projects
    const fetchUserProjects = async () => {
        try {
            const res = await fetch(route('chat.user.projects'));
            if (res.ok) {
                const json = await res.json();
                setUserProjects(json.projects || []);
            }
        } catch (e) {
            console.error('Failed to load projects', e);
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

    // Subscribe to message inserts and presence
    useEffect(() => {
        // cleanup previous subscriptions
        if (subscriptionRef.current) {
            try { supabase.removeChannel(subscriptionRef.current); } catch (e) { }
            subscriptionRef.current = null;
        }
        if (presenceRef.current) {
            try { supabase.removeChannel(presenceRef.current); } catch (e) { }
            presenceRef.current = null;
        }

        // Message subscription
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

        // Presence subscription for online status
        const presenceChannel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: String(auth.user?.id),
                },
            },
        });

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                const online = new Set(Object.keys(state).map(k => parseInt(k)));
                setOnlineUsers(online);
            })
            .on('presence', { event: 'join' }, ({ key }) => {
                setOnlineUsers(prev => new Set([...prev, parseInt(key)]));
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(parseInt(key));
                    return next;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED' && auth.user?.id) {
                    await presenceChannel.track({
                        user_id: auth.user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        presenceRef.current = presenceChannel;

        return () => {
            if (subscriptionRef.current) {
                try { supabase.removeChannel(subscriptionRef.current); } catch (e) { }
                subscriptionRef.current = null;
            }
            if (presenceRef.current) {
                try { supabase.removeChannel(presenceRef.current); } catch (e) { }
                presenceRef.current = null;
            }
        };
    }, [users, activeChannel, auth.user?.id]);

    // Auto-scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const submit = (e) => {
        if (e) e.preventDefault();

        // Determine message type and attachment data
        let messageType = isAnnouncementMode ? 'announcement' : 'text';
        let attachmentData = null;

        if (selectedScript) {
            messageType = 'script';
            attachmentData = {
                type: 'script',
                id: selectedScript.id,
                title: selectedScript.title
            };
        } else if (selectedProject) {
            messageType = 'project';
            attachmentData = {
                type: 'project',
                id: selectedProject.id,
                title: selectedProject.title,
                thumbnail_url: selectedProject.thumbnail_url
            };
        }

        // Update form data before submission
        setData({
            channel_id: activeChannel,
            body: data.body,
            message_type: messageType,
            attachment_data: attachmentData
        });

        // Simple POST; do not add optimistic/pending messages.
        post(route('chat.messages'), {
            onSuccess: () => {
                // Clear input; the authoritative message will arrive via realtime and be appended.
                reset('body');
                setData('message_type', 'text');
                setData('attachment_data', null);
                setSelectedScript(null);
                setSelectedProject(null);
                setIsAnnouncementMode(false);
            },
            onError: () => {
                // Keep the input as-is so the user can retry.
            }
        });
    };

    const handleSelectScript = (script) => {
        setSelectedScript(script);
        setSelectedProject(null);
        setShowScriptPicker(false);
        setShowAttachmentMenu(false);
    };

    const handleSelectProject = (project) => {
        setSelectedProject(project);
        setSelectedScript(null);
        setShowProjectPicker(false);
        setShowAttachmentMenu(false);
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Community Hub</h2>}>
            <Head title="Community Hub" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 overflow-hidden shadow-sm sm:rounded-lg flex h-[70vh]">
                        {/* Discord-style Sidebar */}
                        <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-72 min-w-[18rem] border-r border-white/10 overflow-y-auto bg-slate-900/80 backdrop-blur-md`}>
                            {/* Server Header */}
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🎬</span>
                                    <span className="text-amber-100 font-bold text-lg">SineAI Community</span>
                                </div>
                            </div>

                            {/* Channel Categories */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {sortedCategories.map((category) => (
                                    <div key={category} className="mb-4">
                                        {/* Category Header */}
                                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            <span>{category}</span>
                                            {category === 'Officer Deck' && (
                                                <span className="ml-1 text-amber-500">🔒</span>
                                            )}
                                        </div>
                                        
                                        {/* Channels in Category */}
                                        <div className="space-y-0.5">
                                            {groupedChannels[category].map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={async () => {
                                                        setActiveChannel(c.id);
                                                        await loadChannelMessages(c.id);
                                                        setShowSidebar(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                                                        c.id === activeChannel
                                                            ? 'bg-white/10 text-white'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <span className="text-slate-500">#</span>
                                                    <span className="truncate text-sm">{c.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Online Users Section */}
                            <div className="border-t border-white/10 p-3">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Online — {onlineUsers.size}
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {displayedOnlineUsers.map((u) => (
                                        <div key={u.id} className="flex items-center gap-2 px-1 py-0.5">
                                            <div className="relative">
                                                <UserAvatar user={u} size={6} />
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                            </div>
                                            <span className="text-sm text-slate-300 truncate flex-1">{u.name}</span>
                                            <UserBadgeCompact user={u} />
                                        </div>
                                    ))}
                                    {onlineUsers.size === 0 && (
                                        <div className="text-xs text-slate-500 italic">No users online</div>
                                    )}
                                </div>
                            </div>

                            {/* Current User Footer */}
                            <div className="border-t border-white/10 p-3 bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <UserAvatar user={auth.user} size={8} />
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                                            {auth.user?.name}
                                            <UserBadgeCompact user={auth.user} />
                                        </div>
                                        <div className="text-xs text-green-400">Online</div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main chat area */}
                        <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 flex-col`}> 
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Channel Header */}
                                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                                    <button onClick={() => { setActiveChannel(null); setShowSidebar(true); }} className="block md:hidden p-2 rounded-md text-amber-200 hover:bg-white/5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                            <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <span className="text-slate-500 text-xl">#</span>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{channelList.find(c => c.id === activeChannel)?.name ?? 'Channel'}</h2>
                                        {channelList.find(c => c.id === activeChannel)?.description && (
                                            <div className="text-xs text-slate-400">{channelList.find(c => c.id === activeChannel)?.description}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4" id="messages-container">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="text-4xl mb-2">💬</span>
                                            <div>No messages yet in this channel.</div>
                                            <div className="text-sm">Be the first to say something!</div>
                                        </div>
                                    ) : (
                                        <div className={`flex flex-col space-y-3`}>
                                            {messages.map((m, i) => {
                                                const isMe = String(m.user?.id ?? m.user_id) === String(auth.user?.id);
                                                const displayName = isMe ? auth.user?.name : (m.user?.name ?? 'Unknown');
                                                return (
                                                    <MessageBubble
                                                        key={m.id ?? i}
                                                        message={m}
                                                        isMe={isMe}
                                                        displayName={displayName}
                                                        user={m.user}
                                                        authUser={auth.user}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/10">
                                {/* Selected Attachment Preview */}
                                {(selectedScript || selectedProject) && (
                                    <div className="mb-2 flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                                        {selectedScript && (
                                            <>
                                                <span className="text-purple-400">📄</span>
                                                <span className="text-sm text-purple-200">{selectedScript.title}</span>
                                            </>
                                        )}
                                        {selectedProject && (
                                            <>
                                                <span className="text-amber-400">🎬</span>
                                                <span className="text-sm text-amber-200">{selectedProject.title}</span>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedScript(null);
                                                setSelectedProject(null);
                                            }}
                                            className="ml-auto text-slate-400 hover:text-white"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* Announcement Mode Banner */}
                                {isAnnouncementMode && (
                                    <div className="mb-2 flex items-center gap-2 bg-amber-900/30 border border-amber-500/30 rounded-lg px-3 py-2">
                                        <span className="text-amber-400">📢</span>
                                        <span className="text-sm text-amber-200 font-medium">Announcement Mode</span>
                                        <span className="text-xs text-amber-400/70">This message will be highlighted for everyone</span>
                                        <button
                                            onClick={() => setIsAnnouncementMode(false)}
                                            className="ml-auto text-amber-400 hover:text-amber-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                <form onSubmit={submit} className="flex items-end gap-2">
                                    {/* Attachment Button */}
                                    <Popover className="relative">
                                        <Popover.Button
                                            onClick={() => {
                                                fetchUserScripts();
                                                fetchUserProjects();
                                            }}
                                            className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </Popover.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-200"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-150"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 translate-y-1"
                                        >
                                            <Popover.Panel className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-50">
                                                {/* Share Script */}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowScriptPicker(true)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700/50 rounded-t-lg transition-colors"
                                                >
                                                    <span className="text-lg">📄</span>
                                                    <span>Share Script</span>
                                                </button>
                                                
                                                {/* Share Project */}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowProjectPicker(true)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <span className="text-lg">🎬</span>
                                                    <span>Share Project</span>
                                                </button>
                                                
                                                {/* Upload File (placeholder) */}
                                                <button
                                                    type="button"
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-400 cursor-not-allowed rounded-b-lg"
                                                    disabled
                                                >
                                                    <span className="text-lg">📎</span>
                                                    <span>Upload File</span>
                                                    <span className="ml-auto text-xs text-slate-500">Coming soon</span>
                                                </button>
                                            </Popover.Panel>
                                        </Transition>
                                    </Popover>

                                    {/* Text Input */}
                                    <textarea
                                        rows={1}
                                        name="body"
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (!processing && (data.body?.trim() || selectedScript || selectedProject)) submit();
                                            }
                                        }}
                                        className={`flex-1 resize-none rounded-xl bg-slate-800/30 text-amber-100 placeholder-amber-300/50 p-3 focus:outline-none focus:ring-2 ${
                                            isAnnouncementMode ? 'focus:ring-amber-500/50 border border-amber-500/30' : 'focus:ring-amber-400/30'
                                        }`}
                                        placeholder={isAnnouncementMode ? "Write an announcement..." : "Message #" + (channelList.find(c => c.id === activeChannel)?.name ?? 'channel')}
                                    />

                                    {/* Announcement Toggle (Officers/Admins only) */}
                                    {canAnnounce && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAnnouncementMode(!isAnnouncementMode)}
                                            className={`p-3 rounded-xl transition-colors ${
                                                isAnnouncementMode
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-slate-800/50 text-slate-400 hover:text-amber-400 hover:bg-slate-700/50'
                                            }`}
                                            title="Toggle Announcement Mode"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Send Button */}
                                    <button
                                        type="submit"
                                        disabled={processing || (!data.body?.trim() && !selectedScript && !selectedProject)}
                                        className="inline-flex items-center px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Script Picker Modal */}
            <Transition show={showScriptPicker} as={Fragment}>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/60" onClick={() => setShowScriptPicker(false)} />
                        </Transition.Child>

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="relative bg-slate-800 border border-white/10 rounded-xl shadow-xl max-w-md w-full p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>📄</span>
                                    Select a Script to Share
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {userScripts.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <div className="mb-2">No scripts found</div>
                                            <button
                                                onClick={() => router.visit(route('scriptwriter.index'))}
                                                className="text-amber-400 hover:text-amber-300 text-sm"
                                            >
                                                Create your first script →
                                            </button>
                                        </div>
                                    ) : (
                                        userScripts.map((script) => (
                                            <button
                                                key={script.id}
                                                onClick={() => handleSelectScript(script)}
                                                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                                            >
                                                <span className="text-purple-400 text-xl">📄</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-white truncate">{script.title || 'Untitled Script'}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {script.updated_at ? new Date(script.updated_at).toLocaleDateString() : ''}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowScriptPicker(false)}
                                    className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Transition>

            {/* Project Picker Modal */}
            <Transition show={showProjectPicker} as={Fragment}>
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/60" onClick={() => setShowProjectPicker(false)} />
                        </Transition.Child>

                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="relative bg-slate-800 border border-white/10 rounded-xl shadow-xl max-w-md w-full p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <span>🎬</span>
                                    Select a Project to Share
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {userProjects.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            <div className="mb-2">No projects found</div>
                                            <button
                                                onClick={() => router.visit(route('projects.create'))}
                                                className="text-amber-400 hover:text-amber-300 text-sm"
                                            >
                                                Upload your first project →
                                            </button>
                                        </div>
                                    ) : (
                                        userProjects.map((project) => (
                                            <button
                                                key={project.id}
                                                onClick={() => handleSelectProject(project)}
                                                className="w-full flex items-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-left"
                                            >
                                                {project.thumbnail_url ? (
                                                    <img src={project.thumbnail_url} alt="" className="w-12 h-9 rounded object-cover" />
                                                ) : (
                                                    <div className="w-12 h-9 bg-amber-600/20 rounded flex items-center justify-center">
                                                        <span className="text-amber-400">🎬</span>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-white truncate">{project.title || 'Untitled Project'}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : ''}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowProjectPicker(false)}
                                    className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Transition>
        </AuthenticatedLayout>
    );
}
