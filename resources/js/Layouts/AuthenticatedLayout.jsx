import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { auth } = usePage().props;
    const currentUser = user ?? auth?.user ?? {};

    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                try {
                    if (!payload || !payload.new) return;
                    if (payload.new.user_id && auth?.user && payload.new.user_id === auth.user.id) return;
                    setUnreadCount((p) => p + 1);
                    setToastMessage('New message received!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                } catch (e) {
                    // ignore
                }
            })
            .subscribe();

        return () => {
            try { supabase.removeChannel(channel); } catch (e) { }
        };
    }, [auth]);

    return (
        <div className="min-h-screen bg-slate-950 relative">

            {/* Fixed Background Layer (kept) */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <div className="absolute inset-0 bg-[url('images/Auth-bg.png')] bg-center bg-cover" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-white/6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center h-16 justify-between">
                            {/* Logo (left) */}
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center gap-3">
                                    <ApplicationLogo className="h-8 w-auto text-amber-500" />
                                    <span className="hidden sm:inline text-white font-semibold">SineAI Hub</span>
                                </Link>
                            </div>

                            {/* Desktop Links (center) */}
                            <div className="hidden md:flex items-center justify-center flex-1">
                                <div className="flex gap-6 text-slate-300">
                                    <Link href={route('dashboard')} className={route().current('dashboard') ? 'text-amber-500 font-semibold' : 'hover:text-white'}>Dashboard</Link>
                                    <Link href={route('projects.index')} className={route().current('projects.*') ? 'text-amber-500 font-semibold' : 'hover:text-white'}>Projects</Link>
                                    <Link href={route('chat')} className={route().current('chat') ? 'text-amber-500 font-semibold' : 'hover:text-white'}>Chat</Link>
                                    <Link href={route('ai.assistant')} className={route().current('ai.assistant') ? 'text-amber-500 font-semibold' : 'hover:text-white'}>Spark</Link>
                                    <Link href={route('scriptwriter.index')} className={route().current('scriptwriter.index') ? 'text-amber-500 font-semibold' : 'hover:text-white'}>Scriptwriter</Link>
                                    {((currentUser?.roles || []).some(r => r.name === 'admin' || r.name === 'super-admin')) && (
                                        <Link href={route('admin.dashboard')} className={route().current('admin.*') ? 'text-amber-500 font-semibold' : 'hover:text-white'}>Admin Panel</Link>
                                    )}
                                </div>
                            </div>

                            {/* User Dropdown (right) */}
                            <div className="flex items-center gap-4">
                                <div className="hidden md:block text-slate-300 text-sm">{unreadCount > 0 && <span className="inline-block mr-2 text-amber-500">●</span>}{currentUser?.name ?? 'Guest'}</div>

                                <div className="hidden md:block">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button className="text-slate-300 hover:text-amber-500 inline-flex items-center gap-2">
                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a3 3 0 100 6 3 3 0 000-6z" /><path fillRule="evenodd" d="M2 13.5A5.5 5.5 0 0110 8a5.5 5.5 0 018 5.5v.5H2v-.5z" clipRule="evenodd" /></svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content contentClasses={'py-1 bg-slate-900 text-white border border-white/10'} align="right">
                                            <Dropdown.Link href={route('profile.edit')} className={'text-white'}>Profile</Dropdown.Link>
                                            <Dropdown.Link href={route('logout')} method="post" as="button" className={'text-white'}>Log Out</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                {/* Mobile Hamburger */}
                                <div className="md:hidden">
                                    <button onClick={() => setShowingNavigationDropdown((s) => !s)} className="p-2 rounded-md text-slate-300 hover:bg-white/5 block md:hidden">
                                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                            <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                            <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Slide-down Menu */}
                {showingNavigationDropdown && (
                    <div className="md:hidden bg-slate-900/95 border-b border-white/6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
                            <Link href={route('dashboard')} className="block text-slate-300">Dashboard</Link>
                            <Link href={route('projects.index')} className="block text-slate-300">Projects</Link>
                            <Link href={route('chat')} className="block text-slate-300">Chat</Link>
                            <Link href={route('ai.assistant')} className="block text-slate-300">Spark</Link>
                            <Link href={route('scriptwriter.index')} className="block text-slate-300">Scriptwriter</Link>
                            {((currentUser?.roles || []).some(r => r.name === 'admin' || r.name === 'super-admin')) && (
                                <Link href={route('admin.dashboard')} className="block text-slate-300">Admin Panel</Link>
                            )}
                            <div className="pt-2 border-t border-white/6">
                                <Link href={route('profile.edit')} className="block text-slate-300">Profile</Link>
                                <Link href={route('logout')} method="post" as="button" className="block text-slate-300">Log Out</Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast notification (bottom-right) */}
                {showToast && (
                    <div className="fixed bottom-4 right-4 z-50 bg-slate-800 border-l-4 border-amber-500 text-white px-4 py-3 rounded shadow-2xl">
                        <div className="text-sm">{toastMessage || 'New message received!'}</div>
                    </div>
                )}

                {/* Page Header (optional) */}
                {header && (
                    <header className="bg-transparent pt-6">
                        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                {/* Main Content - full width, pages implement their own sidebars when needed */}
                <main className="pt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
