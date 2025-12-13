import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';

export default function ProjectCard({ project, auth_user_id }) {
    const mediaUrl = project?.thumbnail_url || project?.video_url || null;
    const title = project?.title ?? 'Untitled Project';
    const creator = project?.user?.name ?? 'Unknown Creator';
    const [broken, setBroken] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);

    // Detect common video file extensions in the URL
    const isVideo = !!(project?.video_url && /\.(mp4|webm|ogg)(\?|$)/i.test(project.video_url));

    return (
        <Link
            href={route('projects.show', project.id)}
            className="block rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/10 overflow-hidden transform transition duration-200 ease-in-out hover:scale-[1.03]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card is navigation-only; show owner badges when applicable */}
            {auth_user_id && auth_user_id === project.user_id && (
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-2">
                    {/* Visibility badge */}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${project.visibility === 'public' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                        {project.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                    {/* Moderation badge */}
                    {project.moderation_status === 'pending' ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400 text-slate-900">Pending Review</span>
                    ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">Approved</span>
                    )}
                </div>
            )}
            {/* Add to Playlist button - stops propagation so user can interact without navigating */}
            <div className="absolute top-2 right-2 z-30">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // open modal and fetch playlists
                        setShowPlaylistModal(true);
                        if (!loadingPlaylists) {
                            setLoadingPlaylists(true);
                            fetch(route('playlists.index'), { headers: { Accept: 'application/json' } })
                                .then((r) => r.json())
                                .then((data) => {
                                    setPlaylists(data.data || data);
                                })
                                .catch(() => setPlaylists([]))
                                .finally(() => setLoadingPlaylists(false));
                        }
                    }}
                    className="bg-slate-800/60 text-amber-200 p-2 rounded hover:bg-slate-700"
                    title="Add to Playlist"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
            <div className="relative w-full pb-[56.25%] bg-slate-700">
                {!broken ? (
                    // If hovered and we have a video URL, show autoplaying muted preview
                    (isHovered && isVideo) ? (
                        <video
                            src={project.video_url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            poster={project.thumbnail_url || '/images/video-placeholder.jpg'}
                            className="absolute inset-0 w-full h-full object-cover bg-black"
                            onError={() => setBroken(true)}
                        />
                    ) : (
                            // Default: show thumbnail if available, otherwise a styled placeholder
                            project?.thumbnail_url ? (
                                <img
                                    src={project.thumbnail_url}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={() => setBroken(true)}
                            />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m0-4l-4.553-2.276A1 1 0 009 8.618v6.764a1 1 0 001.447.894L15 14m0-4v4" />
                                    </svg>
                                </div>
                            )
                        )
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            {/* Placeholder when no media is provided or file not found */}
                        <div className="text-center">
                                <div className="text-sm font-medium">File Not Found</div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mx-auto mt-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-900/20">
                <div className="text-amber-100 font-semibold text-lg truncate">{title}</div>
                <div className="text-amber-300 text-sm mt-1">{creator}</div>
            </div>

            {/* Playlists Modal */}
            {showPlaylistModal && (
                <div onClick={() => setShowPlaylistModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 rounded-lg shadow-lg w-full max-w-md p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-amber-100 font-semibold">Add to Playlist</div>
                            <button onClick={() => setShowPlaylistModal(false)} className="text-amber-200">Close</button>
                        </div>

                        {loadingPlaylists ? (
                            <div className="text-amber-300">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {playlists.length === 0 ? (
                                    <div className="text-amber-300">You have no playlists. Create one from the Playlists page.</div>
                                ) : (
                                    playlists.map((pl) => (
                                        <div key={pl.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                                            <div>
                                                <div className="font-semibold text-amber-100">{pl.title}</div>
                                                <div className="text-sm text-amber-300">{pl.projects_count ?? 0} videos</div>
                                            </div>
                                            <div>
                                                <button onClick={() => {
                                                    router.post(route('playlists.addProject', pl.id), { project_id: project.id }, {
                                                        onSuccess: () => { setShowPlaylistModal(false); }
                                                    });
                                                }} className="px-3 py-1 bg-amber-500 text-slate-900 rounded">Add</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Link>
    );
}
