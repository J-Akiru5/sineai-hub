import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth, recentProjects = [], recentScripts = [], stats = {}, errors = {} }) {
    const projects = recentProjects || []
    const scripts = recentScripts || []

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Main content */}
                        <div className="lg:col-span-2">
                            <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg">
                                <h3 className="text-lg font-semibold text-amber-100">Welcome back, {auth?.user?.name ?? 'Creator'}</h3>
                                <p className="mt-2 text-amber-200/80">Here's a quick look at your activity and shortcuts to get you back into creation.</p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800/40 rounded-md border border-white/6">
                                        <div className="text-sm text-amber-200">Projects</div>
                                        <div className="text-2xl font-bold text-amber-100">{stats?.projects_count ?? '—'}</div>
                                    </div>
                                    <div className="p-4 bg-slate-800/40 rounded-md border border-white/6">
                                        <div className="text-sm text-amber-200">Messages</div>
                                        <div className="text-2xl font-bold text-amber-100">{stats?.unread_messages ?? '—'}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-amber-200/90">Recent Projects</h4>
                                    <div className="mt-3">
                                        {projects.length === 0 ? (
                                            <div className="p-4 text-amber-200/80">No recent projects — start by uploading one.</div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {projects.map((p) => (
                                                    <a
                                                        key={p.id}
                                                        href={route('projects.show', p.id)}
                                                        className="group bg-gradient-to-br from-black/40 to-black/20 hover:from-amber-700/10 hover:to-amber-600/5 border border-gray-800 hover:border-amber-600 rounded-lg p-3 flex items-center space-x-3 transition-all"
                                                    >
                                                        <div className="w-12 h-12 rounded-md bg-gray-800 flex items-center justify-center text-amber-400 font-bold text-lg overflow-hidden">
                                                            {p.thumbnail_url ? (
                                                                <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{(p.title || 'P').charAt(0).toUpperCase()}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-amber-200 truncate">{p.title}</div>
                                                            <div className="text-xs text-gray-500 truncate">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-amber-200/90">Recent Scripts</h4>
                                    <div className="mt-3">
                                        {scripts.length === 0 ? (
                                            <div className="p-4 text-amber-200/80">No recent scripts — create one in the Scriptwriter.</div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {scripts.map((s) => (
                                                    <li key={s.id} className="flex items-center justify-between bg-slate-800/30 rounded-md p-3 border border-white/5">
                                                        <a href={route('scriptwriter.index')} className="flex-1 min-w-0">
                                                            <div className="text-sm text-amber-100 font-medium truncate">{s.title || 'Untitled'}</div>
                                                            <div className="text-xs text-gray-500">{s.created_at ? new Date(s.created_at).toLocaleString() : ''}</div>
                                                        </a>
                                                        <div className="ml-3">
                                                            <Link href={route('scriptwriter.index')} className="text-amber-300 hover:text-amber-200">Open</Link>
                                                        </div>
                                                    </li>
                                                ))}
                                                </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick actions / stats */}
                        <aside>
                            <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg space-y-4">
                                <div>
                                    <div className="text-sm text-amber-200">Quick Actions</div>
                                    <div className="mt-3 flex flex-col gap-3">
                                        <Link href={route('projects.create')} className="inline-block px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-700 text-slate-900 rounded-md font-semibold text-center">Upload Project</Link>
                                        <Link href={route('chat')} className="inline-block px-4 py-2 bg-slate-800/30 text-amber-200 rounded-md text-center">Open Chat</Link>
                                        <Link href={route('ai.assistant')} className="inline-block px-4 py-2 bg-slate-800/30 text-amber-200 rounded-md text-center">Open Spark</Link>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-amber-200">Account</div>
                                    <div className="mt-2 text-amber-100">{auth?.user?.email}</div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
