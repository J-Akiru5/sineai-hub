import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Upload, MessageCircle, Sparkles, Eye, FolderOpen, FileText, Play,
    TrendingUp, Clock, ChevronRight, Film, Clapperboard, Quote, Star,
    Users, Activity, Zap
} from 'lucide-react';

// Motivational quotes for filmmakers
const quotes = [
    { text: "Cinema is a mirror by which we often see ourselves.", author: "Alejandro González Iñárritu" },
    { text: "Every frame is a painting.", author: "Akira Kurosawa" },
    { text: "The script is what you've dreamed up—this is what it looks like.", author: "Steven Spielberg" },
    { text: "A film is never really good unless the camera is an eye in the head of a poet.", author: "Orson Welles" },
    { text: "Great stories resonate. They stick with us forever.", author: "Christopher Nolan" },
];

// Get a deterministic quote based on the day
const getTodaysQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
};

export default function Dashboard({
    auth,
    recentProjects = [],
    recentScripts = [],
    stats = {},
    trendingProject = null,
    unreadChannels = [],
    errors = {}
}) {
    const projects = recentProjects || [];
    const scripts = recentScripts || [];
    const channels = unreadChannels || [];
    const todaysQuote = getTodaysQuote();

    // Mock trending project if not provided
    const trending = trendingProject || (projects.length > 0 ? projects[0] : null);

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={<h2 className="font-semibold text-xl text-amber-100 leading-tight">Mission Control</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1800px] mx-auto">

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-[minmax(140px,auto)]">

                        {/* Hero Section - Welcome (2x2 on desktop) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 row-span-2 group">
                            <div className="h-full bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:p-8 relative overflow-hidden hover:border-amber-500/30 transition-all duration-500">
                                {/* Decorative gradient orbs */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
                                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <p className="text-amber-500/80 text-sm font-medium uppercase tracking-wider mb-2">Welcome back</p>
                                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                                                {auth?.user?.name ?? 'Creator'}
                                            </h1>
                                            <p className="text-slate-400">Ready to create something amazing?</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                            <Clapperboard className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Daily Quote */}
                                    <div className="mt-8 p-5 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-start gap-3">
                                            <Quote className="w-6 h-6 text-amber-500/60 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="text-slate-300 italic text-lg leading-relaxed">"{todaysQuote.text}"</p>
                                                <p className="text-amber-500/80 text-sm mt-2">— {todaysQuote.author}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions (1x2 on desktop) */}
                        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 row-span-2">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
                                <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Zap className="w-3 h-3" />
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <Link
                                        href={route('scriptwriter.index')}
                                        className="group flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>New Script</span>
                                    </Link>
                                    <Link
                                        href={route('projects.create')}
                                        className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10 hover:border-amber-500/30"
                                    >
                                        <Upload className="w-5 h-5 text-amber-500" />
                                        <span>Upload Project</span>
                                    </Link>
                                    <Link
                                        href={route('ai.assistant')}
                                        className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10 hover:border-amber-500/30"
                                    >
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <span>Ask Spark</span>
                                    </Link>
                                    <Link
                                        href={route('chat')}
                                        className="group flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10 hover:border-amber-500/30"
                                    >
                                        <MessageCircle className="w-5 h-5 text-blue-400" />
                                        <span>Community</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Stat Cards Row */}
                        {/* Total Views */}
                        <div className="col-span-1">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Views</p>
                                        <p className="text-3xl font-bold text-white">{stats?.total_views?.toLocaleString() ?? '0'}</p>
                                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            Premiere
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                        <Eye className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Projects */}
                        <div className="col-span-1">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Projects</p>
                                        <p className="text-3xl font-bold text-white">{stats?.projects_count ?? '0'}</p>
                                        <p className="text-xs text-amber-400 mt-1">Active</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                                        <FolderOpen className="w-5 h-5 text-amber-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Draft Scripts */}
                        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Scripts</p>
                                        <p className="text-3xl font-bold text-white">{stats?.scripts_count ?? scripts.length}</p>
                                        <p className="text-xs text-purple-400 mt-1">Drafts</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                                        <FileText className="w-5 h-5 text-purple-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="col-span-1">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 group">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Messages</p>
                                        <p className="text-3xl font-bold text-white">{stats?.unread_messages ?? '0'}</p>
                                        <p className="text-xs text-blue-400 mt-1">Unread</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                                        <MessageCircle className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* On Deck - Recent Scripts (2x1) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        On Deck
                                    </h3>
                                    <Link href={route('scriptwriter.index')} className="text-xs text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                        View all <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {scripts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center py-8">
                                        <FileText className="w-12 h-12 text-slate-600 mb-3" />
                                        <p className="text-slate-400 mb-4">No scripts yet</p>
                                        <Link
                                            href={route('scriptwriter.index')}
                                            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Create your first script
                                        </Link>
                                    </div>
                                ) : (
                                        <div className="space-y-3">
                                            {scripts.slice(0, 3).map((script) => (
                                                <Link
                                                    key={script.id}
                                                    href={route('scriptwriter.index')}
                                                    className="flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all group"
                                                >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-amber-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate group-hover:text-amber-500 transition-colors">
                                                        {script.title || 'Untitled Script'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {script.updated_at ? new Date(script.updated_at).toLocaleDateString() : 'Recently'}
                                                    </p>
                                                </div>
                                                <button className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-500 hover:text-slate-900 rounded-lg text-xs font-medium transition-all opacity-0 group-hover:opacity-100">
                                                    Continue
                                                </button>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Premiere Pulse - Trending Video (2x2) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 row-span-2">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                        <Star className="w-3 h-3" />
                                        Premiere Pulse
                                    </h3>
                                    <Link href={route('premiere.index')} className="text-xs text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                        Explore <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {trending ? (
                                    <Link href={route('premiere.show', trending.id)} className="block group">
                                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                                            {trending.thumbnail_url ? (
                                                <img
                                                    src={trending.thumbnail_url}
                                                    alt={trending.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                                        <Film className="w-12 h-12 text-slate-600" />
                                                    </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <p className="text-white font-semibold truncate">{trending.title}</p>
                                                <p className="text-xs text-slate-300">{trending.user?.name || 'Unknown Creator'}</p>
                                            </div>
                                            <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Trending
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-14 h-14 rounded-full bg-amber-500/90 flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-center">
                                        <Film className="w-12 h-12 text-slate-600 mb-3" />
                                        <p className="text-slate-400 mb-4">No trending content yet</p>
                                        <Link
                                            href={route('premiere.index')}
                                            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Explore Premiere
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comms - Chat Widget (2x1) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2">
                            <div className="h-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                        <Users className="w-3 h-3" />
                                        Community Comms
                                    </h3>
                                    <Link href={route('chat')} className="text-xs text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                        Open Chat <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {channels.length === 0 ? (
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-300">All caught up!</p>
                                            <p className="text-xs text-slate-500">No unread messages</p>
                                        </div>
                                        <Link href={route('chat')} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                                            Join Chat
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {channels.slice(0, 3).map((channel, idx) => (
                                            <Link
                                                key={idx}
                                                href={route('chat')}
                                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-blue-500/20 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <span className="text-blue-400 text-sm font-bold">#</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">{channel.name || 'General'}</p>
                                                </div>
                                                {channel.unread_count > 0 && (
                                                    <span className="px-2 py-0.5 bg-amber-500 text-slate-900 text-xs font-bold rounded-full">
                                                        {channel.unread_count}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Projects (Full Width) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-6">
                            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-3 h-3" />
                                        Recent Projects
                                    </h3>
                                    <Link href={route('projects.index')} className="text-xs text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                        View all <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>

                                {projects.length === 0 ? (
                                    <div className="flex items-center justify-center py-12 text-center">
                                        <div>
                                            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-400 mb-4">No projects yet</p>
                                            <Link
                                                href={route('projects.create')}
                                                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Upload your first project
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {projects.slice(0, 6).map((project) => (
                                            <Link
                                                key={project.id}
                                                href={route('projects.show', project.id)}
                                                className="group block"
                                            >
                                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 mb-2 relative">
                                                    {project.thumbnail_url ? (
                                                        <img
                                                            src={project.thumbnail_url}
                                                            alt={project.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Film className="w-8 h-8 text-slate-600" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" />
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-white truncate group-hover:text-amber-500 transition-colors">
                                                    {project.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
