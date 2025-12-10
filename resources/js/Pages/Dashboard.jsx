import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard(props) {
    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Main content */}
                        <div className="lg:col-span-2">
                            <div className="p-6 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-lg">
                                <h3 className="text-lg font-semibold text-amber-100">Welcome back, {props.auth?.user?.name ?? 'Creator'}</h3>
                                <p className="mt-2 text-amber-200/80">Here's a quick look at your activity and shortcuts to get you back into creation.</p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-800/40 rounded-md border border-white/6">
                                        <div className="text-sm text-amber-200">Projects</div>
                                        <div className="text-2xl font-bold text-amber-100">{props.stats?.projects_count ?? '—'}</div>
                                    </div>
                                    <div className="p-4 bg-slate-800/40 rounded-md border border-white/6">
                                        <div className="text-sm text-amber-200">Messages</div>
                                        <div className="text-2xl font-bold text-amber-100">{props.stats?.unread_messages ?? '—'}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-sm font-medium text-amber-200/90">Recent Projects</h4>
                                    <div className="mt-3 space-y-3">
                                        {(props.recent_projects || []).length === 0 ? (
                                            <div className="p-4 text-amber-200/80">No recent projects — start by uploading one.</div>
                                        ) : (
                                            props.recent_projects.map((p) => (
                                                <div key={p.id} className="p-3 bg-slate-800/30 rounded-md border border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-amber-100">{p.title}</div>
                                                        <div className="text-sm text-amber-200/80">{p.summary}</div>
                                                    </div>
                                                    <div>
                                                        <Link href={route('projects.show', p.id)} className="text-amber-300 hover:underline">View</Link>
                                                    </div>
                                                </div>
                                            ))
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
                                    <div className="mt-2 text-amber-100">{props.auth?.user?.email}</div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
