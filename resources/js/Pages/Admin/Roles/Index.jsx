import { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Swal from 'sweetalert2';
import { Search, Shield, RefreshCw, Plus } from 'lucide-react';

// SweetAlert2 theme for admin panel
const swalTheme = {
    background: '#1e293b',
    color: '#f1f5f9',
    confirmButtonColor: '#f59e0b',
    cancelButtonColor: '#475569',
    iconColor: '#f59e0b',
};

export default function RolesIndex({ roles, filters = {} }) {
    const items = roles?.data ?? [];
    const [search, setSearch] = useState(filters.search || '');
    const debounceRef = useRef(null);
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
          onSuccess: () => {
            Swal.fire({
              ...swalTheme,
              title: 'Role Updated!',
              text: `${name} has been updated successfully.`,
              icon: 'success',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          },
          onFinish: () => {
            setSubmitting(false);
            setShowModal(false);
            setEditing(null);
          }
        });
      } else {
          router.post(route('admin.roles.store'), { name }, {
            onSuccess: () => {
              Swal.fire({
                ...swalTheme,
                title: 'Role Created!',
                text: `${name} has been created successfully.`,
                icon: 'success',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
              });
            },
            onFinish: () => {
              setSubmitting(false);
              setShowModal(false);
            }
          });
        }
    }

    function destroyRole(role) {
        if (role.name.toLowerCase() === 'admin') return;
        
        Swal.fire({
            ...swalTheme,
            title: 'Delete Role?',
            html: `<p class="text-slate-400">Are you sure you want to delete "<span class="text-white font-medium">${role.name}</span>"?</p><p class="text-red-400 text-sm mt-2">Users with this role will lose these permissions.</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.roles.destroy', role.id), {
                    onSuccess: () => {
                        Swal.fire({
                            ...swalTheme,
                            title: 'Deleted!',
                            text: 'The role has been removed.',
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

    // Search with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            router.get(route('admin.roles.index'), {
                search: search || undefined,
            }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Role Management</h1>}>
            {/* Search & Filter Toolbar */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search roles..."
                            className="pl-10 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors w-64"
                        />
                    </div>
                    <button
                        onClick={() => router.get(route('admin.roles.index'), {}, { preserveState: true, replace: true })}
                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
                <button onClick={openCreate} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Role
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="min-w-full divide-y divide-slate-700/50">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Guard</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {items.map((role) => (
                            <tr key={role.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </span>
                                        <span className="font-medium text-white">{role.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs font-medium">{role.guard_name ?? role.guard}</span>
                                </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{role.created_at ? new Date(role.created_at).toLocaleDateString() : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEdit(role)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">Edit</button>
                                        <Link href={route('admin.roles.edit', role.id)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">Permissions</Link>
                                        <button disabled={role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'super-admin'} onClick={() => destroyRole(role)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${role.name.toLowerCase() === 'admin' || role.name.toLowerCase() === 'super-admin' ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
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
            <div className="mt-6">
                {roles?.links ? (
                    <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                        {roles.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} transition-colors`} />
                        ))}
                    </nav>
                ) : null}
            </div>

            {/* Create/Edit modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit Role' : 'Create Role'}</h2>
                        <form onSubmit={submitCreate}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Role Name</label>
                                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" placeholder="e.g., moderator" />
                            </div>
                            <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); setName(''); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors disabled:opacity-50">{editing ? 'Save' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
