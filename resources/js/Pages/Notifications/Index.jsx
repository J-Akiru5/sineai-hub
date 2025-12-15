import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BellIcon, 
    ChatBubbleLeftIcon, 
    HeartIcon, 
    UserPlusIcon,
    AtSymbolIcon,
    FilmIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CheckIcon,
    TrashIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
    comment: ChatBubbleLeftIcon,
    like: HeartIcon,
    follow: UserPlusIcon,
    mention: AtSymbolIcon,
    project_update: FilmIcon,
    achievement: SparklesIcon,
    system: BellIcon,
    warning: ExclamationTriangleIcon,
};

const notificationColors = {
    comment: 'text-blue-400 bg-blue-500/10',
    like: 'text-pink-400 bg-pink-500/10',
    follow: 'text-purple-400 bg-purple-500/10',
    mention: 'text-cyan-400 bg-cyan-500/10',
    project_update: 'text-amber-400 bg-amber-500/10',
    achievement: 'text-yellow-400 bg-yellow-500/10',
    system: 'text-gray-400 bg-gray-500/10',
    warning: 'text-orange-400 bg-orange-500/10',
};

function NotificationItem({ notification, onMarkRead, onDelete }) {
    const Icon = notificationIcons[notification.type] || BellIcon;
    const colorClass = notificationColors[notification.type] || 'text-gray-400 bg-gray-500/10';
    const isUnread = !notification.read_at;

    return (
        <div 
            className={`
                group flex items-start gap-4 p-4 rounded-xl transition-all
                ${isUnread ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-slate-900/20 border border-transparent hover:border-white/5'}
            `}
        >
            {/* Icon */}
            <div className={`p-2.5 rounded-xl ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className={`text-sm ${isUnread ? 'text-amber-100 font-medium' : 'text-gray-300'}`}>
                            {notification.title}
                        </p>
                        {notification.message && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                            <button
                                onClick={() => onMarkRead(notification.id)}
                                className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-amber-400 transition-colors"
                                title="Mark as read"
                            >
                                <CheckIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(notification.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Unread indicator */}
            {isUnread && (
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-2" />
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
                <BellIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-amber-100 mb-2">No notifications yet</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
                When you get notifications about comments, likes, follows, and more, they'll show up here.
            </p>
        </div>
    );
}

export default function Notifications({ auth, notifications, unreadCount }) {
    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications?.data?.filter(n => {
        if (filter === 'unread') return !n.read_at;
        if (filter === 'read') return n.read_at;
        return true;
    }) || [];

    const handleMarkRead = (id) => {
        router.post(route('notifications.markAsRead', id), {}, {
            preserveScroll: true,
        });
    };

    const handleMarkAllRead = () => {
        router.post(route('notifications.markAllAsRead'), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id) => {
        router.delete(route('notifications.destroy', id), {
            preserveScroll: true,
        });
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            router.delete(route('notifications.clearAll'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Notifications</h2>}
        >
            <Head title="Notifications" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-amber-100">Notifications</h1>
                            {unreadCount > 0 && (
                                <span className="px-2.5 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    Mark all read
                                </button>
                            )}
                            {filteredNotifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 p-1 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl mb-6 w-fit">
                        {['all', 'unread', 'read'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`
                                    px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all
                                    ${filter === f 
                                        ? 'bg-amber-500/20 text-amber-400' 
                                        : 'text-gray-400 hover:text-amber-100 hover:bg-white/5'}
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Notifications list */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                        {filteredNotifications.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {filteredNotifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkRead={handleMarkRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    {/* Pagination */}
                    {notifications?.links && notifications.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex items-center gap-1">
                                {notifications.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`
                                            px-3 py-2 text-sm rounded-lg transition-colors
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
        </AuthenticatedLayout>
    );
}
