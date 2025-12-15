import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import { Search, Shield, RefreshCw, Flag, CheckCircle, XCircle } from 'lucide-react';

// SweetAlert2 theme for admin panel
const swalTheme = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#475569',
    iconColor: '#f59e0b',
};

export default function ModerationIndex({ pendingProjects = [], openFlags = [], approvedProjects = null, rejectedProjects = null, filters = {} }) {
    const [tab, setTab] = useState('approval');
    const [rejectModal, setRejectModal] = useState({ open: false, project: null, reason: '' });
    const { props } = usePage();

    // Search state
    const [search, setSearch] = useState(filters?.search || '');
    const debounceRef = useRef(null);

    // normalize collections (support plain arrays or paginated objects)
    const pending = Array.isArray(pendingProjects) ? pendingProjects : pendingProjects?.data ?? [];
    const flags = Array.isArray(openFlags) ? openFlags : openFlags?.data ?? [];
    const approvedItems = Array.isArray(approvedProjects) ? approvedProjects : approvedProjects?.data ?? [];
    const rejectedItems = Array.isArray(rejectedProjects) ? rejectedProjects : rejectedProjects?.data ?? [];

    // helper for tab button classes
    const tabClass = (t) => `px-4 py-2 -mb-px border-b-2 rounded-t font-medium transition-all ${tab === t ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`;

    // Search with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('admin.moderation.index'), {
                search: search || undefined,
                tab: tab,
            }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    function approveProject(projectId, title) {
        Swal.fire({
            ...swalTheme,
            title: 'Approve Project?',
            text: `This will publish "${title}" to the Premiere section.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.moderation.updateProjectStatus', projectId), { status: 'approved' }, {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Approved!',
                            text: 'The project has been published.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    }

    function openReject(project) {
        setRejectModal({ open: true, project, reason: '' });
    }

    function submitReject(e) {
        e.preventDefault();
        if (!rejectModal.project) return;
        router.patch(route('admin.moderation.updateProjectStatus', rejectModal.project.id), { status: 'rejected', reason: rejectModal.reason }, {
            onSuccess: () => {
                setRejectModal({ open: false, project: null, reason: '' });
                Swal.fire({
                    ...swalTheme,
                    title: 'Rejected',
                    text: 'The project has been rejected.',
                    icon: 'info',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            },
            onFinish: () => setRejectModal({ open: false, project: null, reason: '' }),
        });
    }

    function deleteProject(projectId, title) {
        Swal.fire({
            ...swalTheme,
            title: 'Delete Project?',
            html: `<p class="text-slate-400">This will permanently delete "<span class="text-white font-medium">${title}</span>".</p><p class="text-red-400 text-sm mt-2">This action cannot be undone.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('projects.destroy', projectId), {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Deleted!',
                            text: 'The project has been removed.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    }

    function resolveFlag(flagId) {
        Swal.fire({
            ...swalTheme,
            title: 'Dismiss Report?',
            text: 'This will mark the report as resolved.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Dismiss',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.moderation.resolveFlag', flagId), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Dismissed!',
                            text: 'The report has been resolved.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    }

    function banUser(userId, userName) {
        Swal.fire({
            ...swalTheme,
            title: 'Ban User?',
            html: `<p class="text-slate-400">This will ban "<span class="text-white font-medium">${userName || 'this user'}</span>" from the platform.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Ban User',
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.users.ban', userId), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Banned!',
                            text: 'The user has been banned.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    }

    function unpublishProject(projectId, title) {
        Swal.fire({
            ...swalTheme,
            title: 'Un-publish Project?',
            text: `This will remove "${title}" from public view.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Un-publish',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.moderation.updateProjectStatus', projectId), { status: 'rejected' }, {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Un-published!',
                            text: 'The project has been removed from public view.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    }

    function reapproveProject(projectId, title) {
        Swal.fire({
            ...swalTheme,
            title: 'Re-approve Project?',
            text: `This will publish "${title}" again.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Re-approve',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.moderation.updateProjectStatus', projectId), { status: 'approved' }, {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Re-approved!',
                            text: 'The project has been published.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    }

    return (
        <AdminLayout header={
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-xl text-amber-100 leading-tight flex items-center gap-2">
                    <Shield className="w-6 h-6 text-amber-400" />
                    Content Moderation
                </h2>
            </div>
        }>
            <Head title="Moderation" />

            {/* Search & Filter Toolbar */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search projects or users..."
                            className="pl-10 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors w-72"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setSearch('');
                            router.get(route('admin.moderation.index'), {}, { preserveState: true, replace: true });
                        }}
                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-amber-400">
                        <Flag className="w-4 h-4" />
                        {pending.length} Pending
                    </span>
                    <span className="flex items-center gap-1.5 text-red-400">
                        <XCircle className="w-4 h-4" />
                        {flags.length} Reports
                    </span>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-2 border-b border-slate-700/50">
                    <button onClick={() => setTab('approval')} className={tabClass('approval')}>Approval Queue</button>
                    <button onClick={() => setTab('reports')} className={tabClass('reports')}>User Reports</button>
                    <button onClick={() => setTab('approved')} className={tabClass('approved')}>Approved</button>
                    <button onClick={() => setTab('rejected')} className={tabClass('rejected')}>Rejected</button>
                </div>
            </div>

            {tab === 'approval' && (
                <div>
                    {pending.length === 0 ? (
                        <div className="text-slate-500 text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No projects awaiting approval.</p>
                        </div>
                    ) : (
                        <>
                        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                            <table className="min-w-full divide-y divide-slate-700/50">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Thumbnail</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Creator</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Uploaded</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {pending.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <img src={p.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded-lg ring-1 ring-white/10" />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{p.title}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{p.user?.name || '—'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(p.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <button onClick={() => approveProject(p.id, p.title)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors mr-2">Approve</button>
                                                <button onClick={() => openReject(p)} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pendingProjects?.links && (
                            <div className="mt-6">
                                <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                                    {pendingProjects.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || ''}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                                            as="button"
                                            disabled={!link.url}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                        </>
                    )}
                </div>
            )}

            {tab === 'reports' && (
                <div>
                    {flags.length === 0 ? (
                        <div className="text-slate-500 text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            <p>No open reports.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                            <table className="min-w-full divide-y divide-slate-700/50">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Flagged Video</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Reason</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Reported By</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {flags.map((f) => (
                                        <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap flex items-center gap-3">
                                                <img src={f.project?.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded-lg ring-1 ring-white/10" />
                                                <div>
                                                    <div className="font-medium text-white">{f.project?.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-sm">{f.reason}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">{f.user?.name || '—'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(f.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => deleteProject(f.project?.id, f.project?.title)} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">Delete Video</button>
                                                    <button onClick={() => resolveFlag(f.id)} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors">Dismiss</button>
                                                    <button onClick={() => banUser(f.project?.user_id, f.project?.user?.name)} className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">Ban User</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === 'approved' && (
                <div>
                    {approvedItems.length === 0 ? (
                        <div className="text-slate-500 text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <p>No approved projects.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                                <table className="min-w-full divide-y divide-slate-700/50">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Thumbnail</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Creator</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Approved On</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {approvedItems.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <img src={p.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded-lg ring-1 ring-white/10" />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{p.title}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.user?.name || '—'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(p.created_at).toLocaleString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button onClick={() => unpublishProject(p.id, p.title)} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">Un-publish</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {approvedProjects?.links && (
                                <div className="mt-6">
                                    <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                                        {approvedProjects.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || ''}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                                                as="button"
                                                disabled={!link.url}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {tab === 'rejected' && (
                <div>
                    {rejectedItems.length === 0 ? (
                        <div className="text-slate-500 text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <p>No rejected projects.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                                <table className="min-w-full divide-y divide-slate-700/50">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Thumbnail</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Title</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Creator</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rejected On</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {rejectedItems.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <img src={p.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded-lg ring-1 ring-white/10" />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{p.title}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.user?.name || '—'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">{new Date(p.created_at).toLocaleString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button onClick={() => reapproveProject(p.id, p.title)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">Re-approve</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {rejectedProjects?.links && (
                                <div className="mt-6">
                                    <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                                        {rejectedProjects.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || ''}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`}
                                                as="button"
                                                disabled={!link.url}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            
            {rejectModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Reject Project: <span className="text-amber-500">{rejectModal.project?.title}</span></h2>
                        <form onSubmit={submitReject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Reason for rejection</label>
                                <textarea required value={rejectModal.reason} onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value }))} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="Enter the reason why this project is being rejected..." rows={4} />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setRejectModal({ open: false, project: null, reason: '' })} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors">Submit Rejection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
