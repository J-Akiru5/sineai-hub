import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

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
                onFinish: () => { setSubmitting(false); setShowModal(false); }
            });
        } else {
            router.post(route('admin.channels.store'), payload, {
                onFinish: () => { setSubmitting(false); setShowModal(false); }
            });
        }
    }

    function destroyChannel(ch) {
        if (!confirm(`Delete channel "${ch.name}"?`)) return;
        router.delete(route('admin.channels.destroy', ch.id));
    }

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Channel Management</h1>}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-gray-700">Manage chat channels and role restrictions.</div>
                <button onClick={openCreate} className="px-3 py-1 bg-amber-500 text-white rounded">Create Channel</button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restricted To</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((c) => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{c.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{c.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{c.allowed_role ? c.allowed_role.name : 'Public'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(c)} className="px-3 py-1 bg-slate-200 rounded text-sm">Edit</button>
                                        <button onClick={() => destroyChannel(c)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4">
                {channels?.links ? (
                    <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                        {channels.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`} />
                        ))}
                    </nav>
                ) : null}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md bg-white rounded shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">{editing ? `Edit ${editing.name}` : 'Create Channel'}</h2>
                        <form onSubmit={submit}>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Restricted Role</label>
                                <select value={allowedRoleId} onChange={(e) => setAllowedRoleId(e.target.value)} className="mt-1 block w-full border rounded p-2">
                                    <option value="">None / Public</option>
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1 border rounded">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-3 py-1 bg-amber-500 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
