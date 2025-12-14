import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';

// SweetAlert2 theme for admin panel
const swalTheme = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#475569',
    iconColor: '#f59e0b',
};

export default function ChannelsIndex({ channels, roles }) {
    const items = channels?.data ?? [];
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allowedRoleId, setAllowedRoleId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function openCreate() {
        setEditing(null);
        setName('');
        setDescription('');
        setAllowedRoleId('');
        setShowModal(true);
    }

    function openEdit(ch) {
        setEditing(ch);
        setName(ch.name);
        setDescription(ch.description || '');
        setAllowedRoleId(ch.allowed_role_id || '');
        setShowModal(true);
    }

    function submit(e) {
        e.preventDefault();
        setSubmitting(true);
        const payload = { name, description, allowed_role_id: allowedRoleId || null };
        if (editing) {
            router.patch(route('admin.channels.update', editing.id), payload, {
                onSuccess: () => {
                    Swal.fire({
                        ...swalTheme,
                        title: 'Channel Updated!',
                        text: `${name} has been updated successfully.`,
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                },
                onFinish: () => { setSubmitting(false); setShowModal(false); }
            });
        } else {
            router.post(route('admin.channels.store'), payload, {
                onSuccess: () => {
                    Swal.fire({
                        ...swalTheme,
                        title: 'Channel Created!',
                        text: `${name} has been created successfully.`,
                        icon: 'success',
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false,
                    });
                },
                onFinish: () => { setSubmitting(false); setShowModal(false); }
            });
        }
    }

    function destroyChannel(ch) {
        Swal.fire({
            ...swalTheme,
            title: 'Delete Channel?',
            html: `<p class="text-slate-400">Are you sure you want to delete "<span class="text-white font-medium">${ch.name}</span>"?</p><p class="text-red-400 text-sm mt-2">This action cannot be undone.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.channels.destroy', ch.id), {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Deleted!',
                            text: 'The channel has been removed.',
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
        <AdminLayout header={<h1 className="text-2xl font-semibold">Channel Management</h1>}>
            <div className="flex items-center justify-between mb-6">
                <div className="text-slate-400">Manage chat channels and role restrictions.</div>
                <button onClick={openCreate} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Channel
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="min-w-full divide-y divide-slate-700/50">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Restricted To</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {items.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-amber-500 font-mono">#</span>
                                        <span className="font-medium text-white">{c.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{c.description || '—'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {c.allowed_role ? (
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">{c.allowed_role.name}</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Public</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(c)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">Edit</button>
                                        <button onClick={() => destroyChannel(c)} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6">
                {channels?.links ? (
                    <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                        {channels.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} transition-colors`} />
                        ))}
                    </nav>
                ) : null}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">{editing ? `Edit ${editing.name}` : 'Create Channel'}</h2>
                        <form onSubmit={submit}>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="e.g., general" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="What is this channel for?" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Restricted Role</label>
                                    <select value={allowedRoleId} onChange={(e) => setAllowedRoleId(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors">
                                        <option value="">None / Public</option>
                                        {roles.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
