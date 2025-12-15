import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    MagnifyingGlassIcon, 
    CheckBadgeIcon,
    XMarkIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    UsersIcon,
    FilmIcon,
    UserPlusIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

function StatCard({ title, value, icon: Icon, color = 'amber' }) {
    const colorClasses = {
        amber: 'bg-amber-500/10 text-amber-400',
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-amber-100">{value}</p>
                    <p className="text-sm text-gray-400">{title}</p>
                </div>
            </div>
        </div>
    );
}

function CreatorRow({ creator, onVerify }) {
    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerify = () => {
        setIsVerifying(true);
        router.patch(route('admin.creators.verify', creator.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsVerifying(false),
        });
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/2">
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium">
                                {(creator.name || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-amber-100">{creator.name}</span>
                            {creator.is_verified_creator && (
                                <CheckBadgeSolid className="w-4 h-4 text-amber-400" />
                            )}
                        </div>
                        <span className="text-sm text-gray-400">
                            {creator.username ? `@${creator.username}` : creator.email}
                        </span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <span className="text-amber-100">{creator.projects_count || 0}</span>
            </td>
            <td className="px-4 py-4 text-center">
                <span className="text-amber-100">{creator.followers_count || 0}</span>
            </td>
            <td className="px-4 py-4">
                {creator.is_verified_creator ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                        <CheckBadgeSolid className="w-3 h-3" />
                        Verified
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-500/20 text-gray-400 rounded-full">
                        Not Verified
                    </span>
                )}
            </td>
            <td className="px-4 py-4 text-sm text-gray-400">
                {format(new Date(creator.created_at), 'MMM d, yyyy')}
            </td>
            <td className="px-4 py-4">
                <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className={`
                        px-3 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50
                        ${creator.is_verified_creator
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}
                    `}
                >
                    {creator.is_verified_creator ? 'Remove Verification' : 'Verify Creator'}
                </button>
            </td>
        </tr>
    );
}

export default function CreatorsIndex({ creators, stats, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [verified, setVerified] = useState(filters?.verified || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.creators.index'), {
            search,
            verified,
            sort: filters?.sort,
            direction: filters?.direction,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (field) => {
        const direction = filters?.sort === field && filters?.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('admin.creators.index'), {
            search: filters?.search,
            verified: filters?.verified,
            sort: field,
            direction,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const SortIcon = ({ field }) => {
        if (filters?.sort !== field) return null;
        return filters?.direction === 'asc' 
            ? <ChevronUpIcon className="w-4 h-4" />
            : <ChevronDownIcon className="w-4 h-4" />;
    };

    return (
        <AdminLayout>
            <Head title="Creator Management" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-amber-100">Creator Management</h1>
                    <p className="text-gray-400 mt-1">Manage creator accounts and verification status</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Creators" value={stats?.total_creators || 0} icon={UsersIcon} color="amber" />
                    <StatCard title="Verified Creators" value={stats?.verified_creators || 0} icon={CheckBadgeIcon} color="green" />
                    <StatCard title="New This Month" value={stats?.new_this_month || 0} icon={UserPlusIcon} color="blue" />
                    <StatCard title="With Projects" value={stats?.with_projects || 0} icon={FilmIcon} color="purple" />
                </div>

                {/* Filters */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, email, or username..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-amber-100 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={verified}
                            onChange={(e) => {
                                setVerified(e.target.value);
                                router.get(route('admin.creators.index'), {
                                    search,
                                    verified: e.target.value,
                                    sort: filters?.sort,
                                    direction: filters?.direction,
                                }, { preserveState: true, preserveScroll: true });
                            }}
                            className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-amber-100 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">All Status</option>
                            <option value="verified">Verified Only</option>
                            <option value="unverified">Unverified Only</option>
                        </select>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-slate-800/30">
                                    <th 
                                        className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-amber-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        <span className="flex items-center gap-1">
                                            Creator
                                            <SortIcon field="name" />
                                        </span>
                                    </th>
                                    <th 
                                        className="px-4 py-3 text-center text-sm font-medium text-gray-400 cursor-pointer hover:text-amber-100"
                                        onClick={() => handleSort('projects_count')}
                                    >
                                        <span className="flex items-center justify-center gap-1">
                                            Projects
                                            <SortIcon field="projects_count" />
                                        </span>
                                    </th>
                                    <th 
                                        className="px-4 py-3 text-center text-sm font-medium text-gray-400 cursor-pointer hover:text-amber-100"
                                        onClick={() => handleSort('followers_count')}
                                    >
                                        <span className="flex items-center justify-center gap-1">
                                            Followers
                                            <SortIcon field="followers_count" />
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        Status
                                    </th>
                                    <th 
                                        className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-amber-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <span className="flex items-center gap-1">
                                            Joined
                                            <SortIcon field="created_at" />
                                        </span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {creators?.data?.map((creator) => (
                                    <CreatorRow key={creator.id} creator={creator} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {(!creators?.data || creators.data.length === 0) && (
                        <div className="text-center py-12">
                            <UsersIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No creators found</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {creators?.links && creators.links.length > 3 && (
                        <div className="px-4 py-3 border-t border-white/5">
                            <nav className="flex items-center justify-center gap-1">
                                {creators.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`
                                            px-3 py-1.5 text-sm rounded-lg transition-colors
                                            ${link.active 
                                                ? 'bg-amber-500/20 text-amber-400' 
                                                : link.url 
                                                    ? 'text-gray-400 hover:bg-white/5 hover:text-amber-100' 
                                                    : 'text-gray-600 cursor-not-allowed'}
                                        `}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
