import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Chart, registerables } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

Chart.register(...registerables);

export default function Dashboard({ recentLogs = [], totalUsers = 0, totalProjects = 0, newUsersThisMonth = 0, usersOverTime = { labels: [], data: [] }, projectStatusDistribution = {}, totalChannels = 0, totalPublicProjects = 0, pendingApprovalCount = 0, openReportsCount = 0, totalSiteVisits = 0, todaySiteVisits = 0, visitsOverTime = [] }) {

    const userLineData = {
        labels: usersOverTime.labels || [],
        datasets: [
            {
                label: 'New Users',
                data: usersOverTime.data || [],
                fill: true,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2,
                tension: 0.4,
                pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                pointBorderColor: '#1e293b',
                pointBorderWidth: 2,
            },
        ],
    };

    const projectLabels = Object.keys(projectStatusDistribution);
    const projectData = Object.values(projectStatusDistribution);

    const projectChartData = {
        labels: projectLabels,
        datasets: [
            {
                data: projectData,
                backgroundColor: ['#60A5FA', '#F97316', '#F43F5E', '#34D399', '#A78BFA'],
                borderColor: '#1e293b',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#94a3b8',
                    font: { size: 12 }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#64748b' },
                grid: { color: 'rgba(100, 116, 139, 0.1)' }
            },
            y: {
                ticks: { color: '#64748b' },
                grid: { color: 'rgba(100, 116, 139, 0.1)' }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { size: 12 },
                    padding: 16
                }
            }
        }
    };

    const logs = recentLogs ?? [];

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Admin Dashboard</h1>}>
            <div className="space-y-8">
                {/* Top stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400 font-medium">Total Users</div>
                                <div className="text-3xl font-bold text-white mt-1">{totalUsers}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400 font-medium">Total Projects</div>
                                <div className="text-3xl font-bold text-white mt-1">{totalProjects}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400 font-medium">New Users (This Month)</div>
                                <div className="text-3xl font-bold text-white mt-1">{newUsersThisMonth}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400 font-medium">Total Site Visits</div>
                                <div className="text-3xl font-bold text-white mt-1">{totalSiteVisits.toLocaleString()}</div>
                                <div className="text-xs text-emerald-400 mt-1">+{todaySiteVisits} today</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community & Content stats row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400 font-medium">Total Channels</div>
                                <div className="text-3xl font-bold text-white mt-1">{totalChannels}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-slate-400 font-medium">Public Premiere Projects</div>
                                <div className="text-3xl font-bold text-white mt-1">{totalPublicProjects}</div>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <Link href={route('admin.moderation.index')} className="block group">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-amber-400 font-medium">Pending Approvals</div>
                                    <div className="text-3xl font-bold text-amber-500 mt-1">{pendingApprovalCount}</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href={route('admin.moderation.index')} className="block group">
                        <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-red-400 font-medium">Open Reports</div>
                                    <div className="text-3xl font-bold text-red-500 mt-1">{openReportsCount}</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">User Growth (Last 6 months)</h3>
                        <div className="h-80">
                            <Line data={userLineData} options={chartOptions} />
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4">Project Status</h3>
                        <div className="h-80 flex items-center justify-center">
                            <Doughnut data={projectChartData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                        <table className="min-w-full divide-y divide-slate-700/50">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Who</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Action</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">When</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No recent activity</td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {(log.user?.name || 'S').split(' ').map(p => p[0]).slice(0, 2).join('')}
                                                </div>
                                                <span className="text-white font-medium">{log.user ? log.user.name : 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-slate-700/50 rounded-lg text-xs font-medium">{log.action}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{log.created_at}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">{log.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
