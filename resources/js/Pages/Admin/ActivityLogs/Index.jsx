import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';

export default function ActivityLogsIndex({ logs, filters = {} }) {
    const items = logs?.data ?? [];
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');

    const categoryColors = {
        'ROLE_MGMT': 'bg-blue-100 text-blue-800',
        'CONTENT': 'bg-green-100 text-green-800',
        'AUTH': 'bg-gray-100 text-gray-800',
        'USER_MGMT': 'bg-yellow-100 text-yellow-800',
        'AI_USAGE': 'bg-purple-100 text-purple-800',
        'SYSTEM': 'bg-red-100 text-red-800',
    };

    // Ensure newest first (server already returns latest, but enforce here)
    const sortedItems = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    function applyFilters(e) {
        e && e.preventDefault();
        router.get(route('admin.activity-logs.index'), { search: search || undefined, category: category || undefined }, { preserveState: true, replace: true });
    }

    function resetFilters() {
        setSearch('');
        setCategory('');
        router.get(route('admin.activity-logs.index'), {}, { preserveState: true, replace: true });
    }

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Activity Logs</h1>}>
            <div className="mb-4 flex items-center gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description or action..." className="border rounded px-3 py-2" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-3 py-2">
                    <option value="">All Categories</option>
                    <option value="AUTH">AUTH</option>
                    <option value="USER_MGMT">USER_MGMT</option>
                    <option value="ROLE_MGMT">ROLE_MGMT</option>
                    <option value="CONTENT">CONTENT</option>
                    <option value="SYSTEM">SYSTEM</option>
                </select>
                <button onClick={applyFilters} className="px-3 py-1 bg-amber-500 text-white rounded">Apply</button>
                <button onClick={resetFilters} className="px-3 py-1 border rounded">Reset</button>
                <button onClick={() => router.get(route('admin.activity-logs.index'), {}, { preserveState: true, replace: true })} className="px-3 py-1 border rounded">Refresh</button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">When</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedItems.map((log) => (
                            <tr key={log.id}>
                                <td className="px-4 py-2 whitespace-nowrap flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-600 text-white flex items-center justify-center">{(log.user?.name || 'S').split(' ').map(p => p[0]).slice(0,2).join('')}</div>
                                    <div>{log.user ? log.user.name : 'System'}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">{log.action}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{log.description}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[log.category] ?? 'bg-slate-100 text-slate-800'}`}>{log.category}</span>
                                        </td>
                                <td className="px-4 py-2 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                {logs?.links ? (
                    <nav className="inline-flex -space-x-px rounded-md" aria-label="Pagination">
                        {logs.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-3 py-1 border ${link.active ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}`} />
                        ))}
                    </nav>
                ) : null}
            </div>
        </AdminLayout>
    );
}
