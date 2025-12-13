import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
import { Chart, registerables } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

Chart.register(...registerables);

export default function Dashboard({ recentLogs = [], totalUsers = 0, totalProjects = 0, newUsersThisMonth = 0, usersOverTime = { labels: [], data: [] }, projectStatusDistribution = {}, totalChannels = 0, totalPublicProjects = 0, pendingApprovalCount = 0, openReportsCount = 0 }) {

    const userLineData = {
        labels: usersOverTime.labels || [],
        datasets: [
            {
                label: 'New Users',
                data: usersOverTime.data || [],
                fill: false,
                backgroundColor: 'rgba(34,197,94,0.5)',
                borderColor: 'rgba(34,197,94,1)',
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
            },
        ],
    };

    const logs = recentLogs ?? [];

    return (
        <AdminLayout header={<h1 className="text-2xl font-semibold">Admin Dashboard</h1>}>
            <div className="space-y-6">
                {/* Top stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded bg-white">
                        <div className="text-sm text-gray-500">Total Users</div>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </div>
                    <div className="p-4 border rounded bg-white">
                        <div className="text-sm text-gray-500">Total Projects</div>
                        <div className="text-2xl font-bold">{totalProjects}</div>
                    </div>
                    <div className="p-4 border rounded bg-white">
                        <div className="text-sm text-gray-500">New Users (This Month)</div>
                        <div className="text-2xl font-bold">{newUsersThisMonth}</div>
                    </div>
                    <div className="p-4 border rounded bg-white">
                        <div className="text-sm text-gray-500">Site Visits</div>
                        <div className="text-2xl font-bold">— Coming Soon</div>
                    </div>
                </div>

                {/* Community & Content stats row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded bg-white">
                        <div className="text-sm text-gray-500">Total Channels</div>
                        <div className="text-2xl font-bold">{totalChannels}</div>
                    </div>

                    <div className="p-4 border rounded bg-white">
                        <div className="text-sm text-gray-500">Public Premiere Projects</div>
                        <div className="text-2xl font-bold">{totalPublicProjects}</div>
                    </div>

                    <Link href={route('admin.moderation.index')} className="block">
                        <div className="p-4 border rounded bg-amber-100 hover:bg-amber-200 cursor-pointer">
                            <div className="text-sm text-gray-700">Pending Approvals</div>
                            <div className="text-2xl font-bold text-amber-800">{pendingApprovalCount}</div>
                        </div>
                    </Link>

                    <Link href={route('admin.moderation.index')} className="block">
                        <div className="p-4 border rounded bg-amber-100 hover:bg-amber-200 cursor-pointer">
                            <div className="text-sm text-gray-700">Open Reports</div>
                            <div className="text-2xl font-bold text-amber-800">{openReportsCount}</div>
                        </div>
                    </Link>
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 p-4 border rounded bg-white">
                        <h3 className="text-lg font-medium mb-2">User Growth (Last 6 months)</h3>
                        <div className="h-80">
                            <Line data={userLineData} />
                        </div>
                    </div>
                    <div className="p-4 border rounded bg-white">
                        <h3 className="text-lg font-medium mb-2">Project Status</h3>
                        <div className="h-80 flex items-center justify-center">
                            <Doughnut data={projectChartData} />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="p-4 border rounded bg-white">
                    <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Who</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">When</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.user ? log.user.name : 'System'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.action}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.created_at}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{log.description}</td>
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
