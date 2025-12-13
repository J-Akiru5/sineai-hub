import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function RolesIndex({ roles }) {
    const items = roles?.data ?? [];
    const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    function openCreate() {
      setEditing(null);
        setName('');
        setShowModal(true);
    }

  function openEdit(role) {
    setEditing(role);
    setName(role.name || '');
    setShowModal(true);
  }

    function submitCreate(e) {
        e.preventDefault();
        setSubmitting(true);
      if (editing) {
        router.patch(route('admin.roles.update', editing.id), { name }, {
          onFinish: () => {
            setSubmitting(false);
            setShowModal(false);
            setEditing(null);
          }
        });
      } else {
          router.post(route('admin.roles.store'), { name }, {
            onFinish: () => {
              setSubmitting(false);
              setShowModal(false);
            }
          });
        }
    }

    function destroyRole(role) {
        if (role.name.toLowerCase() === 'admin') return;
        if (!confirm(`Delete role "${role.name}"?`)) return;
        router.delete(route('admin.roles.destroy', role.id));
    }

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Role Management</h1>}>
            <div className="flex items-center justify-between mb-4">
                <div className="text-gray-700">Manage application roles used for authorization.</div>
                <button onClick={openCreate} className="px-3 py-1 bg-amber-500 text-white rounded">Create Role</button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((role) => (
                            <tr key={role.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{role.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{role.guard_name ?? role.guard}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{role.created_at ? new Date(role.created_at).toLocaleDateString() : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEdit(role)} className="px-3 py-1 bg-slate-200 rounded text-sm">Edit</button>
                                        <Link href={route('admin.roles.edit', role.id)} className="px-3 py-1 bg-slate-200 rounded text-sm">Edit Permissions</Link>
                                        <button disabled={role.name.toLowerCase() === 'admin'} onClick={() => destroyRole(role)} className={`px-3 py-1 rounded ${role.name.toLowerCase() === 'admin' ? 'bg-gray-200 text-gray-500' : 'bg-red-500 text-white'}`}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4">
                {roles?.links ? (
                    <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                        {roles.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`} />
                        ))}
                    </nav>
                ) : null}
            </div>

            {/* Create modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md bg-white rounded shadow p-6">
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Role' : 'Create Role'}</h2>
                        <form onSubmit={submitCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                            </div>
                            <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); setName(''); }} className="px-3 py-1 border rounded">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-3 py-1 bg-amber-500 text-white rounded">{editing ? 'Save' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
