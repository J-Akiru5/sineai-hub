import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';

export default function ActivityLogsIndex({ logs, filters = {} }) {
    const items = logs?.data ?? [];
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');

    const categoryColors = {
        'ROLE_MGMT': 'bg-blue-500/10 text-blue-400',
        'CONTENT': 'bg-emerald-500/10 text-emerald-400',
        'AUTH': 'bg-slate-500/10 text-slate-400',
        'USER_MGMT': 'bg-amber-500/10 text-amber-400',
        'AI_USAGE': 'bg-purple-500/10 text-purple-400',
        'SYSTEM': 'bg-red-500/10 text-red-400',
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
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description or action..." className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-colors">
                    <option value="">All Categories</option>
                    <option value="AUTH">AUTH</option>
                    <option value="USER_MGMT">USER_MGMT</option>
                    <option value="ROLE_MGMT">ROLE_MGMT</option>
                    <option value="CONTENT">CONTENT</option>
                    <option value="SYSTEM">SYSTEM</option>
                </select>
                <button onClick={applyFilters} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-medium transition-colors">Apply</button>
                <button onClick={resetFilters} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors">Reset</button>
                <button onClick={() => router.get(route('admin.activity-logs.index'), {}, { preserveState: true, replace: true })} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="min-w-full divide-y divide-slate-700/50">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">User</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Action</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">When</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {sortedItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                    <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    No activity logs found
                                </td>
                            </tr>
                        ) : sortedItems.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                                            {(log.user?.name || 'S').split(' ').map(p => p[0]).slice(0,2).join('')}
                                        </div>
                                        <span className="text-white font-medium">{log.user ? log.user.name : 'System'}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs font-medium">{log.action}</span>
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate">{log.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[log.category] ?? 'bg-slate-500/10 text-slate-400'}`}>{log.category}</span>
                                        </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                {logs?.links ? (
                    <nav className="inline-flex -space-x-px rounded-lg overflow-hidden border border-slate-700/50" aria-label="Pagination">
                        {logs.links.map((link, idx) => (
                            <a key={idx} href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} className={`px-4 py-2 text-sm font-medium ${link.active ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'} transition-colors`} />
                        ))}
                    </nav>
                ) : null}
            </div>
        </AdminLayout>
    );
}
