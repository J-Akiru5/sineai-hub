import { useState, useEffect } from 'react';
import supabase from '@/supabase';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

// Lucide icons for better visual consistency
const HomeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const FolderIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const FilmIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>;
const SparklesIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const UsersIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ShieldIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const HardDriveIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>;
const VideoIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const ChevronDown = () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const UserCircle = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BellIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const XIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// NavLink component for consistent styling
const NavLink = ({ href, active, icon: Icon, children, className = '' }) => (
    <Link
        href={href}
        className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } ${className}`}
    >
        {Icon && <span className={`${active ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'} transition-colors`}><Icon /></span>}
        <span>{children}</span>
    </Link>
);

// Dropdown NavLink for mobile
const MobileNavLink = ({ href, icon: Icon, children, active }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-2 border-amber-500'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
    >
        {Icon && <span className={active ? 'text-amber-400' : 'text-slate-500'}><Icon /></span>}
        <span className="font-medium">{children}</span>
    </Link>
);

// Section Label for mobile menu
const MobileSectionLabel = ({ children }) => (
    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{children}</div>
);

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const props = usePage().props;
    const { auth } = props;
    const currentUser = user ?? auth?.user ?? {};

    const [unreadCount, setUnreadCount] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const isAdmin = (currentUser?.roles || []).some(r => r.name === 'admin' || r.name === 'super-admin');

    useEffect(() => {
        // Skip if Supabase is not configured (handled by shared supabase client)
        if (!supabase?.channel) return;

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

    useEffect(() => {
        if (props.flash && props.flash.success) {
            Swal.fire({
                icon: 'success',
                title: props.flash.success,
                background: '#0f172a',
                color: '#fef3c7',
                confirmButtonColor: '#f59e0b',
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    popup: 'border border-white/10 rounded-2xl',
                }
            });
        }
    }, [props.flash]);

    // Close mobile menu on route change
    useEffect(() => {
        setShowingNavigationDropdown(false);
    }, [props.url]);

    return (
        <div className="min-h-screen bg-slate-950 relative">

            {/* Fixed Background Layer with gradient mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('images/Auth-bg.png')] bg-center bg-cover opacity-15" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                {/* Gradient orbs for bento-style depth */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {/* Glassmorphism Navigation Bar */}
                <nav className="sticky top-0 z-40">
                    {/* Navbar glass container */}
                    <div className="mx-2 sm:mx-4 lg:mx-6 mt-2 sm:mt-3">
                        <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/20">
                            <div className="px-4 sm:px-6">
                                <div className="flex items-center h-14 sm:h-16 justify-between">
                                    {/* Logo (left) */}
                                    <div className="flex items-center">
                                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg group-hover:bg-amber-500/30 transition-all" />
                                                <ApplicationLogo className="relative h-7 sm:h-8 w-auto text-amber-500" />
                                            </div>
                                            <span className="hidden sm:inline text-white font-bold text-lg tracking-tight">
                                                Sine<span className="text-amber-500">AI</span>
                                            </span>
                                        </Link>
                                    </div>

                                    {/* Desktop Links (center) */}
                                    <div className="hidden lg:flex items-center justify-center flex-1">
                                        <div className="flex items-center gap-1 bg-slate-800/50 rounded-2xl p-1.5 border border-white/5">
                                            <NavLink href={route('dashboard')} active={route().current('dashboard')} icon={HomeIcon}>
                                                Dashboard
                                            </NavLink>
                                            <NavLink href={route('projects.index')} active={route().current('projects.index') || route().current('projects.show')} icon={FolderIcon}>
                                                Projects
                                            </NavLink>
                                            <NavLink href={route('premiere.index')} active={route().current('premiere.*')} icon={FilmIcon}>
                                                Premiere
                                            </NavLink>

                                            {/* Studio Dropdown */}
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    {({ open }) => (
                                                        <button className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${route().current('projects.my') || route().current('playlists.*') || route().current('studio.*')
                                                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                            }`}>
                                                            <span className={`${route().current('projects.my') || route().current('playlists.*') || route().current('studio.*') ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'} transition-colors`}><VideoIcon /></span>
                                                            <span>Studio</span>
                                                            <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><ChevronDown /></span>
                                                        </button>
                                                    )}
                                                </Dropdown.Trigger>
                                                <Dropdown.Content contentClasses={'py-2 bg-slate-900/95 backdrop-blur-xl text-white border border-white/10 rounded-xl shadow-2xl'} align="left">
                                                    <Dropdown.Link href={route('projects.my')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <FolderIcon /> My Projects
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('playlists.index')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <FilmIcon /> My Playlists
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('projects.create')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <span className="text-emerald-400">+</span> Upload Project
                                                    </Dropdown.Link>
                                                    <div className="border-t border-white/10 my-1" />
                                                    <Dropdown.Link href={route('studio.projects')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <VideoIcon /> Video Editor
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('storage.index')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <HardDriveIcon /> My Storage
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>

                                            {/* Community Chat */}
                                            <NavLink href={route('chat')} active={route().current('chat')} icon={UsersIcon}>
                                                Community
                                            </NavLink>

                                            {/* AI Tools Dropdown */}
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    {({ open }) => (
                                                        <button className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${route().current('ai.*') || route().current('scriptwriter.*')
                                                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                            }`}>
                                                            <span className={`${route().current('ai.*') || route().current('scriptwriter.*') ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'} transition-colors`}><SparklesIcon /></span>
                                                            <span>AI Tools</span>
                                                            <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><ChevronDown /></span>
                                                        </button>
                                                    )}
                                                </Dropdown.Trigger>
                                                <Dropdown.Content contentClasses={'py-2 bg-slate-900/95 backdrop-blur-xl text-white border border-white/10 rounded-xl shadow-2xl'} align="left">
                                                    <Dropdown.Link href={route('ai.assistant')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <SparklesIcon /> Spark Assistant
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('scriptwriter.index')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <span>📝</span> Scriptwriter
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>

                                            {isAdmin && (
                                                <NavLink href={route('admin.dashboard')} active={route().current('admin.*')} icon={ShieldIcon}>
                                                    Admin
                                                </NavLink>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Section (right) */}
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {/* Notification bell */}
                                        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all hidden sm:block">
                                            <BellIcon />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            )}
                                        </button>

                                        {/* User Dropdown - Desktop */}
                                        <div className="hidden lg:block">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl border border-white/5 hover:bg-slate-800/80 hover:border-amber-500/30 transition-all group">
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {(currentUser?.name || 'G')[0].toUpperCase()}
                                                        </div>
                                                        <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors max-w-[120px] truncate">
                                                            {currentUser?.name ?? 'Guest'}
                                                        </span>
                                                        <ChevronDown />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content contentClasses={'py-2 bg-slate-900/95 backdrop-blur-xl text-white border border-white/10 rounded-xl shadow-2xl min-w-[180px]'} align="right">
                                                    <div className="px-4 py-2 border-b border-white/10">
                                                        <div className="text-sm font-medium text-white">{currentUser?.name}</div>
                                                        <div className="text-xs text-slate-500">{currentUser?.email}</div>
                                                    </div>
                                                    <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <UserCircle /> Profile
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('storage.index')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/5">
                                                        <HardDriveIcon /> My Storage
                                                    </Dropdown.Link>
                                                    <div className="border-t border-white/10 my-1" />
                                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-400 w-full text-left">
                                                        <span>🚪</span> Log Out
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>

                                        {/* Mobile Hamburger */}
                                        <button
                                            onClick={() => setShowingNavigationDropdown((s) => !s)}
                                            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            {showingNavigationDropdown ? <XIcon /> : <MenuIcon />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Slide-down Menu - Full screen overlay */}
                <div className={`lg:hidden fixed inset-0 z-30 transition-all duration-300 ${showingNavigationDropdown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setShowingNavigationDropdown(false)}
                    />

                    {/* Menu Panel */}
                    <div className={`absolute top-20 left-2 right-2 sm:left-4 sm:right-4 max-h-[calc(100vh-100px)] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform transition-all duration-300 ${showingNavigationDropdown ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'}`}>
                        <div className="p-4 space-y-2">
                            {/* User info header */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-white/5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                    {(currentUser?.name || 'G')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{currentUser?.name ?? 'Guest'}</div>
                                    <div className="text-xs text-slate-500">{currentUser?.email}</div>
                                </div>
                                {unreadCount > 0 && (
                                    <div className="ml-auto flex items-center gap-1 text-amber-500">
                                        <BellIcon />
                                        <span className="text-xs">{unreadCount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Main Navigation */}
                            <MobileSectionLabel>Navigate</MobileSectionLabel>
                            <MobileNavLink href={route('dashboard')} icon={HomeIcon} active={route().current('dashboard')}>Dashboard</MobileNavLink>
                            <MobileNavLink href={route('projects.index')} icon={FolderIcon} active={route().current('projects.index') || route().current('projects.show')}>Projects</MobileNavLink>
                            <MobileNavLink href={route('premiere.index')} icon={FilmIcon} active={route().current('premiere.*')}>Premiere</MobileNavLink>

                            {/* Studio Section */}
                            <MobileSectionLabel>Studio</MobileSectionLabel>
                            <MobileNavLink href={route('projects.my')} icon={FolderIcon} active={route().current('projects.my')}>My Projects</MobileNavLink>
                            <MobileNavLink href={route('playlists.index')} icon={FilmIcon} active={route().current('playlists.*')}>My Playlists</MobileNavLink>
                            <MobileNavLink href={route('projects.create')} active={route().current('projects.create')}>
                                <span className="text-emerald-400 mr-2">+</span> Upload Project
                            </MobileNavLink>
                            <MobileNavLink href={route('studio.projects')} icon={VideoIcon} active={route().current('studio.projects')}>Video Editor</MobileNavLink>
                            <MobileNavLink href={route('storage.index')} icon={HardDriveIcon} active={route().current('storage.*')}>My Storage</MobileNavLink>

                            {/* Community */}
                            <MobileSectionLabel>Community</MobileSectionLabel>
                            <MobileNavLink href={route('chat')} icon={UsersIcon} active={route().current('chat')}>Community Chat</MobileNavLink>

                            {/* AI Tools */}
                            <MobileSectionLabel>AI Tools</MobileSectionLabel>
                            <MobileNavLink href={route('ai.assistant')} icon={SparklesIcon} active={route().current('ai.assistant')}>Spark Assistant</MobileNavLink>
                            <MobileNavLink href={route('scriptwriter.index')} active={route().current('scriptwriter.*')}>
                                <span className="mr-2">📝</span> Scriptwriter
                            </MobileNavLink>

                            {/* Admin */}
                            {isAdmin && (
                                <>
                                    <MobileSectionLabel>Administration</MobileSectionLabel>
                                    <MobileNavLink href={route('admin.dashboard')} icon={ShieldIcon} active={route().current('admin.*')}>Admin Panel</MobileNavLink>
                                </>
                            )}

                            {/* Account Actions */}
                            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                                <MobileNavLink href={route('profile.edit')} active={route().current('profile.*')}>
                                    <UserCircle /> Profile Settings
                                </MobileNavLink>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <span>🚪</span>
                                    <span className="font-medium">Log Out</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast notification (bottom-right) - Enhanced styling */}
                <div className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-amber-500/10 flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <div className="text-sm font-medium">{toastMessage || 'New message received!'}</div>
                    </div>
                </div>

                {/* Page Header (optional) - Enhanced with bento styling */}
                {header && (
                    <header className="relative pt-6 px-2 sm:px-4 lg:px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl px-4 sm:px-6 py-4">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="pt-6 pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
