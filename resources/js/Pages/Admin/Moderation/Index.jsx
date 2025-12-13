import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function ModerationIndex({ pendingProjects = [], openFlags = [], approvedProjects = null, rejectedProjects = null }) {
    const [tab, setTab] = useState('approval');
    const [rejectModal, setRejectModal] = useState({ open: false, project: null, reason: '' });
    const { props } = usePage();

    // normalize collections (support plain arrays or paginated objects)
    const pending = Array.isArray(pendingProjects) ? pendingProjects : pendingProjects?.data ?? [];
    const flags = Array.isArray(openFlags) ? openFlags : openFlags?.data ?? [];
    const approvedItems = Array.isArray(approvedProjects) ? approvedProjects : approvedProjects?.data ?? [];
    const rejectedItems = Array.isArray(rejectedProjects) ? rejectedProjects : rejectedProjects?.data ?? [];

    // helper for tab button classes
    const tabClass = (t) => `px-4 py-2 -mb-px border-b-2 rounded-t ${tab === t ? 'border-amber-500 bg-amber-500 text-white' : 'border-transparent bg-white text-gray-700 hover:bg-gray-50'}`;

    function approveProject(projectId) {
        router.patch(route('admin.moderation.updateProjectStatus', projectId), { status: 'approved' });
    }

    function openReject(project) {
        setRejectModal({ open: true, project, reason: '' });
    }

    function submitReject(e) {
        e.preventDefault();
        if (!rejectModal.project) return;
        router.patch(route('admin.moderation.updateProjectStatus', rejectModal.project.id), { status: 'rejected', reason: rejectModal.reason }, {
            onFinish: () => setRejectModal({ open: false, project: null, reason: '' }),
        });
    }

    function deleteProject(projectId) {
        if (!confirm('Delete this project permanently?')) return;
        router.delete(route('projects.destroy', projectId));
    }

    function resolveFlag(flagId) {
        router.patch(route('admin.moderation.resolveFlag', flagId));
    }

    function banUser(userId) {
        if (!confirm('Ban this user?')) return;
        router.patch(route('admin.users.ban', userId));
    }

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Moderation</h1>}>
            <div className="mb-4">
                <div className="flex items-center gap-2 border-b border-gray-200">
                    <button onClick={() => setTab('approval')} className={tabClass('approval')}>Approval Queue</button>
                    <button onClick={() => setTab('reports')} className={tabClass('reports')}>User Reports</button>
                    <button onClick={() => setTab('approved')} className={tabClass('approved')}>Approved</button>
                    <button onClick={() => setTab('rejected')} className={tabClass('rejected')}>Rejected</button>
                </div>
            </div>

            {tab === 'approval' && (
                <div>
                    {pending.length === 0 ? (
                        <div className="text-gray-600">No projects awaiting approval.</div>
                    ) : (
                        <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thumbnail</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pending.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <img src={p.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded" />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">{p.title}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{p.user?.name || '—'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <button onClick={() => approveProject(p.id)} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Approve</button>
                                                <button onClick={() => openReject(p)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pendingProjects?.links && (
                            <div className="mt-4">
                                <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                                    {pendingProjects.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || ''}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'} ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`}
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
                        <div className="text-gray-600">No open reports.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flagged Video</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reported By</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {flags.map((f) => (
                                        <tr key={f.id}>
                                            <td className="px-4 py-3 whitespace-nowrap flex items-center gap-3">
                                                <img src={f.project?.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded" />
                                                <div>
                                                    <div className="font-medium">{f.project?.title}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">{f.reason}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{f.user?.name || '—'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{new Date(f.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <button onClick={() => deleteProject(f.project?.id)} className="px-3 py-1 bg-red-600 text-white rounded mr-2">Delete Video</button>
                                                <button onClick={() => resolveFlag(f.id)} className="px-3 py-1 bg-gray-300 rounded mr-2">Dismiss Report</button>
                                                <button onClick={() => banUser(f.project?.user_id)} className="px-3 py-1 bg-red-700 text-white rounded">Ban User</button>
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
                        <div className="text-gray-600">No approved projects.</div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thumbnail</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Approved On</th>
                                            <th className="px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {approvedItems.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <img src={p.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded" />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.title}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.user?.name || '—'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button onClick={() => router.patch(route('admin.moderation.updateProjectStatus', p.id), { status: 'rejected' })} className="px-3 py-1 bg-red-600 text-white rounded">Un-publish</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {approvedProjects?.links && (
                                <div className="mt-4">
                                    <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                                        {approvedProjects.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || ''}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'} ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`}
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
                        <div className="text-gray-600">No rejected projects.</div>
                    ) : (
                        <div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thumbnail</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creator</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rejected On</th>
                                            <th className="px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rejectedItems.map((p) => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <img src={p.thumbnail_url} alt="thumb" className="h-12 w-20 object-cover rounded" />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.title}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.user?.name || '—'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button onClick={() => router.patch(route('admin.moderation.updateProjectStatus', p.id), { status: 'approved' })} className="px-3 py-1 bg-green-600 text-white rounded">Re-approve</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {rejectedProjects?.links && (
                                <div className="mt-4">
                                    <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                                        {rejectedProjects.links.map((link, idx) => (
                                            <Link
                                                key={idx}
                                                href={link.url || ''}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'} ${!link.url ? 'text-gray-400 cursor-not-allowed' : ''}`}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg bg-white rounded shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Reject Project: {rejectModal.project?.title}</h2>
                        <form onSubmit={submitReject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Reason</label>
                                <textarea required value={rejectModal.reason} onChange={(e) => setRejectModal((s) => ({ ...s, reason: e.target.value }))} className="w-full border rounded px-3 py-2" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setRejectModal({ open: false, project: null, reason: '' })} className="px-3 py-1 border rounded">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded">Submit Rejection</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
