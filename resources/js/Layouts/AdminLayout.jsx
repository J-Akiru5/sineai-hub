import { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { usePage } from '@inertiajs/react';

export default function AdminLayout({ children, header }) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    const isActive = (pattern) => route().current(pattern);

    // Navigation items with icons
    const navItems = [
        { href: route('admin.dashboard'), pattern: 'admin.dashboard', label: 'Dashboard', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )},
        { href: route('admin.users.index'), pattern: 'admin.users.*', label: 'User Management', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )},
        { href: route('admin.roles.index'), pattern: 'admin.roles.*', label: 'Role Management', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        )},
        { href: route('admin.moderation.index'), pattern: 'admin.moderation.*', label: 'Moderation', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )},
        { href: route('admin.channels.index'), pattern: 'admin.channels.*', label: 'Channels', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
        )},
        { href: route('admin.activity-logs.index'), pattern: 'admin.activity-logs.*', label: 'Activity Logs', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        )},
    ];

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Sidebar - Glassmorphism */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-72 transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                {/* Glass effect sidebar */}
                <div className="h-full bg-slate-900/60 backdrop-blur-xl border-r border-white/10 flex flex-col">
                    {/* Logo Header */}
                    <div className="h-20 flex items-center px-6 border-b border-white/10">
                        <Link href={route('admin.dashboard')} className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg group-hover:bg-amber-500/30 transition-colors" />
                                <ApplicationLogo className="h-9 w-auto text-amber-500 relative" />
                            </div>
                            <div>
                                <span className="text-lg font-bold text-white tracking-tight">SineAI</span>
                                <span className="text-xs text-amber-500 font-medium ml-1.5 px-1.5 py-0.5 bg-amber-500/10 rounded-full">Admin</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-4">Navigation</div>
                        {navItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive(item.pattern)
                                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <span className={`flex-shrink-0 ${isActive(item.pattern) ? 'text-amber-500' : 'text-slate-500 group-hover:text-amber-500'} transition-colors`}>
                                    {item.icon}
                                </span>
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.pattern) && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Bottom section */}
                    <div className="p-4 border-t border-white/10">
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                        >
                            <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                            </svg>
                            <span className="font-medium">Back to App</span>
                        </Link>

                        {/* User info */}
                        {auth?.user && (
                            <div className="mt-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                        {auth.user.name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{auth.user.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{auth.user.email}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile backdrop */}
            {open && (
                <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm" />
            )}

            {/* Content area */}
            <div className="flex-1 min-h-screen md:ml-72 flex flex-col">
                {/* Mobile topbar */}
                <div className="md:hidden bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
                    <div className="flex items-center justify-between h-16 px-4">
                        <Link href={route('admin.dashboard')} className="flex items-center gap-2">
                            <ApplicationLogo className="h-7 w-auto text-amber-500" />
                            <span className="font-bold text-white">Admin</span>
                        </Link>
                        <button
                            onClick={() => setOpen((s) => !s)}
                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Header with gradient */}
                {header && (
                    <header className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10 hidden md:block">
                        <div className="max-w-7xl mx-auto py-5 px-6 lg:px-8">
                            <div className="text-white [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:tracking-tight">{header}</div>
                        </div>
                    </header>
                )}

                {/* Main content */}
                <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Glass card for content */}
                        <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20 p-6 lg:p-8 text-slate-200 [&_table]:text-slate-300 [&_th]:text-slate-400 [&_thead]:bg-slate-800/50 [&_tbody]:bg-slate-900/30 [&_tr]:border-slate-700/50 [&_input]:bg-slate-800/50 [&_input]:border-slate-700 [&_input]:text-white [&_input:focus]:border-amber-500 [&_input:focus]:ring-amber-500/20 [&_select]:bg-slate-800/50 [&_select]:border-slate-700 [&_select]:text-white [&_textarea]:bg-slate-800/50 [&_textarea]:border-slate-700 [&_textarea]:text-white">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-6 text-center text-xs text-slate-600">
                    <span>© {new Date().getFullYear()} SineAI Hub • Admin Panel</span>
                </footer>
            </div>
        </div>
    );
}
