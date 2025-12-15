import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { 
    CheckBadgeIcon,
    MapPinIcon,
    LinkIcon,
    CalendarIcon,
    UserPlusIcon,
    UserMinusIcon,
    PlayIcon,
    EyeIcon,
    HeartIcon,
    QueueListIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';

function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
                {Icon && <Icon className="w-4 h-4 text-amber-400" />}
                <span className="text-2xl font-bold text-amber-100">{value}</span>
            </div>
            <span className="text-sm text-gray-400">{label}</span>
        </div>
    );
}

function ProjectCard({ project }) {
    return (
        <Link
            href={route('premiere.show', project.slug || project.id)}
            className="group block"
        >
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-800/50 relative">
                {project.thumbnail_url ? (
                    <img 
                        src={project.thumbnail_url} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <PlayIcon className="w-12 h-12 text-gray-600" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-3 text-white text-xs">
                            <span className="flex items-center gap-1">
                                <EyeIcon className="w-4 h-4" />
                                {project.views_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <HeartIcon className="w-4 h-4" />
                                {project.likes_count || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <h3 className="mt-3 text-sm font-medium text-amber-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                {project.title}
            </h3>
        </Link>
    );
}

function PlaylistCard({ playlist }) {
    return (
        <Link
            href={route('playlists.show', playlist.id)}
            className="group block"
        >
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-800/50 relative">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/30 to-slate-900">
                    <QueueListIcon className="w-16 h-16 text-amber-400/50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-xs flex items-center gap-1">
                            <PlayIcon className="w-4 h-4" />
                            {playlist.projects_count || 0} videos
                        </span>
                    </div>
                </div>
            </div>
            <h3 className="mt-3 text-sm font-medium text-amber-100 group-hover:text-amber-400 transition-colors line-clamp-2">
                {playlist.title}
            </h3>
        </Link>
    );
}

function SocialLinks({ links }) {
    if (!links || Object.keys(links).length === 0) return null;

    const socialIcons = {
        twitter: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
        ),
        youtube: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
        ),
        instagram: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
        ),
        tiktok: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
        ),
        facebook: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        ),
        linkedin: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    };

    return (
        <div className="flex items-center gap-3">
            {Object.entries(links).map(([platform, url]) => {
                if (!url) return null;
                const icon = socialIcons[platform];
                return (
                    <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800/50 text-gray-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
                        title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    >
                        {icon}
                    </a>
                );
            })}
        </div>
    );
}

export default function CreatorShow({ creator, projects, playlists, isFollowing, stats, auth }) {
    const [following, setFollowing] = useState(isFollowing);
    const [followerCount, setFollowerCount] = useState(creator.followers_count || 0);
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowToggle = () => {
        if (!auth?.user) {
            // Redirect to login
            router.visit(route('login'));
            return;
        }

        setIsLoading(true);
        const action = following ? 'unfollow' : 'follow';
        
        router.post(
            following ? route('creator.unfollow', creator.id) : route('creator.follow', creator.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setFollowing(!following);
                    setFollowerCount(prev => following ? prev - 1 : prev + 1);
                },
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const joinedDate = new Date(creator.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <PublicLayout auth={auth}>
            <Head title={`${creator.display_name || creator.name} - Creator Profile`} />

            <div className="min-h-screen">
                {/* Banner */}
                <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-amber-900/50 to-slate-900">
                    {creator.banner_url && (
                        <img
                            src={creator.banner_url}
                            alt="Profile banner"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>

                {/* Profile Header */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-20 md:-mt-24 pb-8 border-b border-white/10">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-slate-800 border-4 border-slate-950 shadow-xl">
                                    {creator.avatar_url ? (
                                        <img
                                            src={creator.avatar_url}
                                            alt={creator.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-4xl font-bold text-white">
                                            {(creator.name || '?').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {creator.is_verified_creator && (
                                    <div className="absolute -bottom-2 -right-2 p-1 bg-slate-950 rounded-full">
                                        <CheckBadgeSolid className="w-7 h-7 text-amber-400" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl md:text-3xl font-bold text-amber-100">
                                                {creator.display_name || creator.name}
                                            </h1>
                                            {creator.is_verified_creator && (
                                                <CheckBadgeSolid className="w-6 h-6 text-amber-400 hidden md:block" />
                                            )}
                                        </div>
                                        {creator.username && (
                                            <p className="text-gray-400 mt-1">@{creator.username}</p>
                                        )}
                                        {creator.headline && (
                                            <p className="text-amber-100/80 mt-2 max-w-xl">{creator.headline}</p>
                                        )}
                                    </div>

                                    {/* Follow button */}
                                    {auth?.user?.id !== creator.id && (
                                        <button
                                            onClick={handleFollowToggle}
                                            disabled={isLoading}
                                            className={`
                                                flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
                                                ${following 
                                                    ? 'bg-slate-800 text-gray-300 hover:bg-red-500/20 hover:text-red-400 border border-white/10' 
                                                    : 'bg-amber-500 text-black hover:bg-amber-400'}
                                                disabled:opacity-50
                                            `}
                                        >
                                            {following ? (
                                                <>
                                                    <UserMinusIcon className="w-5 h-5" />
                                                    Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlusIcon className="w-5 h-5" />
                                                    Follow
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                                    {creator.location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPinIcon className="w-4 h-4" />
                                            {creator.location}
                                        </span>
                                    )}
                                    {creator.website && (
                                        <a
                                            href={creator.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                            {new URL(creator.website).hostname}
                                        </a>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-4 h-4" />
                                        Joined {joinedDate}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-8 mt-8">
                            <StatCard label="Followers" value={followerCount.toLocaleString()} />
                            <StatCard label="Following" value={(creator.following_count || 0).toLocaleString()} />
                            <StatCard label="Projects" value={(stats?.projects_count || projects?.data?.length || 0).toLocaleString()} icon={PlayIcon} />
                            <StatCard label="Total Views" value={(stats?.total_views || 0).toLocaleString()} icon={EyeIcon} />
                        </div>

                        {/* Bio */}
                        {creator.bio && (
                            <div className="mt-6 max-w-3xl">
                                <p className="text-gray-300 whitespace-pre-line">{creator.bio}</p>
                            </div>
                        )}

                        {/* Social links */}
                        {creator.social_links && (
                            <div className="mt-6">
                                <SocialLinks links={creator.social_links} />
                            </div>
                        )}
                    </div>

                    {/* Projects */}
                    <div className="py-8">
                        <h2 className="text-xl font-semibold text-amber-100 mb-6">Projects</h2>
                        
                        {projects?.data?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projects.data.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-white/5">
                                <PlayIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">No projects yet</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {projects?.links && projects.links.length > 3 && (
                            <div className="mt-8 flex justify-center">
                                <nav className="flex items-center gap-1">
                                    {projects.links.map((link, index) => (
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

                    {/* Public Playlists */}
                    {playlists && playlists.length > 0 && (
                        <div className="py-8 border-t border-white/10">
                            <h2 className="text-xl font-semibold text-amber-100 mb-6 flex items-center gap-2">
                                <QueueListIcon className="w-6 h-6 text-amber-400" />
                                Public Playlists
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {playlists.map((playlist) => (
                                    <PlaylistCard key={playlist.id} playlist={playlist} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
