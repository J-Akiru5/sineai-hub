import { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { usePage } from '@inertiajs/react';

export default function AdminLayout({ children, header }) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage().props;

    const isActive = (pattern) => route().current(pattern);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transform ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform`}>
                <div className="h-16 flex items-center px-4 border-b border-gray-800">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2">
                        <ApplicationLogo className="h-7 w-auto text-amber-500" />
                        <span className="font-semibold">Admin</span>
                    </Link>
                </div>

                <nav className="px-2 py-4 space-y-1">
                    <Link href={route('admin.dashboard')} className={`block px-4 py-2 rounded-md ${isActive('admin.dashboard') ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}>
                        Dashboard
                    </Link>

                    <Link href={route('admin.users.index')} className={`block px-4 py-2 rounded-md ${isActive('admin.users.*') ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}>
                        User Management
                    </Link>

                    <Link href={route('admin.roles.index')} className={`block px-4 py-2 rounded-md ${isActive('admin.roles.*') ? 'bg-gray-800' : 'hover:bg-gray-800/60'}`}>
                        Role Management
                    </Link>

                    <Link href={route('dashboard')} className="block px-4 py-2 rounded-md hover:bg-gray-800/60">
                        Back to App
                    </Link>
                </nav>
            </aside>

            {/* Content area */}
            <div className="flex-1 min-h-screen md:ml-64">
                {/* Topbar for mobile */}
                <div className="md:hidden bg-white border-b">
                    <div className="flex items-center justify-between h-12 px-3">
                        <Link href={route('admin.dashboard')} className="flex items-center gap-2 text-slate-800">
                            <ApplicationLogo className="h-6 w-auto text-amber-500" />
                            <span className="font-semibold">Admin</span>
                        </Link>
                        <button onClick={() => setOpen((s) => !s)} className="p-2 rounded-md text-slate-700">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {header && (
                    <header className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">{header}</div>
                    </header>
                )}

                <main className="py-6 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded shadow p-6">{children}</div>
                    </div>
                </main>
            </div>
        </div>
    );
}
