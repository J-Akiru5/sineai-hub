import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import UserAvatar from '@/Components/UserAvatar';
import UserBadge, { UserPosition } from '@/Components/UserBadge';
import Swal from 'sweetalert2';
import { X, Plus, Search, Filter, Shield, Ban, Edit3, UserPlus } from 'lucide-react';

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
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPosition, setEditPosition] = useState('');
    const [editTags, setEditTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Create user modal state
    const [showCreate, setShowCreate] = useState(false);
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createRole, setCreateRole] = useState(roles[0]?.id || '');
    const [createPosition, setCreatePosition] = useState('');
    const [createTags, setCreateTags] = useState([]);
    const [createNewTag, setCreateNewTag] = useState('');
    const [createSubmitting, setCreateSubmitting] = useState(false);

    const { props } = usePage();
    const currentUser = props?.auth?.user || null;

    // Suggested positions for autocomplete
    const suggestedPositions = [
        'President',
        'Vice President',
        'Secretary',
        'Director of Technology and Innovations',
        'Director of Cultural Heritage',
        'Director of External Affairs',
    ];

    // Suggested tags
    const suggestedTags = [
        'Leadership', 'Executive Board', 'Tech Team', 'Productions',
        'Casting', 'Documentation', 'External Affairs', 'Cultural Heritage',
        'Innovations', 'Partnerships'
    ];

    function openModal(user) {
        setSelectedUser(user);
        setSelectedRoles((user.roles || []).map((r) => r.id));
        setEditName(user.name || '');
        setEditEmail(user.email || '');
        setEditPosition(user.position || '');
        setEditTags(user.tags || []);
        setNewTag('');
        setShowModal(true);
    }

    function addTag(tag, isCreate = false) {
        const trimmed = tag.trim();
        if (!trimmed) return;
        
        if (isCreate) {
            if (!createTags.includes(trimmed)) {
                setCreateTags([...createTags, trimmed]);
            }
            setCreateNewTag('');
        } else {
            if (!editTags.includes(trimmed)) {
                setEditTags([...editTags, trimmed]);
            }
            setNewTag('');
        }
    }

    function removeTag(tag, isCreate = false) {
        if (isCreate) {
            setCreateTags(createTags.filter(t => t !== tag));
        } else {
            setEditTags(editTags.filter(t => t !== tag));
        }
    }

    function toggleRole(roleId) {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
        );
    }

    function submitEdit(e) {
        e.preventDefault();
        if (!selectedUser) return;
        setSubmitting(true);
        router.patch(route('admin.users.update', selectedUser.id), { 
            roles: selectedRoles,
            name: editName,
            email: editEmail,
            position: editPosition || null,
            tags: editTags.length > 0 ? editTags : null,
        }, {
            onSuccess: () => {
                Swal.fire({
                    ...swalTheme,
                    title: 'User Updated',
                    text: `${editName} has been updated successfully.`,
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
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="pl-10 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" />
                    </div>
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
                <UserPlus className="w-5 h-5" />
                Add User
            </button>
          </div>
        </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
                <table className="min-w-full divide-y divide-slate-700/50">
                    <thead className="bg-slate-800/50">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Position & Tags</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Roles</th>
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
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">{user.name}</span>
                                  <UserBadge user={user} size="xs" showLabel={false} />
                                  {user.is_banned && (
                                    <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">BANNED</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-300">{user.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                {user.position && (
                                  <span className="text-amber-400 text-sm font-medium">{user.position}</span>
                                )}
                                {user.tags && user.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {user.tags.slice(0, 3).map((tag, idx) => (
                                      <span key={idx} className="px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs">{tag}</span>
                                    ))}
                                    {user.tags.length > 3 && (
                                      <span className="px-1.5 py-0.5 text-slate-500 text-xs">+{user.tags.length - 3}</span>
                                    )}
                                  </div>
                                )}
                                {!user.position && (!user.tags || user.tags.length === 0) && (
                                  <span className="text-slate-500 text-sm">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {(user.roles || []).map((r) => (
                                    <span key={r.id} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium">{r.name}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openModal(user)} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit
                                    </button>
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

            {/* Edit User Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UserAvatar user={selectedUser} size={10} />
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Edit User</h2>
                                    <p className="text-sm text-slate-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={submitEdit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                    <input 
                                        value={editName} 
                                        onChange={(e) => setEditName(e.target.value)} 
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                    <input 
                                        type="email"
                                        value={editEmail} 
                                        onChange={(e) => setEditEmail(e.target.value)} 
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" 
                                    />
                                </div>
                            </div>

                            {/* Position */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Position / Title</label>
                                <input 
                                    value={editPosition} 
                                    onChange={(e) => setEditPosition(e.target.value)} 
                                    placeholder="e.g., Director of Technology"
                                    list="position-suggestions"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" 
                                />
                                <datalist id="position-suggestions">
                                    {suggestedPositions.map((pos, idx) => (
                                        <option key={idx} value={pos} />
                                    ))}
                                </datalist>
                                <p className="text-xs text-slate-500 mt-1">Leave empty for regular members</p>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {editTags.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-sm">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        value={newTag} 
                                        onChange={(e) => setNewTag(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                                        placeholder="Add a tag..."
                                        list="tag-suggestions"
                                        className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" 
                                    />
                                    <button type="button" onClick={() => addTag(newTag)} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <datalist id="tag-suggestions">
                                    {suggestedTags.filter(t => !editTags.includes(t)).map((tag, idx) => (
                                        <option key={idx} value={tag} />
                                    ))}
                                </datalist>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {suggestedTags.filter(t => !editTags.includes(t)).slice(0, 5).map((tag, idx) => (
                                        <button 
                                            key={idx} 
                                            type="button" 
                                            onClick={() => addTag(tag)} 
                                            className="px-2 py-0.5 text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Roles */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Roles</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {roles.map((role) => (
                                        <label key={role.id} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${selectedRoles.includes(role.id) ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedRoles.includes(role.id)} 
                                                onChange={() => toggleRole(role.id)} 
                                                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/20" 
                                            />
                                            <span className={`text-sm ${selectedRoles.includes(role.id) ? 'text-amber-400 font-medium' : 'text-slate-300'}`}>
                                                {role.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        {/* Create User Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  Create New User
                </h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                setCreateSubmitting(true);
                router.post(route('admin.users.store'), {
                  name: createName,
                  email: createEmail,
                  role: createRole,
                  position: createPosition || null,
                  tags: createTags.length > 0 ? createTags : null,
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
                    setCreatePosition('');
                    setCreateTags([]);
                    router.get(route('admin.users.index'));
                  }
                });
              }} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Name *</label>
                    <input required value={createName} onChange={(e) => setCreateName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="Enter name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email *</label>
                    <input required type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="Enter email" />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Role *</label>
                  <select required value={createRole} onChange={(e) => setCreateRole(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors">
                    <option value="">Select role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Position / Title</label>
                  <input 
                    value={createPosition} 
                    onChange={(e) => setCreatePosition(e.target.value)} 
                    placeholder="e.g., Director of Technology"
                    list="create-position-suggestions"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" 
                  />
                  <datalist id="create-position-suggestions">
                    {suggestedPositions.map((pos, idx) => (
                      <option key={idx} value={pos} />
                    ))}
                  </datalist>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {createTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag, true)} className="hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      value={createNewTag} 
                      onChange={(e) => setCreateNewTag(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(createNewTag, true))}
                      placeholder="Add a tag..."
                      list="create-tag-suggestions"
                      className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" 
                    />
                    <button type="button" onClick={() => addTag(createNewTag, true)} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <datalist id="create-tag-suggestions">
                    {suggestedTags.filter(t => !createTags.includes(t)).map((tag, idx) => (
                      <option key={idx} value={tag} />
                    ))}
                  </datalist>
                </div>

                {/* Password note */}
                <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
                  <span className="font-medium">Note:</span> Default password will be: <code className="bg-slate-800 px-2 py-0.5 rounded">password</code>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={createSubmitting} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                    {createSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </AdminLayout>
    );
}
