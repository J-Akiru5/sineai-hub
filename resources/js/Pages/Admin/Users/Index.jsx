import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UsersIndex({ users, roles, filters = {} }) {
    const items = users?.data ?? [];
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const debounceRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    function openModal(user) {
        setSelectedUser(user);
        setSelectedRoles((user.roles || []).map((r) => r.id));
        setShowModal(true);
    }

    function toggleRole(roleId) {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
        );
    }

    function submitRoles(e) {
        e.preventDefault();
        if (!selectedUser) return;
        setSubmitting(true);
        router.patch(route('admin.users.update', selectedUser.id), { roles: selectedRoles }, {
            onFinish: () => {
                setSubmitting(false);
                setShowModal(false);
            },
        });
    }

    // Watch search input and debounce requests
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('admin.users.index'), {
                search: search || undefined,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
            }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // Immediate filter change for role/status
    useEffect(() => {
        router.get(route('admin.users.index'), {
            search: search || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
        }, { preserveState: true, replace: true });
    }, [roleFilter, statusFilter]);

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Users</h1>}>
            {/* Toolbar: search / role / status filters */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="border rounded px-3 py-2" />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded px-3 py-2">
                        <option value="">All Roles</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span>{user.name}</span>
                                        {user.is_banned && (
                                            <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">BANNED</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(user.roles || []).map((r) => r.name).join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => openModal(user)} className="px-3 py-1 bg-amber-500 text-white rounded">Manage Roles</button>
                                    <button onClick={() => {
                                        router.patch(route('admin.users.ban', user.id));
                                    }} className={`ml-2 px-3 py-1 rounded ${user.is_banned ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}>
                                        {user.is_banned ? 'Unban' : 'Ban'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4">
                {users?.links ? (
                    <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                        {users.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`} />
                        ))}
                    </nav>
                ) : null}
            </div>

            {/* Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-lg bg-white rounded shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Manage Roles for {selectedUser.name}</h2>
                        <form onSubmit={submitRoles}>
                            <div className="space-y-2 mb-4">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center gap-3">
                                        <input type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => toggleRole(role.id)} />
                                        <span>{role.name}</span>
                                    </label>
                                ))}
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
