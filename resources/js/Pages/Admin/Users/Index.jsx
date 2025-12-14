import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import UserAvatar from '@/Components/UserAvatar';
import Swal from 'sweetalert2';

// SweetAlert2 theme for admin panel
const swalTheme = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#475569',
    iconColor: '#f59e0b',
};

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
  // Create user modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState(roles[0]?.id || '');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const { props } = usePage();
  const currentUser = props?.auth?.user || null;

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
            onSuccess: () => {
                Swal.fire({
                    ...swalTheme,
                    title: 'Roles Updated',
                    text: `Roles for ${selectedUser.name} have been updated.`,
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            },
            onFinish: () => {
                setSubmitting(false);
                setShowModal(false);
            },
        });
    }

    function handleBanToggle(user) {
        const isSelf = currentUser && currentUser.id === user.id;
        const userRoleNames = (user.roles || []).map((r) => (r.name || '').toLowerCase());
        const isAdmin = userRoleNames.includes('admin') || userRoleNames.includes('super-admin');

        if (isSelf || isAdmin) return;

        const action = user.is_banned ? 'Unban' : 'Ban';
        const actionPast = user.is_banned ? 'unbanned' : 'banned';

        Swal.fire({
            ...swalTheme,
            title: `${action} User?`,
            html: `<p class="text-slate-400">Are you sure you want to ${action.toLowerCase()} "<span class="text-white font-medium">${user.name}</span>"?</p>`,
            icon: user.is_banned ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonText: `Yes, ${action}`,
            confirmButtonColor: user.is_banned ? '#10b981' : '#dc2626',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('admin.users.ban', user.id), {}, {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: `User ${actionPast}!`,
                            text: `${user.name} has been ${actionPast}.`,
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
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors">
                        <option value="">All Roles</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="banned">Banned</option>
                    </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
            </button>
          </div>
        </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="min-w-full divide-y divide-slate-700/50">
                    <thead>
              <tr>
                <th className="px-4 py-3" />
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3" />
              </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {items.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <UserAvatar user={user} size={10} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{user.name}</span>
                                {user.is_banned && (
                                  <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">BANNED</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {(user.roles || []).map((r) => (
                                    <span key={r.id} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">{r.name}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openModal(user)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors">Manage Roles</button>
                              {/* Ban button: hide/disable for current user or admins */}
                              {(() => {
                                const isSelf = currentUser && currentUser.id === user.id;
                                const userRoleNames = (user.roles || []).map((r) => (r.name || '').toLowerCase());
                                const isAdmin = userRoleNames.includes('admin') || userRoleNames.includes('super-admin');
                                const canBan = !isSelf && !isAdmin;

                                if (!canBan) {
                                  return (
                                    <button disabled title={isSelf ? 'You cannot ban yourself' : 'Cannot ban an administrator'} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-500 cursor-not-allowed text-sm font-medium">
                                      {user.is_banned ? 'Unban' : 'Ban'}
                                    </button>
                                  );
                                }

                                return (
                                    <button onClick={() => handleBanToggle(user)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${user.is_banned ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
                                        {user.is_banned ? 'Unban' : 'Ban'}
                                    </button>
                                );
                              })()}
                                </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6">
                {users?.links ? (
                    <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                        {users.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} transition-colors`} />
                        ))}
                    </nav>
                ) : null}
            </div>

            {/* Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Manage Roles for <span className="text-amber-500">{selectedUser.name}</span></h2>
                        <form onSubmit={submitRoles}>
                            <div className="space-y-3 mb-6">
                                {roles.map((role) => (
                                    <label key={role.id} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                                        <input type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => toggleRole(role.id)} className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/20" />
                                        <span className="text-white">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        {/* Create User Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Create User</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                setCreateSubmitting(true);
                router.post(route('admin.users.store'), {
                  name: createName,
                  email: createEmail,
                  role: createRole,
                }, {
                  onSuccess: () => {
                    Swal.fire({
                      ...swalTheme,
                      title: 'User Created!',
                      text: `${createName} has been created successfully.`,
                      icon: 'success',
                      timer: 2000,
                      timerProgressBar: true,
                      showConfirmButton: false,
                    });
                  },
                  onFinish: () => {
                    setCreateSubmitting(false);
                    setShowCreate(false);
                    setCreateName('');
                    setCreateEmail('');
                    setCreateRole(roles[0]?.id || '');
                    // refresh list
                    router.get(route('admin.users.index'));
                  }
                });
              }}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                    <input required value={createName} onChange={(e) => setCreateName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="Enter name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input required type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="Enter email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Role</label>
                    <select required value={createRole} onChange={(e) => setCreateRole(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors">
                      <option value="">Select role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
                    <span className="font-medium">Note:</span> Default password will be: <code className="bg-slate-800 px-2 py-0.5 rounded">password</code>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={createSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
        </AdminLayout>
    );
}
