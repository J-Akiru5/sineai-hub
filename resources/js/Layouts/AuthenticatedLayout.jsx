import { useState, useEffect } from 'react';
import supabase from '@/supabase';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { ThemeToggle, ThemeSwitch } from '@/Components/ThemeToggle';
import { LanguageSelector, LanguageToggle } from '@/Components/LanguageSelector';
import { useTheme } from '@/Contexts/ThemeContext';
import { useLanguage } from '@/Contexts/LanguageContext';
import { Link, usePage } from '@inertiajs/react';
import { swalTheme } from '@/Utils/swal';
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

// NavLink component - Theme aware
const NavLink = ({ href, active, icon: Icon, children, className = '', isDark }) => (
    <Link
        href={href}
        className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                : isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            } ${className}`}
    >
        {Icon && <span className={`${active ? 'text-amber-500' : isDark ? 'text-slate-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-500'} transition-colors`}><Icon /></span>}
        <span>{children}</span>
    </Link>
);

// Mobile NavLink - Theme aware
const MobileNavLink = ({ href, icon: Icon, children, active, isDark }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-500 border-l-2 border-amber-500'
                : isDark 
                    ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        {Icon && <span className={active ? 'text-amber-500' : isDark ? 'text-slate-500' : 'text-slate-400'}><Icon /></span>}
        <span className="font-medium">{children}</span>
    </Link>
);

// Section Label - Theme aware
const MobileSectionLabel = ({ children, isDark }) => (
    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{children}</div>
);

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const props = usePage().props;
    const { auth } = props;
    const currentUser = user ?? auth?.user ?? {};
    
    // Theme and Language hooks
    const { isDark } = useTheme();
    const { t } = useLanguage();

    const initialUnreadCount = props?.unreadNotificationsCount ?? 0;
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const isAdmin = (currentUser?.roles || []).some(r => r.name === 'admin' || r.name === 'super-admin');

    useEffect(() => {
        if (props?.unreadNotificationsCount !== undefined) {
            setUnreadCount(props.unreadNotificationsCount);
        }
    }, [props?.unreadNotificationsCount]);

    useEffect(() => {
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
                } catch (e) {}
            })
            .subscribe();
        return () => { try { supabase.removeChannel(channel); } catch (e) {} };
    }, [auth]);

    useEffect(() => {
        if (props.flash && props.flash.success) {
            Swal.fire({ ...swalTheme, icon: 'success', title: props.flash.success, timer: 3000, timerProgressBar: true });
        }
    }, [props.flash]);

    useEffect(() => { setShowingNavigationDropdown(false); }, [props.url]);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {isDark ? (
                    <>
                        <div className="absolute inset-0 bg-[url('images/Auth-bg.png')] bg-center bg-cover opacity-15" />
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                    </>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
                    </>
                )}
            </div>

            <div className="relative z-10">
                {/* Navigation */}
                <nav className="sticky top-0 z-40">
                    <div className="mx-2 sm:mx-4 lg:mx-6 mt-2 sm:mt-3">
                        <div className={`backdrop-blur-xl border rounded-2xl shadow-xl transition-colors duration-300 ${
                            isDark ? 'bg-slate-900/70 border-white/10 shadow-black/20' : 'bg-white/80 border-slate-200 shadow-slate-200/50'
                        }`}>
                            <div className="px-4 sm:px-6">
                                <div className="flex items-center h-14 sm:h-16 justify-between">
                                    {/* Logo */}
                                    <div className="flex items-center">
                                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg group-hover:bg-amber-500/30 transition-all" />
                                                <ApplicationLogo className="relative h-7 sm:h-8 w-auto text-amber-500" />
                                            </div>
                                            <span className={`hidden sm:inline font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                Sine<span className="text-amber-500">AI</span>
                                            </span>
                                        </Link>
                                    </div>

                                    {/* Desktop Navigation */}
                                    <div className="hidden lg:flex items-center justify-center flex-1">
                                        <div className={`flex items-center gap-1 rounded-2xl p-1.5 border transition-colors ${
                                            isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-100/80 border-slate-200'
                                        }`}>
                                            <NavLink href={route('dashboard')} active={route().current('dashboard')} icon={HomeIcon} isDark={isDark}>
                                                {t('nav.dashboard')}
                                            </NavLink>
                                            <NavLink href={route('projects.index')} active={route().current('projects.index') || route().current('projects.show')} icon={FolderIcon} isDark={isDark}>
                                                {t('nav.projects')}
                                            </NavLink>
                                            <NavLink href={route('premiere.index')} active={route().current('premiere.*')} icon={FilmIcon} isDark={isDark}>
                                                {t('nav.premiere')}
                                            </NavLink>

                                            {/* Studio Dropdown */}
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    {({ open }) => (
                                                        <button className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                            route().current('projects.my') || route().current('playlists.*') || route().current('studio.*')
                                                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                                                                : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                        }`}>
                                                            <span className={`${route().current('projects.my') || route().current('playlists.*') || route().current('studio.*') ? 'text-amber-500' : isDark ? 'text-slate-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-500'} transition-colors`}><VideoIcon /></span>
                                                            <span>{t('nav.studio')}</span>
                                                            <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><ChevronDown /></span>
                                                        </button>
                                                    )}
                                                </Dropdown.Trigger>
                                                <Dropdown.Content contentClasses={`py-2 backdrop-blur-xl border rounded-xl shadow-2xl ${isDark ? 'bg-slate-900/95 text-white border-white/10' : 'bg-white/95 text-slate-900 border-slate-200'}`} align="left">
                                                    <Dropdown.Link href={route('projects.my')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <FolderIcon /> {t('nav.my_projects')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('playlists.index')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <FilmIcon /> {t('nav.my_playlists')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('projects.create')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <span className="text-emerald-500">+</span> {t('nav.upload_project')}
                                                    </Dropdown.Link>
                                                    <div className={`border-t my-1 ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                                                    <Dropdown.Link href={route('studio.projects')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <VideoIcon /> {t('nav.video_editor')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('storage.index')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <HardDriveIcon /> {t('nav.my_storage')}
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>

                                            <NavLink href={route('chat')} active={route().current('chat')} icon={UsersIcon} isDark={isDark}>
                                                {t('nav.community')}
                                            </NavLink>

                                            {/* AI Tools Dropdown */}
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    {({ open }) => (
                                                        <button className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                            route().current('ai.*') || route().current('scriptwriter.*')
                                                                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 shadow-lg shadow-amber-500/10 border border-amber-500/20'
                                                                : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                        }`}>
                                                            <span className={`${route().current('ai.*') || route().current('scriptwriter.*') ? 'text-amber-500' : isDark ? 'text-slate-500 group-hover:text-amber-400' : 'text-slate-400 group-hover:text-amber-500'} transition-colors`}><SparklesIcon /></span>
                                                            <span>{t('nav.ai_tools')}</span>
                                                            <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}><ChevronDown /></span>
                                                        </button>
                                                    )}
                                                </Dropdown.Trigger>
                                                <Dropdown.Content contentClasses={`py-2 backdrop-blur-xl border rounded-xl shadow-2xl ${isDark ? 'bg-slate-900/95 text-white border-white/10' : 'bg-white/95 text-slate-900 border-slate-200'}`} align="left">
                                                    <Dropdown.Link href={route('ai.assistant')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <SparklesIcon /> {t('nav.spark_assistant')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('scriptwriter.index')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <span>📝</span> {t('nav.scriptwriter')}
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>

                                            {isAdmin && (
                                                <NavLink href={route('admin.dashboard')} active={route().current('admin.*')} icon={ShieldIcon} isDark={isDark}>
                                                    {t('nav.admin')}
                                                </NavLink>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Section */}
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <Link href={route('notifications.index')} className={`relative p-2 rounded-xl transition-all hidden sm:block ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                                            <BellIcon />
                                            {(unreadCount > 0 || props.unreadNotificationsCount > 0) && (
                                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                                                    {props.unreadNotificationsCount || unreadCount}
                                                </span>
                                            )}
                                        </Link>

                                        <ThemeToggle className="hidden sm:flex" />
                                        <LanguageSelector className="hidden sm:block" />

                                        <Link href={route('settings.index')} className={`p-2 rounded-xl transition-all hidden sm:block ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`} title={t('nav.settings')}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </Link>

                                        {/* User Dropdown */}
                                        <div className="hidden lg:block">
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${isDark ? 'bg-slate-800/50 border-white/5 hover:bg-slate-800/80 hover:border-amber-500/30' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-amber-500/30'}`}>
                                                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                                                            {(currentUser?.name || 'G')[0].toUpperCase()}
                                                        </div>
                                                        <span className={`text-sm font-medium transition-colors max-w-[120px] truncate ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'}`}>
                                                            {currentUser?.name ?? 'Guest'}
                                                        </span>
                                                        <ChevronDown />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content contentClasses={`py-2 backdrop-blur-xl border rounded-xl shadow-2xl min-w-[180px] ${isDark ? 'bg-slate-900/95 text-white border-white/10' : 'bg-white/95 text-slate-900 border-slate-200'}`} align="right">
                                                    <div className={`px-4 py-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser?.name}</div>
                                                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{currentUser?.email}</div>
                                                    </div>
                                                    <Dropdown.Link href={route('profile.edit')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <UserCircle /> {t('nav.profile')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('notifications.index')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <BellIcon /> {t('nav.notifications')}
                                                        {(props.unreadNotificationsCount > 0) && (
                                                            <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-full">{props.unreadNotificationsCount}</span>
                                                        )}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('settings.index')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg> {t('nav.settings')}
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('storage.index')} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                                                        <HardDriveIcon /> {t('nav.my_storage')}
                                                    </Dropdown.Link>
                                                    <div className={`border-t my-1 ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
                                                    <Dropdown.Link href={route('logout')} method="post" as="button" className={`flex items-center gap-2 px-4 py-2 text-red-400 w-full text-left ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
                                                        <span>🚪</span> {t('nav.logout')}
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </div>

                                        {/* Mobile Menu Button */}
                                        <button onClick={() => setShowingNavigationDropdown((s) => !s)} className={`lg:hidden p-2 rounded-xl transition-all ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                                            {showingNavigationDropdown ? <XIcon /> : <MenuIcon />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                <div className={`lg:hidden fixed inset-0 z-30 transition-all duration-300 ${showingNavigationDropdown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className={`absolute inset-0 backdrop-blur-sm ${isDark ? 'bg-slate-950/80' : 'bg-white/80'}`} onClick={() => setShowingNavigationDropdown(false)} />
                    <div className={`absolute top-20 left-2 right-2 sm:left-4 sm:right-4 max-h-[calc(100vh-100px)] overflow-y-auto backdrop-blur-xl border rounded-2xl shadow-2xl transform transition-all duration-300 ${showingNavigationDropdown ? 'translate-y-0 scale-100' : '-translate-y-4 scale-95'} ${isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                        <div className="p-4 space-y-2">
                            {/* User Info */}
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border mb-4 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                                    {(currentUser?.name || 'G')[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser?.name ?? 'Guest'}</div>
                                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{currentUser?.email}</div>
                                </div>
                                {unreadCount > 0 && (
                                    <div className="ml-auto flex items-center gap-1 text-amber-500">
                                        <BellIcon />
                                        <span className="text-xs">{unreadCount}</span>
                                    </div>
                                )}
                            </div>

                            {/* Theme & Language Controls */}
                            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-4 ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t('settings.theme')}</span>
                                    <ThemeSwitch />
                                </div>
                                <LanguageToggle />
                            </div>

                            {/* Navigation Links */}
                            <MobileSectionLabel isDark={isDark}>Navigate</MobileSectionLabel>
                            <MobileNavLink href={route('dashboard')} icon={HomeIcon} active={route().current('dashboard')} isDark={isDark}>{t('nav.dashboard')}</MobileNavLink>
                            <MobileNavLink href={route('projects.index')} icon={FolderIcon} active={route().current('projects.index') || route().current('projects.show')} isDark={isDark}>{t('nav.projects')}</MobileNavLink>
                            <MobileNavLink href={route('premiere.index')} icon={FilmIcon} active={route().current('premiere.*')} isDark={isDark}>{t('nav.premiere')}</MobileNavLink>

                            <MobileSectionLabel isDark={isDark}>{t('nav.studio')}</MobileSectionLabel>
                            <MobileNavLink href={route('projects.my')} icon={FolderIcon} active={route().current('projects.my')} isDark={isDark}>{t('nav.my_projects')}</MobileNavLink>
                            <MobileNavLink href={route('playlists.index')} icon={FilmIcon} active={route().current('playlists.*')} isDark={isDark}>{t('nav.my_playlists')}</MobileNavLink>
                            <MobileNavLink href={route('projects.create')} active={route().current('projects.create')} isDark={isDark}>
                                <span className="text-emerald-500 mr-2">+</span> {t('nav.upload_project')}
                            </MobileNavLink>
                            <MobileNavLink href={route('studio.projects')} icon={VideoIcon} active={route().current('studio.projects')} isDark={isDark}>{t('nav.video_editor')}</MobileNavLink>
                            <MobileNavLink href={route('storage.index')} icon={HardDriveIcon} active={route().current('storage.*')} isDark={isDark}>{t('nav.my_storage')}</MobileNavLink>

                            <MobileSectionLabel isDark={isDark}>{t('nav.community')}</MobileSectionLabel>
                            <MobileNavLink href={route('chat')} icon={UsersIcon} active={route().current('chat')} isDark={isDark}>{t('nav.community')}</MobileNavLink>

                            <MobileSectionLabel isDark={isDark}>{t('nav.ai_tools')}</MobileSectionLabel>
                            <MobileNavLink href={route('ai.assistant')} icon={SparklesIcon} active={route().current('ai.assistant')} isDark={isDark}>{t('nav.spark_assistant')}</MobileNavLink>
                            <MobileNavLink href={route('scriptwriter.index')} active={route().current('scriptwriter.*')} isDark={isDark}>
                                <span className="mr-2">📝</span> {t('nav.scriptwriter')}
                            </MobileNavLink>

                            {isAdmin && (
                                <>
                                    <MobileSectionLabel isDark={isDark}>{t('nav.admin')}</MobileSectionLabel>
                                    <MobileNavLink href={route('admin.dashboard')} icon={ShieldIcon} active={route().current('admin.*')} isDark={isDark}>{t('nav.admin')}</MobileNavLink>
                                </>
                            )}

                            <div className={`border-t pt-4 mt-4 space-y-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                <MobileNavLink href={route('profile.edit')} active={route().current('profile.*')} isDark={isDark}>
                                    <UserCircle /> {t('nav.profile')}
                                </MobileNavLink>
                                <Link href={route('logout')} method="post" as="button" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 transition-all ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
                                    <span>🚪</span>
                                    <span className="font-medium">{t('nav.logout')}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toast */}
                <div className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                    <div className={`backdrop-blur-xl border px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 ${isDark ? 'bg-slate-900/95 border-amber-500/30 text-white' : 'bg-white border-amber-500/30 text-slate-900'}`}>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <div className="text-sm font-medium">{toastMessage || 'New message received!'}</div>
                    </div>
                </div>

                {/* Page Header */}
                {header && (
                    <header className="relative pt-6 px-2 sm:px-4 lg:px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className={`backdrop-blur-sm border rounded-2xl px-4 sm:px-6 py-4 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white/50 border-slate-200'}`}>
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content */}
                <main className="pt-6 pb-8">{children}</main>
            </div>
        </div>
    );
}
