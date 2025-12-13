import { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function RoleEdit({ role, permissions, assigned }) {
    const [selected, setSelected] = useState(assigned ?? []);
    const [submitting, setSubmitting] = useState(false);

    function toggle(id) {
        setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    }

    function submit(e) {
        e.preventDefault();
        setSubmitting(true);
        router.patch(route('admin.roles.update', role.id), { permissions: selected }, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Edit Role Permissions</h1>}>
            <div className="p-4 bg-white rounded shadow">
                <h2 className="font-semibold mb-3">Role: {role.name}</h2>
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {permissions.map((perm) => (
                            <label key={perm.id} className="flex items-center gap-3">
                                <input type="checkbox" checked={selected.includes(perm.id)} onChange={() => toggle(perm.id)} />
                                <span className="text-sm">{perm.name}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2">
                        <a href={route('admin.roles.index')} className="px-3 py-1 border rounded">Back</a>
                        <button type="submit" disabled={submitting} className="px-3 py-1 bg-amber-500 text-white rounded">Save</button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
